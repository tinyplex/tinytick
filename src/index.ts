import type {
  DurationMs,
  Id,
  IdAddedOrRemoved,
  Ids,
  Manager,
  ManagerConfig,
  ManagerConfigWithDefaults,
  ManagerStatus,
  Task,
  TaskRunConfig,
  TaskRunConfigWithDefaults,
  TaskRunIdsListener,
  TaskRunInfo,
  TimestampMs,
  createManager as createManagerDecl,
} from './@types/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayMap,
  arrayShift,
  arraySplice,
  arraySplit,
} from './common/array.ts';
import {collClear, collIsEmpty} from './common/coll.ts';
import {getListenerFunctions} from './common/listeners.ts';
import {
  IdMap,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
  mapToObj,
} from './common/map.ts';
import {
  objFilterUndefined,
  objFreeze,
  objMerge,
  objValidate,
} from './common/obj.ts';
import {
  getNow,
  getUniqueId,
  ifNotUndefined,
  isEmpty,
  isPositiveNumber,
  isUndefined,
  normalizeTimestamp,
  size,
} from './common/other.ts';
import {Pair, pairNewMap} from './common/pairs.ts';
import {IdSet2} from './common/set.ts';
import {id, isString} from './common/strings.ts';

type ChangedIdsMap = IdMap<IdAddedOrRemoved>;

type TimestampPair = [taskRunId: Id | null, timestamp: TimestampMs];

type TaskRun = [
  taskId: Id,
  arg: string | undefined,
  startAfter: TimestampMs,
  config: TaskRunConfig,
  retry: number,
  running: boolean,
  nextTimestamp: TimestampMs,

  abortController?: AbortController,
  duration?: DurationMs,
  retries?: number,
  delays?: number[],
];
const TASK_ID = 0;
const ARG = 1;
const RETRY = 4;
const RUNNING = 5;
const NEXT_TIMESTAMP = 6;
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
  [MAX_RETRIES]: 0,
  [RETRY_DELAY]: 1000,
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

const abortTaskRun = (taskRun: TaskRun): void =>
  taskRun[ABORT_CONTROLLER]?.abort();

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  let status: ManagerStatus = 0;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<TaskRun> = mapNew();

  const taskRunIdsListeners: Pair<IdSet2> = pairNewMap();
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => manager,
  );

  const allTaskRunTimestampPairs: [
    scheduled: [taskRunId: Id, startAfterTimestamp: TimestampMs][],
    running: [taskRunId: Id, finishAfterTimestamp: TimestampMs][],
  ] = [[], []];

  const allTaskRunIdsChanged: [
    scheduled: ChangedIdsMap,
    running: ChangedIdsMap,
  ] = [mapNew(), mapNew()];

  const idsChanged = (
    changedIds: ChangedIdsMap,
    id: Id,
    addedOrRemoved: IdAddedOrRemoved,
  ): ChangedIdsMap =>
    mapSet(
      changedIds,
      id,
      mapGet(changedIds, id) == -addedOrRemoved ? undefined : addedOrRemoved,
    ) as ChangedIdsMap;

  const insertTimestampPair = (
    scheduledOrRunning: 0 | 1,
    taskRunId: Id,
    timestamp: TimestampMs,
  ): TimestampMs => {
    const taskRunTimestampPairs = allTaskRunTimestampPairs[scheduledOrRunning];
    const nextIndex = taskRunTimestampPairs.findIndex(
      ([, existingTimestamp]) => existingTimestamp > timestamp,
    );
    const timestampPair: TimestampPair = [taskRunId, timestamp];
    arraySplice(
      taskRunTimestampPairs,
      nextIndex == -1 ? size(taskRunTimestampPairs) : nextIndex,
      0,
      timestampPair,
    );
    idsChanged(allTaskRunIdsChanged[scheduledOrRunning], taskRunId, 1);
    return timestamp;
  };

  const removeTimestampPair = (
    scheduledOrRunning: 0 | 1,
    taskRunId: Id,
  ): void => {
    const taskRunTimestampPairs = allTaskRunTimestampPairs[scheduledOrRunning];
    const index = taskRunTimestampPairs.findIndex(([id]) => id == taskRunId);
    if (index != -1) {
      arraySplice(taskRunTimestampPairs, index, 1);
      idsChanged(allTaskRunIdsChanged[scheduledOrRunning], taskRunId, -1);
    }
  };

  const shiftTimestampPair = (scheduledOrRunning: 0 | 1): Id => {
    const [taskRunId] = arrayShift(
      allTaskRunTimestampPairs[scheduledOrRunning],
    )!;
    idsChanged(allTaskRunIdsChanged[scheduledOrRunning], taskRunId, -1);
    return taskRunId;
  };

  const getTaskRunIds = (scheduledOrRunning: 0 | 1): Ids =>
    arrayFilter(
      arrayMap(
        allTaskRunTimestampPairs[scheduledOrRunning],
        ([taskRunId]) => taskRunId,
      ),
      isString,
    ) as Ids;

  const callTaskRunIdsListeners = (): void =>
    arrayForEach(allTaskRunIdsChanged, (taskRunIdsChanged, i) => {
      if (!collIsEmpty(taskRunIdsChanged)) {
        callListeners(
          taskRunIdsListeners[i],
          undefined,
          mapToObj(taskRunIdsChanged),
        );
        collClear(taskRunIdsChanged);
      }
    });

  const tick = () => {
    const now = getNow();
    const [scheduledTaskRuns, runningTaskRuns] = allTaskRunTimestampPairs;
    callTaskRunIdsListeners();

    // Check for scheduled task runs overdue to start
    while (size(scheduledTaskRuns) && scheduledTaskRuns[0][1] <= now) {
      const taskRunId = shiftTimestampPair(0);
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
                ? arrayMap(arraySplit(retryDelay, ','), (number) =>
                    parseInt(number),
                  )
                : [retryDelay];
            }
            taskRun[NEXT_TIMESTAMP] = insertTimestampPair(
              1,
              taskRunId,
              now + taskRun[DURATION],
            );
            taskRun[RUNNING] = true;
            taskRun[ABORT_CONTROLLER] = new AbortController();

            task(
              taskRun[ARG],
              taskRun[ABORT_CONTROLLER].signal,
              getTaskRunInfoFromTaskRun(taskRunId, taskRun),
            )
              .then(() => {
                if (taskRun[RUNNING]) {
                  removeTimestampPair(1, taskRunId);
                  mapSet(taskRunMap, taskRunId);
                }
              })
              .catch(() => rescheduleTaskRun(taskRunId, taskRun, getNow()));
          },
          () => delTaskRun(taskRunId) as any,
        ),
      );
    }

    // Check for running task runs overdue to finish
    while (size(runningTaskRuns) && runningTaskRuns[0][1] <= now) {
      const taskRunId = shiftTimestampPair(1)!;
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        abortTaskRun(taskRun);
        rescheduleTaskRun(taskRunId, taskRun, now);
      });
    }

    callTaskRunIdsListeners();

    if (status == 1 || (status == 2 && !isEmpty(scheduledTaskRuns))) {
      scheduleTick();
    } else {
      unscheduleTick();
      status = 0;
    }
  };

  const rescheduleTaskRun = (
    taskRunId: Id,
    taskRun: TaskRun,
    now: TimestampMs,
  ): void => {
    if (taskRun[RETRIES]!-- > 0) {
      const delays = taskRun[DELAYS]!;
      const delay = size(delays) > 1 ? delays.shift() : delays[0];
      taskRun[RETRY]++;
      taskRun[RUNNING] = false;
      taskRun[NEXT_TIMESTAMP] = insertTimestampPair(0, taskRunId, now + delay!);
      taskRun[ABORT_CONTROLLER] = undefined;
    } else {
      delTaskRun(taskRunId);
    }
  };

  const scheduleTick = () => {
    unscheduleTick();
    tickHandle = setTimeout(tick, getManagerConfig(true)[TICK_INTERVAL]!);
  };

  const unscheduleTick = () =>
    isUndefined(tickHandle) ? 0 : clearTimeout(tickHandle);

  const getTaskRunInfoFromTaskRun = (
    taskRunId: Id,
    [taskId, arg, , , retry, running, nextTimestamp]: TaskRun,
  ): TaskRunInfo =>
    objFilterUndefined({
      manager,
      taskId,
      taskRunId,
      arg,
      retry,
      running,
      nextTimestamp,
    });

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
  ): Id | undefined => {
    if (status == 2) {
      return undefined;
    }
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      normalizeTimestamp(startAfter),
      validatedTestRunConfig(config),
      0,
      false,
      insertTimestampPair(0, taskRunId, normalizeTimestamp(startAfter)),
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
    ifNotUndefined(mapGet(taskRunMap, id(taskRunId)), (taskRun) =>
      getTaskRunInfoFromTaskRun(taskRunId, taskRun),
    );

  const delTaskRun = (taskRunId: Id): Manager =>
    fluent(
      (taskRunId) =>
        ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
          abortTaskRun(taskRun);
          removeTimestampPair(taskRun[RUNNING] ? 1 : 0, taskRunId);
          mapSet(taskRunMap, taskRunId);
        }),
      taskRunId,
    );

  const getScheduledTaskRunIds = (): Ids => getTaskRunIds(0);

  const getRunningTaskRunIds = (): Ids => getTaskRunIds(1);

  const addScheduledTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[0]);

  const addRunningTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[1]);

  const delListener = (listenerId: Id): Manager => {
    delListenerImpl(listenerId);
    return manager;
  };

  const start = (): Manager =>
    fluent(() => {
      status = 1;
      scheduleTick();
    });

  const stop = (force = false): Manager =>
    fluent(() => {
      if (force) {
        status = 0;
        unscheduleTick();
      } else if (status != 0) {
        status = 2;
      }
    });

  const getStatus = (): ManagerStatus => status;

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

    addScheduledTaskRunIdsListener,
    addRunningTaskRunIdsListener,
    delListener,

    start,
    stop,
    getStatus,

    getNow,
  };

  return objFreeze(manager);
};
