import type {
  Id,
  Ids,
  Manager,
  ManagerConfig,
  Task,
  TaskRunConfig,
  TaskRunInfo,
  Timestamp,
  createManager as createManagerDecl,
} from './@types/index.js';
import {
  IdMap,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from './common/map.ts';
import {
  getUniqueId,
  ifNotUndefined,
  isPositiveNumber,
  isUndefined,
} from './common/other.ts';
import {id, isString} from './common/strings.ts';
import {objFreeze, objMerge, objValidate} from './common/obj.ts';
import {arrayMap} from './common/array.ts';

const RETRY_PATTERN = /^\d+(,\d+)*$/;

const DEFAULT_MANAGER_CONFIG: ManagerConfig = {
  tickInterval: 1,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfig = {
  maxDuration: 1,
  maxRetries: 2,
  retryDelay: 3,
};

const managerConfigValidators: {[id: string]: (child: any) => boolean} = {
  tickInterval: isPositiveNumber,
};

const taskRunConfigValidators: {[id: string]: (child: any) => boolean} = {
  maxDuration: isPositiveNumber,
  maxRetries: isPositiveNumber,
  retryDelay: (child: any) =>
    isPositiveNumber(child) || (isString(child) && RETRY_PATTERN.test(child)),
};

const validatedTestRunConfig = (config: TaskRunConfig): TaskRunConfig =>
  objValidate(config, (child, id) => taskRunConfigValidators[id]?.(child))
    ? config
    : {};

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<
    [
      arg: string | undefined,
      taskId: Id,
      config: TaskRunConfig,
      started?: Timestamp,
    ]
  > = mapNew();

  const tick = () => {
    mapForEach(taskRunMap, (taskRunId, taskRun) =>
      ifNotUndefined(
        mapGet(taskMap, taskRun[1]),
        ([task]) => {
          if (isUndefined(taskRun[3])) {
            taskRun[3] = Date.now();
            task(taskRun[0], manager).then(() => delTaskRun(taskRunId));
          }
        },
        () => {
          delTaskRun(taskRunId);
        },
      ),
    );
    start();
  };

  const fluent = (
    actions: (...idArgs: Id[]) => unknown,
    ...args: unknown[]
  ): Manager => {
    actions(...arrayMap(args, id));
    return manager;
  };

  // --

  const setManagerConfig = (managerConfig: ManagerConfig): Manager =>
    fluent(() =>
      objValidate(managerConfig, (child, id) =>
        managerConfigValidators[id]?.(child),
      )
        ? (config = managerConfig)
        : 0,
    );

  const getManagerConfig = (withDefaults: boolean = false): ManagerConfig =>
    objMerge(withDefaults ? DEFAULT_MANAGER_CONFIG : {}, config);

  const setCategory = (categoryId: Id, config: TaskRunConfig): Manager =>
    fluent(
      (categoryId) =>
        mapSet(categoryMap, categoryId, validatedTestRunConfig(config)),
      categoryId,
    );

  const getCategoryConfig = (
    categoryId: Id,
    withDefaults: boolean = false,
  ): TaskRunConfig | undefined =>
    ifNotUndefined(mapGet(categoryMap, id(categoryId)), (config) =>
      objMerge(withDefaults ? DEFAULT_TASK_RUN_CONFIG : {}, config),
    );

  const getCategoryIds = (): Ids => mapKeys(categoryMap);

  const delCategory = (categoryId: Id): Manager =>
    fluent((categoryId) => mapSet(categoryMap, categoryId), categoryId);

  const setTask = (
    taskId: Id,
    task: Task,
    categoryId?: Id,
    config: TaskRunConfig = {},
  ): Manager =>
    fluent(
      (taskId, categoryId) =>
        mapSet(taskMap, taskId, [
          task,
          categoryId,
          validatedTestRunConfig(config),
        ]),
      taskId,
      categoryId,
    );

  const getTaskConfig = (
    taskId: Id,
    withDefaults: boolean = false,
  ): TaskRunConfig | undefined =>
    ifNotUndefined(mapGet(taskMap, id(taskId)), ([, categoryId, config]) =>
      objMerge(
        withDefaults ? DEFAULT_TASK_RUN_CONFIG : {},
        withDefaults && !isUndefined(categoryId)
          ? (getCategoryConfig(categoryId) ?? {})
          : {},
        config,
      ),
    );

  const getTaskIds = (): Ids => mapKeys(taskMap);

  const delTask = (taskId: Id): Manager =>
    fluent((taskId) => mapSet(taskMap, taskId), taskId);

  const setTaskRun = (
    taskId: Id,
    arg?: string,
    config: TaskRunConfig = {},
  ): Id => {
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, [
      arg,
      taskId,
      validatedTestRunConfig(config),
    ]);
    return taskRunId;
  };

  const getTaskRunConfig = (
    taskRunId: Id,
    withDefaults: boolean = false,
  ): TaskRunConfig | undefined =>
    ifNotUndefined(mapGet(taskRunMap, id(taskRunId)), ([, taskId, config]) =>
      objMerge(
        withDefaults ? DEFAULT_TASK_RUN_CONFIG : {},
        withDefaults ? (getTaskConfig(taskId, true) ?? {}) : {},
        config,
      ),
    );

  const getTaskRunInfo = (taskRunId: Id): TaskRunInfo =>
    ifNotUndefined(
      mapGet(taskRunMap, id(taskRunId)),
      ([arg, taskId, , started]) => ({taskId, arg, started}),
    ) ?? {};

  const delTaskRun = (taskRunId: Id) =>
    fluent((taskRunId) => mapSet(taskRunMap, taskRunId), taskRunId);

  const start = () =>
    fluent(() => {
      stop();
      tickHandle = setTimeout(
        tick,
        getManagerConfig(true).tickInterval! * 1000,
      );
    });

  const stop = () =>
    fluent(() => (isUndefined(tickHandle) ? 0 : clearTimeout(tickHandle)));

  const manager: Manager = {
    setManagerConfig,
    getManagerConfig,

    setCategory,
    getCategoryConfig,
    getCategoryIds,
    delCategory,

    setTask,
    getTaskConfig,
    getTaskIds,
    delTask,

    setTaskRun,
    getTaskRunConfig,
    getTaskRunInfo,
    delTaskRun,

    start,
    stop,
  };

  return objFreeze(manager);
};
