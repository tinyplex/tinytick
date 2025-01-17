import type {
  DurationMs,
  Id,
  Ids,
  Manager,
  ManagerConfig,
  Task,
  TaskRunConfig,
  TaskRunInfo,
  TimestampMs,
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
  getNow,
  getUniqueId,
  ifNotUndefined,
  isPositiveNumber,
  isUndefined,
  size,
  toTimestamp,
} from './common/other.ts';
import {id, isString} from './common/strings.ts';
import {
  objFilterUndefined,
  objFreeze,
  objMerge,
  objValidate,
} from './common/obj.ts';
import {arrayMap} from './common/array.ts';

type TaskRun = [
  taskId: Id,
  arg: string | undefined,
  startAfter: TimestampMs,
  config: TaskRunConfig,
  index: number,
  started?: TimestampMs,
];
const TASK_ID = 0;
const ARG = 1;
const INDEX = 4;
const STARTED = 5;

const RETRY_PATTERN = /^(\d*\.?\d+)(,\d*\.?\d+)*$/;

const DEFAULT_MANAGER_CONFIG: ManagerConfig = {
  tickInterval: 100,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfig = {
  maxDuration: 1000,
  maxRetries: 2,
  retryDelay: 3000,
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
  const taskRunMap: IdMap<TaskRun> = mapNew();
  const taskRunIndex: [taskRunId: Id, startAfter: TimestampMs][] = [];

  const tick = () => {
    mapForEach(taskRunMap, (taskRunId, taskRun) =>
      ifNotUndefined(
        mapGet(taskMap, taskRun[TASK_ID]),
        ([task]) => {
          if (isUndefined(taskRun[STARTED])) {
            taskRun[STARTED] = getNow();
            task(taskRun[ARG], manager).then(() => delTaskRun(taskRunId));
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
    startAfter: TimestampMs | DurationMs = 0,
    config: TaskRunConfig = {},
  ): Id => {
    const taskRunId = getUniqueId();
    const startAfterTimestamp = toTimestamp(startAfter);
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      startAfterTimestamp,
      validatedTestRunConfig(config),
      size(taskRunIndex),
    ]);
    taskRunIndex.push([taskRunId, startAfterTimestamp]);
    return taskRunId;
  };

  const getTaskRunConfig = (
    taskRunId: Id,
    withDefaults: boolean = false,
  ): TaskRunConfig | undefined =>
    ifNotUndefined(mapGet(taskRunMap, id(taskRunId)), ([taskId, , , config]) =>
      objMerge(
        withDefaults ? DEFAULT_TASK_RUN_CONFIG : {},
        withDefaults ? (getTaskConfig(taskId, true) ?? {}) : {},
        config,
      ),
    );

  const getTaskRunInfo = (taskRunId: Id): TaskRunInfo | undefined =>
    ifNotUndefined(
      mapGet(taskRunMap, id(taskRunId)),
      ([taskId, arg, startAfter, , , started]) =>
        objFilterUndefined({taskId, arg, startAfter, started}),
    );

  const delTaskRun = (taskRunId: Id) =>
    fluent((taskRunId) => {
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        taskRunIndex.splice(taskRun[INDEX], 1);
        mapSet(taskRunMap, taskRunId);
      });
    }, taskRunId);

  const start = () =>
    fluent(() => {
      stop();
      tickHandle = setTimeout(tick, getManagerConfig(true).tickInterval!);
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
    getNow,
  };

  return objFreeze(manager);
};
