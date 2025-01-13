import type {
  CategoryConfig,
  Id,
  Ids,
  Manager,
  ManagerConfig,
  Seconds,
  Task,
  TaskConfig,
  Timestamp,
  createManager as createManagerDecl,
} from './@types/index.js';
import {IdMap, mapGet, mapKeys, mapNew, mapSet} from './common/map.ts';
import {
  getUniqueId,
  ifNotUndefined,
  isPositiveNumber,
  isUndefined,
} from './common/other.ts';
import {id, isString} from './common/strings.ts';
import {objFreeze, objMerge, objValidate} from './common/obj.ts';
import {arrayMap} from './common/array.ts';

type TaskRunInfo = {
  readonly taskId: Id;
  readonly arg?: string;
  started?: Timestamp;
};

const RETRY_PATTERN = /^\d+(,\d+)*$/;

const DEFAULT_MANAGER_CONFIG: ManagerConfig = {
  tickInterval: 1,
};

const DEFAULT_TASK_CONFIG: CategoryConfig = {
  maxDuration: 1,
  maxRetries: 2,
  retryDelay: 3,
};

const managerConfigValidators: {[id: string]: (child: any) => boolean} = {
  tickInterval: isPositiveNumber,
};

const categoryConfigValidators: {[id: string]: (child: any) => boolean} = {
  maxDuration: isPositiveNumber,
  maxRetries: isPositiveNumber,
  retryDelay: (child: any) =>
    isPositiveNumber(child) || (isString(child) && RETRY_PATTERN.test(child)),
};

const taskConfigValidators: {[id: string]: (child: any) => boolean} = {
  categoryId: isString,
  ...categoryConfigValidators,
};

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  const categoryMap: IdMap<CategoryConfig> = mapNew();
  const taskMap: IdMap<[Task, TaskConfig]> = mapNew();
  const taskRunMap: IdMap<TaskRunInfo> = mapNew();

  const tick = () => {
    taskRunMap.forEach((taskRunInfo, taskRunId) =>
      ifNotUndefined(
        mapGet(taskMap, taskRunInfo.taskId),
        ([task, _taskConfig]) => {
          taskRunInfo.started = Date.now();
          task(taskRunInfo, manager);
        },
        () => {
          unscheduleTaskRun(taskRunId);
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

  const setManagerConfig = (managerConfig: ManagerConfig) =>
    fluent(() =>
      objValidate(managerConfig, (child, id) =>
        managerConfigValidators[id]?.(child),
      )
        ? (config = managerConfig)
        : 0,
    );

  const getManagerConfig = (withDefaults = false): ManagerConfig =>
    objMerge(withDefaults ? DEFAULT_MANAGER_CONFIG : {}, config);

  const setTask = (taskId: Id, task: Task, taskConfig: TaskConfig = {}) =>
    fluent((taskId) => mapSet(taskMap, taskId, [task, taskConfig]), taskId);

  const setTaskConfig = (taskId: Id, taskConfig: TaskConfig) =>
    fluent(
      (taskId) =>
        ifNotUndefined(mapGet(taskMap, taskId), (taskAndConfig) =>
          objValidate(taskConfig, (child, id) =>
            taskConfigValidators[id]?.(child),
          )
            ? (taskAndConfig[1] = taskConfig)
            : 0,
        ),
      taskId,
    );

  const getTaskConfig = (taskId: Id, withDefaults = false) =>
    ifNotUndefined(mapGet(taskMap, id(taskId)), ([, taskConfig]) =>
      objMerge(
        withDefaults
          ? ifNotUndefined(
              taskConfig.categoryId,
              (categoryId) => getCategoryConfig(categoryId, true),
              () => DEFAULT_TASK_CONFIG,
            )
          : {},
        taskConfig,
      ),
    );

  const getTaskIds = (): Ids => mapKeys(taskMap);

  const delTask = (taskId: Id) =>
    fluent((taskId) => mapSet(taskMap, taskId), taskId);

  const setCategoryConfig = (categoryId: Id, config?: CategoryConfig) =>
    fluent(
      (categoryId) =>
        objValidate(config, (child, id) =>
          categoryConfigValidators[id]?.(child),
        )
          ? mapSet(categoryMap, categoryId, config)
          : 0,
      categoryId,
    );

  const getCategoryConfig = (categoryId: Id, withDefaults = false) =>
    ifNotUndefined(mapGet(categoryMap, id(categoryId)), (categoryConfig) =>
      objMerge(withDefaults ? DEFAULT_TASK_CONFIG : {}, categoryConfig),
    );

  const getCategoryIds = (): Ids => mapKeys(categoryMap);

  const delCategory = (categoryId: Id) =>
    fluent((categoryId) => mapSet(categoryMap, categoryId), categoryId);

  const scheduleTaskRun = (
    taskId: Id,
    arg?: string,
    _after: Seconds | Timestamp = 0,
    _before: Seconds | Timestamp = Infinity,
  ) => {
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, {
      taskId,
      ...(arg !== undefined ? {arg} : {}),
    });
    return taskRunId;
  };

  const getTaskRunInfo = (taskRunId: Id) => mapGet(taskRunMap, taskRunId);

  const unscheduleTaskRun = (taskRunId: Id) =>
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

    setTask,
    setTaskConfig,
    getTaskConfig,
    getTaskIds,
    delTask,

    setCategoryConfig,
    getCategoryConfig,
    getCategoryIds,
    delCategory,

    scheduleTaskRun,
    getTaskRunInfo,
    unscheduleTaskRun,

    start,
    stop,
  };

  return objFreeze(manager);
};
