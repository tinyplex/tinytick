import type {
  DurationMs,
  Id,
  Ids,
  Manager,
  ManagerConfig,
  ManagerConfigWithDefaults,
  Task,
  TaskRunConfig,
  TaskRunConfigWithDefaults,
  TaskRunInfo,
  TimestampMs,
  createManager as createManagerDecl,
} from './@types/index.js';
import {IdMap, mapGet, mapKeys, mapNew, mapSet} from './common/map.ts';
import {arrayMap, arraySplice} from './common/array.ts';
import {
  getNow,
  getUniqueId,
  ifNotUndefined,
  isPositiveNumber,
  isUndefined,
  normalizeTimestamp,
  size,
} from './common/other.ts';
import {id, isString} from './common/strings.ts';
import {
  objFilterUndefined,
  objFreeze,
  objMerge,
  objValidate,
} from './common/obj.ts';

type TaskRun = [
  taskId: Id,
  arg: string | undefined,
  startAfterTimestamp: TimestampMs,
  config: TaskRunConfig,
  index: number,
  resolvedConfig?: {
    maxDuration: DurationMs;
    maxRetries: number;
    retryDelay: number | string;
  },
];
const TASK_ID = 0;
const ARG = 1;
const INDEX = 4;
const RESOLVED_CONFIG = 5;

const RETRY_PATTERN = /^(\d*\.?\d+)(,\d*\.?\d+)*$/;

const DEFAULT_MANAGER_CONFIG: ManagerConfigWithDefaults = {
  tickInterval: 100,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfigWithDefaults = {
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

const insertTaskRun = (
  taskRuns: [taskRunId: Id, timestamp: TimestampMs][],
  taskRunId: Id,
  timestamp: TimestampMs,
): number => {
  const nextIndex = taskRuns.findIndex(
    ([, existingTimestamp]) => existingTimestamp > timestamp,
  );
  const index = nextIndex == -1 ? size(taskRuns) : nextIndex;
  arraySplice(taskRuns, index, 0, [taskRunId, timestamp]);
  return index;
};

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<TaskRun> = mapNew();
  const pendingTaskRuns: [taskRunId: Id, startAfterTimestamp: TimestampMs][] =
    [];
  const runningTaskRuns: [taskRunId: Id, finishAfterTimestamp: TimestampMs][] =
    [];

  const tick = () => {
    const now = getNow();
    while (size(pendingTaskRuns) && pendingTaskRuns[0][1] <= now) {
      const [taskRunId] = pendingTaskRuns.shift()!;
      const taskRun = mapGet(taskRunMap, taskRunId)!;
      ifNotUndefined(
        mapGet(taskMap, taskRun[TASK_ID]),
        ([task]) => {
          const resolvedConfig = getTaskRunConfig(taskRunId, true);
          taskRun[RESOLVED_CONFIG] = resolvedConfig;
          taskRun[INDEX] = insertTaskRun(
            runningTaskRuns,
            taskRunId,
            now + resolvedConfig.maxDuration,
          );
          task(taskRun[ARG], manager).then(() => delTaskRun(taskRunId));
        },
        () => delTaskRun(taskRunId) as any,
      );
    }
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

  const getManagerConfig = <WithDefaults extends boolean>(
    withDefaults?: WithDefaults,
  ): WithDefaults extends true ? ManagerConfigWithDefaults : ManagerConfig =>
    objMerge(withDefaults ? DEFAULT_MANAGER_CONFIG : {}, config);

  const setCategory = (categoryId: Id, config: TaskRunConfig): Manager =>
    fluent(
      (categoryId) =>
        mapSet(categoryMap, categoryId, validatedTestRunConfig(config)),
      categoryId,
    );

  const getCategoryConfig = <WithDefaults extends boolean>(
    categoryId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined =>
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

  const getTaskConfig = <WithDefaults extends boolean>(
    taskId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined =>
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
    const startAfterTimestamp = normalizeTimestamp(startAfter);
    const index = insertTaskRun(
      pendingTaskRuns,
      taskRunId,
      startAfterTimestamp,
    );

    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      startAfterTimestamp,
      validatedTestRunConfig(config),
      index,
    ]);
    return taskRunId;
  };

  const getTaskRunConfig = <WithDefaults extends boolean>(
    taskRunId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined =>
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
      ([taskId, arg, startAfter, , , resolvedConfig]) =>
        objFilterUndefined({
          taskId,
          arg,
          startAfter,
          running: isUndefined(resolvedConfig) ? undefined : true,
        }),
    );

  const delTaskRun = (taskRunId: Id) =>
    fluent((taskRunId) => {
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        arraySplice(pendingTaskRuns, taskRun[INDEX], 1);
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
