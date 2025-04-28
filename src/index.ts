import type {
  DurationMs,
  Id,
  IdAddedOrRemoved,
  IdOrNull,
  Ids,
  Manager,
  ManagerConfig,
  ManagerConfigWithDefaults,
  ManagerStatus,
  StatusListener,
  Task,
  TaskRunConfig,
  TaskRunConfigWithDefaults,
  TaskRunFailedListener,
  TaskRunIdsListener,
  TaskRunInfo,
  TaskRunRunningListener,
  TickListener,
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
import {collClear, collForEach, collIsEmpty} from './common/coll.ts';
import {getListenerFunctions} from './common/listeners.ts';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
  mapToObj,
} from './common/map.ts';
import {
  objFilterUndefined,
  objForEach,
  objFreeze,
  objMerge,
  objValidate,
} from './common/obj.ts';
import {
  getNow,
  ifNotUndefined,
  isEmpty,
  isPositiveNumber,
  isUndefined,
  normalizeTimestamp,
  size,
} from './common/other.ts';
import {Pair, pairNewMap} from './common/pairs.ts';
import {getUniqueId} from './common/random.ts';
import {IdSet, IdSet2} from './common/set.ts';
import {EMPTY_STRING, id, isString} from './common/strings.ts';

type ChangedIdsMap = IdMap<IdAddedOrRemoved>;
const enum IdChange {
  Added = 1,
  Removed = -1,
}

const enum ManagerStatusValues {
  Stopped = 0,
  Running = 1,
  Stopping = 2,
}

const enum TickPhase {
  Will = 0,
  Did = 1,
}

const enum TaskRunState {
  Scheduled = 0,
  Running = 1,
}

const enum TaskRunReasonValues {
  Scheduled = 0,
  Started = 1,
  Succeeded = 2,
  TimedOut = 3,
  Errored = 4,
  Deleted = 5,
}

type TaskRunPointer = [taskId: Id, taskRunId: Id, timestamp: TimestampMs];
const enum TaskRunPointerPositions {
  TaskId = 0,
  TaskRunId = 1,
  Timestamp = 2,
}

type TaskRun = [
  taskId: Id,
  arg: string | undefined,
  startAfter: TimestampMs,
  config: TaskRunConfig,
  retry: number,
  running: boolean,
  nextTimestamp: TimestampMs,
  abortController?: AbortController,
  maxDuration?: DurationMs,
  retries?: number,
  retryDelays?: number[],
  repeatDelay?: DurationMs,
];
const enum TaskRunPositions {
  TaskId = 0,
  Arg = 1,
  StartAfter = 2,
  Config = 3,
  Retry = 4,
  Running = 5,
  NextTimestamp = 6,
  AbortController = 7,
  MaxDuration = 8,
  Retries = 9,
  RetryDelays = 10,
  RepeatDelay = 11,
}

const TICK_INTERVAL = 'tickInterval';
const MAX_DURATION = 'maxDuration';
const MAX_RETRIES = 'maxRetries';
const RETRY_DELAY = 'retryDelay';
const REPEAT_DELAY = 'repeatDelay';

const DEFAULT_MANAGER_CONFIG: ManagerConfigWithDefaults = {
  [TICK_INTERVAL]: 100,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfigWithDefaults = {
  [MAX_DURATION]: 1000,
  [MAX_RETRIES]: 0,
  [RETRY_DELAY]: 1000,
  [REPEAT_DELAY]: null,
};

const RETRY_PATTERN = /^(\d*\.?\d+)(, ?\d*\.?\d+)*$/;

const managerConfigValidators: {[id: string]: (child: any) => boolean} = {
  [TICK_INTERVAL]: isPositiveNumber,
};

const taskRunConfigValidators: {[id: string]: (child: any) => boolean} = {
  [MAX_DURATION]: isPositiveNumber,
  [MAX_RETRIES]: isPositiveNumber,
  [RETRY_DELAY]: (child: any) =>
    isPositiveNumber(child) || (isString(child) && RETRY_PATTERN.test(child)),
  [REPEAT_DELAY]: (child: any) => isPositiveNumber(child) || child === null,
};

const validatedTestRunConfig = (config: TaskRunConfig): TaskRunConfig =>
  objValidate(config, (child, id) => taskRunConfigValidators[id]?.(child))
    ? config
    : {};

const abortTaskRun = (taskRun: TaskRun): void =>
  taskRun[TaskRunPositions.AbortController]?.abort();

const updateTaskRun = (obj1: TaskRun, obj2: {[position: number]: unknown}) =>
  objForEach(obj2, (value, id) => ((obj1 as any)[id] = value));

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  let status: ManagerStatusValues = ManagerStatusValues.Stopped;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<TaskRun> = mapNew();
  const statusListeners: IdSet2 = mapNew();
  const tickListeners: Pair<IdSet2> = pairNewMap();
  const taskRunIdsListeners: Pair<IdSet2> = pairNewMap();
  const taskRunRunningListeners: IdMap2<IdSet> = mapNew();
  const taskRunFailedListeners: IdMap2<IdSet> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => manager,
  );

  const allTaskRunPointers: [
    scheduled: TaskRunPointer[],
    running: TaskRunPointer[],
  ] = [[], []];

  const allTaskRunIdsChanged: [
    scheduled: ChangedIdsMap,
    running: ChangedIdsMap,
  ] = pairNewMap();
  const taskRunChanges: IdMap2<
    [running: boolean | undefined, reason: TaskRunReasonValues]
  > = mapNew();
  const taskRunFailures: IdMap2<
    [reason: TaskRunReasonValues, message: string]
  > = mapNew();

  const insertTaskRunPointer = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    timestamp: TimestampMs,
    reason: TaskRunReasonValues,
  ): void => {
    const taskRunPointers = allTaskRunPointers[taskRunState];
    const nextIndex = taskRunPointers.findIndex(
      (existingPointer) =>
        existingPointer[TaskRunPointerPositions.Timestamp] > timestamp,
    );
    const taskRunPointer: TaskRunPointer = [taskId, taskRunId, timestamp];
    arraySplice(
      taskRunPointers,
      nextIndex == -1 ? size(taskRunPointers) : nextIndex,
      0,
      taskRunPointer,
    );
    taskRunChanged(taskRunState, taskId, taskRunId, IdChange.Added, [
      taskRunState == TaskRunState.Running,
      reason,
    ]);
  };

  const removeTaskRunPointer = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    reason: TaskRunReasonValues,
  ): void => {
    const taskRunPointers = allTaskRunPointers[taskRunState];
    const index = taskRunPointers.findIndex(
      (pointer) => pointer[TaskRunPointerPositions.TaskRunId] == taskRunId,
    );
    if (index != -1) {
      arraySplice(taskRunPointers, index, 1);
      taskRunChanged(taskRunState, taskId, taskRunId, IdChange.Removed, [
        undefined,
        reason,
      ]);
    }
  };

  const shiftTaskRunPointer = (
    taskRunState: TaskRunState,
    reason: TaskRunReasonValues,
  ): [Id, Id, TaskRun] => {
    const [taskId, taskRunId] = arrayShift(allTaskRunPointers[taskRunState])!;
    taskRunChanged(taskRunState, taskId, taskRunId, IdChange.Removed, [
      undefined,
      reason,
    ]);
    return [taskId, taskRunId, mapGet(taskRunMap, taskRunId)!];
  };

  const getTaskRunIds = (taskRunState: TaskRunState): Ids =>
    arrayFilter(
      arrayMap(
        allTaskRunPointers[taskRunState],
        (taskRunPointer) => taskRunPointer[TaskRunPointerPositions.TaskRunId],
      ),
      isString,
    ) as Ids;

  const changeStatus = (newStatus: ManagerStatusValues) =>
    callListeners(statusListeners, undefined, (status = newStatus));

  const taskRunChanged = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    addedOrRemoved: IdAddedOrRemoved,
    runningAndReason: [boolean | undefined, TaskRunReasonValues],
  ): void => {
    const taskRunIdsChanged = allTaskRunIdsChanged[taskRunState];
    mapSet(taskRunIdsChanged, taskRunId, addedOrRemoved);
    mapSet(
      mapEnsure(taskRunChanges, taskId, mapNew),
      taskRunId,
      runningAndReason,
    );
  };

  const taskRunFailed = (
    taskId: Id,
    taskRunId: Id,
    reason: TaskRunReasonValues,
    message = EMPTY_STRING,
  ): any =>
    mapSet(mapEnsure(taskRunFailures, taskId, mapNew), taskRunId, [
      reason,
      message,
    ]);

  const callAllListeners = (): void => {
    arrayForEach(allTaskRunIdsChanged, (taskRunIdsChanged, taskRunState) => {
      if (!collIsEmpty(taskRunIdsChanged)) {
        callListeners(
          taskRunIdsListeners[taskRunState],
          undefined,
          mapToObj(taskRunIdsChanged),
        );
        collClear(taskRunIdsChanged);
      }
    });

    arrayForEach(
      [
        [taskRunChanges, taskRunRunningListeners],
        [taskRunFailures, taskRunFailedListeners],
      ] as [IdMap2<[arg1: any, arg2: any]>, IdMap2<IdSet>][],
      ([eventsByTaskId, listeners]) => {
        collForEach(eventsByTaskId, (events, taskId) =>
          collForEach(events, (args, taskRunId) =>
            callListeners(listeners, [taskId, taskRunId], ...args),
          ),
        );
        collClear(eventsByTaskId);
      },
    );
  };

  const tick = () => {
    const now = getNow();
    const [scheduledTaskRunPointers, runningTaskRunPointers] =
      allTaskRunPointers;

    callListeners(tickListeners[TickPhase.Will]);

    // Check for scheduled task runs overdue to start
    while (
      size(scheduledTaskRunPointers) &&
      scheduledTaskRunPointers[0][TaskRunPointerPositions.Timestamp] <= now
    ) {
      const [taskId, taskRunId, taskRun] = shiftTaskRunPointer(
        TaskRunState.Scheduled,
        TaskRunReasonValues.Started,
      );
      ifNotUndefined(
        mapGet(taskMap, taskId),
        ([task]) => {
          if (isUndefined(taskRun[TaskRunPositions.MaxDuration])) {
            const config = getTaskRunConfig(taskRunId, true);
            const retryDelay = config[RETRY_DELAY];
            updateTaskRun(taskRun, {
              [TaskRunPositions.MaxDuration]: config[MAX_DURATION],
              [TaskRunPositions.Retries]: config[MAX_RETRIES],
              [TaskRunPositions.RetryDelays]: isString(retryDelay)
                ? arrayMap(arraySplit(retryDelay, ','), (number) =>
                    parseInt(number),
                  )
                : [retryDelay],
              [TaskRunPositions.RepeatDelay]: config[REPEAT_DELAY],
            });
          }

          const finishTimestamp = now + taskRun[TaskRunPositions.MaxDuration]!;
          const abortController = new AbortController();
          const {signal} = abortController;
          updateTaskRun(taskRun, {
            [TaskRunPositions.NextTimestamp]: finishTimestamp,
            [TaskRunPositions.Running]: true,
            [TaskRunPositions.AbortController]: abortController,
          });
          insertTaskRunPointer(
            TaskRunState.Running,
            taskId,
            taskRunId,
            finishTimestamp,
            TaskRunReasonValues.Started,
          );

          task(
            taskRun[TaskRunPositions.Arg],
            signal,
            getTaskRunInfoFromTaskRun(taskRunId, taskRun),
          )
            .then(() => {
              if (
                taskRun[TaskRunPositions.Running] &&
                signal.aborted === false
              ) {
                removeTaskRunPointer(
                  TaskRunState.Running,
                  taskId,
                  taskRunId,
                  TaskRunReasonValues.Succeeded,
                );
                mapSet(taskRunMap, taskRunId);
                callAllListeners();
                ifNotUndefined(
                  taskRun[TaskRunPositions.RepeatDelay],
                  (repeatDelay) =>
                    scheduleTaskRun(
                      taskId,
                      taskRun[TaskRunPositions.Arg],
                      repeatDelay,
                      taskRun[TaskRunPositions.Config],
                    ),
                );
              }
            })
            .catch((error) => {
              removeTaskRunPointer(
                TaskRunState.Running,
                taskId,
                taskRunId,
                TaskRunReasonValues.Errored,
              );
              rescheduleTaskRun(
                taskRunId,
                taskRun,
                getNow(),
                TaskRunReasonValues.Errored,
              );
              taskRunFailed(
                taskId,
                taskRunId,
                TaskRunReasonValues.Errored,
                error.message,
              );
              callAllListeners();
            });
        },
        () => delTaskRunImpl(taskRunId),
      );
    }
    callAllListeners();

    // Check for running task runs overdue to finish
    while (
      size(runningTaskRunPointers) &&
      runningTaskRunPointers[0][TaskRunPointerPositions.Timestamp] <= now
    ) {
      const [taskId, taskRunId, taskRun] = shiftTaskRunPointer(
        TaskRunState.Running,
        TaskRunReasonValues.TimedOut,
      );
      abortTaskRun(taskRun);
      rescheduleTaskRun(taskRunId, taskRun, now, TaskRunReasonValues.TimedOut);
      taskRunFailed(taskId, taskRunId, TaskRunReasonValues.TimedOut);
    }

    callAllListeners();
    callListeners(tickListeners[TickPhase.Did]);

    if (
      status == ManagerStatusValues.Running ||
      (status == ManagerStatusValues.Stopping &&
        !isEmpty(scheduledTaskRunPointers))
    ) {
      scheduleTick();
    } else {
      unscheduleTick();
      changeStatus(ManagerStatusValues.Stopped);
    }
  };

  const rescheduleTaskRun = (
    taskRunId: Id,
    taskRun: TaskRun,
    now: TimestampMs,
    reason: TaskRunReasonValues,
  ): void => {
    if (taskRun[TaskRunPositions.Retries]!-- > 0) {
      const delays = taskRun[TaskRunPositions.RetryDelays]!;
      const delay = size(delays) > 1 ? delays.shift() : delays[0];
      const startTimestamp = now + delay!;
      updateTaskRun(taskRun, {
        [TaskRunPositions.Retry]: taskRun[TaskRunPositions.Retry] + 1,
        [TaskRunPositions.Running]: false,
        [TaskRunPositions.NextTimestamp]: startTimestamp,
        [TaskRunPositions.AbortController]: undefined,
      });
      insertTaskRunPointer(
        TaskRunState.Scheduled,
        taskRun[TaskRunPositions.TaskId],
        taskRunId,
        startTimestamp,
        reason,
      );
    } else {
      delTaskRunImpl(taskRunId, reason);
    }
  };

  const delTaskRunImpl = (
    taskRunId: Id,
    reason = TaskRunReasonValues.Deleted,
  ) =>
    ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
      abortTaskRun(taskRun);
      removeTaskRunPointer(
        taskRun[TaskRunPositions.Running]
          ? TaskRunState.Running
          : TaskRunState.Scheduled,
        taskRun[TaskRunPositions.TaskId],
        taskRunId,
        reason,
      );
      mapSet(taskRunMap, taskRunId);
    });

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
    if (status == ManagerStatusValues.Stopping) {
      return undefined;
    }
    const taskRunId = getUniqueId();
    const startTimestamp = normalizeTimestamp(startAfter);
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      startTimestamp,
      validatedTestRunConfig(config),
      0,
      false,
      startTimestamp,
    ]);
    insertTaskRunPointer(
      TaskRunState.Scheduled,
      id(taskId),
      taskRunId,
      startTimestamp,
      TaskRunReasonValues.Scheduled,
    );
    callAllListeners();
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

  const getTaskRunRunning = (taskRunId: Id): boolean | undefined =>
    mapGet(taskRunMap, id(taskRunId))?.[TaskRunPositions.Running];

  const delTaskRun = (taskRunId: Id): Manager =>
    fluent((taskRunId) => {
      delTaskRunImpl(taskRunId);
      callAllListeners();
    }, taskRunId);

  const getScheduledTaskRunIds = (): Ids => getTaskRunIds(0);

  const getRunningTaskRunIds = (): Ids => getTaskRunIds(1);

  const addStatusListener = (listener: StatusListener) =>
    addListener(listener, statusListeners);

  const addWillTickListener = (listener: TickListener) =>
    addListener(listener, tickListeners[TickPhase.Will]);

  const addDidTickListener = (listener: TickListener) =>
    addListener(listener, tickListeners[TickPhase.Did]);

  const addScheduledTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[TaskRunState.Scheduled]);

  const addRunningTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[TaskRunState.Running]);

  const addTaskRunRunningListener = (
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    listener: TaskRunRunningListener,
  ) => addListener(listener, taskRunRunningListeners, [taskId, taskRunId]);

  const addTaskRunFailedListener = (
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    listener: TaskRunFailedListener,
  ) => addListener(listener, taskRunFailedListeners, [taskId, taskRunId]);

  const delListener = (listenerId: Id): Manager => {
    delListenerImpl(listenerId);
    return manager;
  };

  const start = (): Manager =>
    fluent(() => {
      changeStatus(ManagerStatusValues.Running);
      scheduleTick();
    });

  const stop = (force = false): Manager =>
    fluent(() => {
      if (force) {
        changeStatus(ManagerStatusValues.Stopped);
        unscheduleTick();
      } else if (status != ManagerStatusValues.Stopped) {
        changeStatus(ManagerStatusValues.Stopping);
      }
    });

  const getStatus = (): ManagerStatus => status as any;

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
    getTaskRunRunning,
    delTaskRun,

    getScheduledTaskRunIds,
    getRunningTaskRunIds,

    addStatusListener,
    addWillTickListener,
    addDidTickListener,
    addScheduledTaskRunIdsListener,
    addRunningTaskRunIdsListener,
    addTaskRunRunningListener,
    addTaskRunFailedListener,
    delListener,

    start,
    stop,
    getStatus,

    getNow,
  };

  return objFreeze(manager);
};
