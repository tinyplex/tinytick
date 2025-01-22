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
import {
  arrayFilter,
  arrayMap,
  arrayShift,
  arraySplice,
} from './common/array.ts';
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

type TimestampPair = [taskRunId: Id | null, timestamp: TimestampMs];

type TaskRun = [
  taskId: Id,
  arg: string | undefined,
  startAfter: TimestampMs,
  config: TaskRunConfig,
  retry: number,
  running: boolean,
  timestampPair: TimestampPair,

  abortController?: AbortController,
  duration?: DurationMs,
  retries?: number,
  delays?: number[],
];
const TASK_ID = 0;
const ARG = 1;
const RETRY = 4;
const RUNNING = 5;
const TIMESTAMP_PAIR = 6;
const ABORT_CONTROLLER = 7;
const DURATION = 8;
const RETRIES = 9;
const DELAYS = 10;

const TICK_INTERVAL = 'tickInterval';
const MAX_DURATION = 'maxDuration';
const MAX_RETRIES = 'maxRetries';
const RETRY_DELAY = 'retryDelay';

const RETRY_PATTERN = /^(\d*\.?\d+)(, ?\d*\.?\d+)*$/;

const DEFAULT_MANAGER_CONFIG: ManagerConfigWithDefaults = {
  [TICK_INTERVAL]: 100,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfigWithDefaults = {
  [MAX_DURATION]: 1000,
  [MAX_RETRIES]: 2,
  [RETRY_DELAY]: 3000,
};

const managerConfigValidators: {[id: string]: (child: any) => boolean} = {
  [TICK_INTERVAL]: isPositiveNumber,
};

const taskRunConfigValidators: {[id: string]: (child: any) => boolean} = {
  [MAX_DURATION]: isPositiveNumber,
  [MAX_RETRIES]: isPositiveNumber,
  [RETRY_DELAY]: (child: any) =>
    isPositiveNumber(child) || (isString(child) && RETRY_PATTERN.test(child)),
};

const validatedTestRunConfig = (config: TaskRunConfig): TaskRunConfig =>
  objValidate(config, (child, id) => taskRunConfigValidators[id]?.(child))
    ? config
    : {};

const insertTimestampPair = (
  taskRuns: TimestampPair[],
  taskRunId: Id,
  timestamp: TimestampMs,
): TimestampPair => {
  const nextIndex = taskRuns.findIndex(
    ([, existingTimestamp]) => existingTimestamp > timestamp,
  );
  const timestampPair: TimestampPair = [taskRunId, timestamp];
  arraySplice(
    taskRuns,
    nextIndex == -1 ? size(taskRuns) : nextIndex,
    0,
    timestampPair,
  );
  return timestampPair;
};

const abortTaskRun = (taskRun: TaskRun): void =>
  taskRun[ABORT_CONTROLLER]?.abort();

const getTaskRunIds = (taskRuns: TimestampPair[]): Ids =>
  arrayFilter(
    arrayMap(taskRuns, ([taskRunId]) => taskRunId),
    isString,
  ) as Ids;

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<TaskRun> = mapNew();
  const scheduledTaskRuns: [taskRunId: Id, startAfterTimestamp: TimestampMs][] =
    [];
  const runningTaskRuns: [taskRunId: Id, finishAfterTimestamp: TimestampMs][] =
    [];

  const tick = () => {
    const now = getNow();
    while (size(scheduledTaskRuns) && scheduledTaskRuns[0][1] <= now) {
      const [taskRunId] = arrayShift(scheduledTaskRuns)!;
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) =>
        ifNotUndefined(
          mapGet(taskMap, taskRun[TASK_ID]),
          ([task]) => {
            if (isUndefined(taskRun[DURATION])) {
              const config = getTaskRunConfig(taskRunId, true);
              const retryDelay = config[RETRY_DELAY];
              taskRun[DURATION] = config[MAX_DURATION];
              taskRun[RETRIES] = config[MAX_RETRIES];
              taskRun[DELAYS] = isString(retryDelay)
                ? retryDelay.split(',').map((number) => parseInt(number))
                : [retryDelay];
            }
            taskRun[TIMESTAMP_PAIR] = insertTimestampPair(
              runningTaskRuns,
              taskRunId,
              now + taskRun[DURATION],
            );
            taskRun[RUNNING] = true;
            taskRun[ABORT_CONTROLLER] = new AbortController();

            task(taskRun[ARG], taskRun[ABORT_CONTROLLER].signal, manager).then(
              () => {
                if (taskRun[RUNNING]) {
                  taskRun[TIMESTAMP_PAIR]![0] = null;
                  mapSet(taskRunMap, taskRunId);
                }
              },
            );
          },
          () => delTaskRun(taskRunId) as any,
        ),
      );
    }
    while (
      size(runningTaskRuns) &&
      (isUndefined(runningTaskRuns[0][0]) || runningTaskRuns[0][1] <= now)
    ) {
      const [taskRunId] = arrayShift(runningTaskRuns)!;
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        abortTaskRun(taskRun);
        if (taskRun[RETRIES]!-- > 0) {
          const delays = taskRun[DELAYS]!;
          const delay = size(delays) > 1 ? delays.shift() : delays[0];
          taskRun[RETRY]++;
          taskRun[RUNNING] = false;
          taskRun[TIMESTAMP_PAIR] = insertTimestampPair(
            scheduledTaskRuns,
            taskRunId,
            now + delay!,
          );
          taskRun[ABORT_CONTROLLER] = undefined;
        } else {
          delTaskRun(taskRunId);
        }
      });
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

  const scheduleTaskRun = (
    taskId: Id,
    arg?: string,
    startAfter: TimestampMs | DurationMs = 0,
    config: TaskRunConfig = {},
  ): Id => {
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      normalizeTimestamp(startAfter),
      validatedTestRunConfig(config),
      0,
      false,
      insertTimestampPair(
        scheduledTaskRuns,
        taskRunId,
        normalizeTimestamp(startAfter),
      ),
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
      ([taskId, arg, , , retry, running, [, nextTimestamp]]) =>
        objFilterUndefined({
          taskId,
          arg,
          retry,
          running,
          nextTimestamp,
        }),
    );

  const delTaskRun = (taskRunId: Id): Manager =>
    fluent(
      (taskRunId) =>
        ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
          abortTaskRun(taskRun);
          taskRun[TIMESTAMP_PAIR]![0] = null;
          mapSet(taskRunMap, taskRunId);
        }),
      taskRunId,
    );

  const getScheduledTaskRunIds = (): Ids => getTaskRunIds(scheduledTaskRuns);

  const getRunningTaskRunIds = (): Ids => getTaskRunIds(runningTaskRuns);

  const start = (): Manager =>
    fluent(() => {
      stop();
      tickHandle = setTimeout(tick, getManagerConfig(true)[TICK_INTERVAL]!);
    });

  const stop = (): Manager =>
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

    scheduleTaskRun,
    getTaskRunConfig,
    getTaskRunInfo,
    delTaskRun,

    getScheduledTaskRunIds,
    getRunningTaskRunIds,

    start,
    stop,
    getNow,
  };

  return objFreeze(manager);
};
