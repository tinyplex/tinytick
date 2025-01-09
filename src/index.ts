import type {
  CategoryConfig,
  Id,
  Ids,
  Manager,
  ManagerConfig,
  Seconds,
  Task,
  TaskConfig,
  TaskRunInfo,
  Timestamp,
  createManager as createManagerDecl,
} from './@types/index.js';
import {EMPTY_STRING, id} from './common/strings.ts';
import {IdMap, mapGet, mapKeys, mapNew, mapSet} from './common/map.ts';
import {getUniqueId, ifNotUndefined} from './common/other.ts';
import {objFreeze, objMerge, objValidate} from './common/obj.ts';
import {arrayMap} from './common/array.ts';

const RETRY_PATTERN = /^\d+(,\d+)*$/;

const DEFAULT_CONFIG: CategoryConfig = {
  maxDuration: 1,
  maxRetries: 2,
  retryDelay: 3,
};

const isString = (child: any) => typeof child == 'string';

const isPositiveNumber = (child: any) => typeof child == 'number' && child > 0;

const managerConfigValidators: {[id: string]: (child: any) => boolean} = {
  tickInterval: isPositiveNumber,
};

const categoryConfigValidators: {[id: string]: (child: any) => boolean} = {
  maxDuration: isPositiveNumber,
  maxRetries: isPositiveNumber,
  retryDelay: (child: any) =>
    isPositiveNumber(child) ||
    (typeof child == 'string' && RETRY_PATTERN.test(child)),
};

const taskConfigValidators: {[id: string]: (child: any) => boolean} = {
  categoryId: isString,
  ...categoryConfigValidators,
};

export const createManager: typeof createManagerDecl = (): Manager => {
  let validConfig: ManagerConfig = {};
  const categoryMap: IdMap<CategoryConfig> = mapNew();
  const taskMap: IdMap<[Task, TaskConfig]> = mapNew();
  const taskRunMap: IdMap<TaskRunInfo> = mapNew();

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
        ? (validConfig = managerConfig)
        : 0,
    );

  const getManagerConfig = (): ManagerConfig => objMerge(validConfig);

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
              () => DEFAULT_CONFIG,
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
        objValidate(
          config,
          (child, id) => categoryConfigValidators[id]?.(child),
          undefined,
          1,
        )
          ? mapSet(categoryMap, categoryId, config)
          : 0,
      categoryId,
    );

  const getCategoryConfig = (categoryId: Id, withDefaults = false) =>
    ifNotUndefined(mapGet(categoryMap, id(categoryId)), (categoryConfig) =>
      objMerge(withDefaults ? DEFAULT_CONFIG : {}, categoryConfig),
    );

  const getCategoryIds = (): Ids => mapKeys(categoryMap);

  const delCategory = (categoryId: Id) =>
    fluent((categoryId) => mapSet(categoryMap, categoryId), categoryId);

  const scheduleTaskRun = (
    taskId: Id,
    arg: string = EMPTY_STRING,
    _after: Seconds | Timestamp = 0,
    _before: Seconds | Timestamp = Infinity,
  ) => {
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, {taskId, arg, started: null});
    return taskRunId;
  };

  const getTaskRunInfo = (taskRunId: Id) => mapGet(taskRunMap, taskRunId);

  const unscheduleTaskRun = (taskRunId: Id) =>
    fluent((taskRunId) => mapSet(taskRunMap, taskRunId), taskRunId);

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
  };

  return objFreeze(manager);
};
