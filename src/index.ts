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
  Task,
  TaskRunConfig,
  TaskRunConfigWithDefaults,
  TaskRunIdsListener,
  TaskRunInfo,
  TaskRunListener,
  TaskRunReason,
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
  IdMap3,
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
import {Pair, pairNewMap, pairNewSet} from './common/pairs.ts';
import {IdSet, IdSet2, setAdd} from './common/set.ts';
import {id, isString} from './common/strings.ts';

type ChangedIdsMap = IdMap<IdAddedOrRemoved>;
const enum IdChange {
  Added = 1,
  Removed = -1,
}

const enum TickPhase {
  Will = 0,
  Did = 1,
}

const enum TaskRunState {
  Scheduled = 0,
  Running = 1,
}

const enum TaskRunReasonGroups {
  Started = 0,
  Finished = 1,
}

const enum TaskRunReasonValues {
  Succeeded = 0,
  TimedOut = 1,
  Errored = 2,
  Deleted = 3,
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
  duration?: DurationMs,
  retries?: number,
  delays?: number[],
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
  Duration = 8,
  Retries = 9,
  Delays = 10,
}

const TICK_INTERVAL = 'tickInterval';
const MAX_DURATION = 'maxDuration';
const MAX_RETRIES = 'maxRetries';
const RETRY_DELAY = 'retryDelay';

const DEFAULT_MANAGER_CONFIG: ManagerConfigWithDefaults = {
  [TICK_INTERVAL]: 100,
};

const DEFAULT_TASK_RUN_CONFIG: TaskRunConfigWithDefaults = {
  [MAX_DURATION]: 1000,
  [MAX_RETRIES]: 0,
  [RETRY_DELAY]: 1000,
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
};

const validatedTestRunConfig = (config: TaskRunConfig): TaskRunConfig =>
  objValidate(config, (child, id) => taskRunConfigValidators[id]?.(child))
    ? config
    : {};

const abortTaskRun = (taskRun: TaskRun): void =>
  taskRun[TaskRunPositions.AbortController]?.abort();

export const createManager: typeof createManagerDecl = (): Manager => {
  let config: ManagerConfig = {};
  let tickHandle: NodeJS.Timeout;
  let status: ManagerStatus = 0;
  const categoryMap: IdMap<TaskRunConfig> = mapNew();
  const taskMap: IdMap<
    [task: Task, categoryId: Id | undefined, config: TaskRunConfig]
  > = mapNew();
  const taskRunMap: IdMap<TaskRun> = mapNew();
  const tickListeners: Pair<IdSet2> = pairNewMap();
  const taskRunIdsListeners: Pair<IdSet2> = pairNewMap();
  const taskRunListeners: Pair<IdMap3<IdSet>> = pairNewMap();

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
  const allTaskRunChanges: Pair<
    Set<[taskId: Id, taskRunId: Id, reason: TaskRunReasonValues]>
  > = pairNewSet();

  const insertTaskRunPointer = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    timestamp: TimestampMs,
    groupAndReason?: [TaskRunReasonGroups, TaskRunReasonValues],
  ): TimestampMs => {
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
    taskRunChanged(
      taskRunState,
      taskId,
      taskRunId,
      IdChange.Added,
      groupAndReason,
    );
    return timestamp;
  };

  const removeTaskRunPointer = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    groupAndReason?: [TaskRunReasonGroups, TaskRunReasonValues],
  ): void => {
    const taskRunPointers = allTaskRunPointers[taskRunState];
    const index = taskRunPointers.findIndex(
      (pointer) => pointer[TaskRunPointerPositions.TaskRunId] == taskRunId,
    );
    if (index != -1) {
      arraySplice(taskRunPointers, index, 1);
      taskRunChanged(
        taskRunState,
        taskId,
        taskRunId,
        IdChange.Removed,
        groupAndReason,
      );
    }
  };

  const shiftTaskRunPointer = (
    taskRunState: TaskRunState,
    groupAndReason?: [TaskRunReasonGroups, TaskRunReasonValues],
  ): [Id, Id] => {
    const [taskId, taskRunId] = arrayShift(allTaskRunPointers[taskRunState])!;
    taskRunChanged(
      taskRunState,
      taskId,
      taskRunId,
      IdChange.Removed,
      groupAndReason,
    );
    return [taskId, taskRunId];
  };

  const getTaskRunIds = (taskRunState: TaskRunState): Ids =>
    arrayFilter(
      arrayMap(
        allTaskRunPointers[taskRunState],
        (taskRunPointer) => taskRunPointer[TaskRunPointerPositions.TaskRunId],
      ),
      isString,
    ) as Ids;

  const taskRunChanged = (
    taskRunState: TaskRunState,
    taskId: Id,
    taskRunId: Id,
    addedOrRemoved: IdAddedOrRemoved,
    groupAndReason?: [TaskRunReasonGroups, TaskRunReasonValues],
  ): void => {
    const taskRunIdsChanged = allTaskRunIdsChanged[taskRunState];
    mapSet(
      taskRunIdsChanged,
      taskRunId,
      mapGet(taskRunIdsChanged, taskRunId) == -addedOrRemoved
        ? undefined
        : addedOrRemoved,
    );
    ifNotUndefined(groupAndReason, ([group, reason]) => {
      setAdd(allTaskRunChanges[group], [taskId, taskRunId, reason]);
    });
  };

  const callChangeListeners = (): void => {
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
    arrayForEach(allTaskRunChanges, (taskRunChanges, group) => {
      collForEach(taskRunChanges, (taskRunChange) =>
        callListeners(taskRunListeners[group], taskRunChange),
      );
      collClear(taskRunChanges);
    });
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
      const [taskId, taskRunId] = shiftTaskRunPointer(TaskRunState.Scheduled);
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) =>
        ifNotUndefined(
          mapGet(taskMap, taskId),
          ([task]) => {
            if (isUndefined(taskRun[TaskRunPositions.Duration])) {
              const config = getTaskRunConfig(taskRunId, true);
              const retryDelay = config[RETRY_DELAY];
              taskRun[TaskRunPositions.Duration] = config[MAX_DURATION];
              taskRun[TaskRunPositions.Retries] = config[MAX_RETRIES];
              taskRun[TaskRunPositions.Delays] = isString(retryDelay)
                ? arrayMap(arraySplit(retryDelay, ','), (number) =>
                    parseInt(number),
                  )
                : [retryDelay];
            }
            taskRun[TaskRunPositions.NextTimestamp] = insertTaskRunPointer(
              TaskRunState.Running,
              taskId,
              taskRunId,
              now + taskRun[TaskRunPositions.Duration],
              [TaskRunReasonGroups.Started, TaskRunReasonValues.Succeeded],
            );
            taskRun[TaskRunPositions.Running] = true;
            taskRun[TaskRunPositions.AbortController] = new AbortController();

            task(
              taskRun[TaskRunPositions.Arg],
              taskRun[TaskRunPositions.AbortController].signal,
              getTaskRunInfoFromTaskRun(taskRunId, taskRun),
            )
              .then(() => {
                if (taskRun[TaskRunPositions.Running]) {
                  removeTaskRunPointer(
                    TaskRunState.Running,
                    taskId,
                    taskRunId,
                    [
                      TaskRunReasonGroups.Finished,
                      TaskRunReasonValues.Succeeded,
                    ],
                  );
                  callChangeListeners();
                  mapSet(taskRunMap, taskRunId);
                }
              })
              .catch(() => {
                removeTaskRunPointer(TaskRunState.Running, taskId, taskRunId, [
                  TaskRunReasonGroups.Finished,
                  TaskRunReasonValues.Errored,
                ]);
                rescheduleTaskRun(taskRunId, taskRun, getNow());
                callChangeListeners();
              });
          },
          () => delTaskRun(taskRunId) as any,
        ),
      );
    }
    callChangeListeners();

    // Check for running task runs overdue to finish
    while (
      size(runningTaskRunPointers) &&
      runningTaskRunPointers[0][TaskRunPointerPositions.Timestamp] <= now
    ) {
      const taskRunId = shiftTaskRunPointer(TaskRunState.Running, [
        TaskRunReasonGroups.Finished,
        TaskRunReasonValues.TimedOut,
      ])[TaskRunPointerPositions.TaskRunId];
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        abortTaskRun(taskRun);
        rescheduleTaskRun(taskRunId, taskRun, now);
      });
    }

    callChangeListeners();
    callListeners(tickListeners[TickPhase.Did]);

    if (status == 1 || (status == 2 && !isEmpty(scheduledTaskRunPointers))) {
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
    if (taskRun[TaskRunPositions.Retries]!-- > 0) {
      const delays = taskRun[TaskRunPositions.Delays]!;
      const delay = size(delays) > 1 ? delays.shift() : delays[0];
      taskRun[TaskRunPositions.Retry]++;
      taskRun[TaskRunPositions.Running] = false;
      taskRun[TaskRunPositions.NextTimestamp] = insertTaskRunPointer(
        TaskRunState.Scheduled,
        taskRun[TaskRunPositions.TaskId],
        taskRunId,
        now + delay!,
      );
      taskRun[TaskRunPositions.AbortController] = undefined;
    } else {
      delTaskRunImpl(taskRunId, false);
    }
  };

  const delTaskRunImpl = (taskRunId: Id, hasReason = true) =>
    ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
      abortTaskRun(taskRun);
      removeTaskRunPointer(
        taskRun[TaskRunPositions.Running]
          ? TaskRunState.Running
          : TaskRunState.Scheduled,
        taskRun[TaskRunPositions.TaskId],
        taskRunId,
        hasReason && taskRun[TaskRunPositions.Running]
          ? [TaskRunReasonGroups.Finished, TaskRunReasonValues.Deleted]
          : undefined,
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
      insertTaskRunPointer(
        TaskRunState.Scheduled,
        id(taskId),
        taskRunId,
        normalizeTimestamp(startAfter),
      ),
    ]);
    callChangeListeners();
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
    fluent((taskRunId) => {
      delTaskRunImpl(taskRunId);
      callChangeListeners();
    }, taskRunId);

  const getScheduledTaskRunIds = (): Ids => getTaskRunIds(0);

  const getRunningTaskRunIds = (): Ids => getTaskRunIds(1);

  const addWillTickListener = (listener: TickListener) =>
    addListener(listener, tickListeners[TickPhase.Will]);

  const addDidTickListener = (listener: TickListener) =>
    addListener(listener, tickListeners[TickPhase.Did]);

  const addScheduledTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[TaskRunState.Scheduled]);

  const addRunningTaskRunIdsListener = (listener: TaskRunIdsListener) =>
    addListener(listener, taskRunIdsListeners[TaskRunState.Running]);

  const addStartedTaskRunListener = (
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    listener: TaskRunListener,
  ) =>
    addListener(listener, taskRunListeners[TaskRunReasonGroups.Started], [
      taskId,
      taskRunId,
      TaskRunReasonValues.Succeeded,
    ]);

  const addFinishedTaskRunListener = (
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    reason: TaskRunReason | null,
    listener: TaskRunListener,
  ) =>
    addListener(listener, taskRunListeners[TaskRunReasonGroups.Started], [
      taskId,
      taskRunId,
      reason,
    ]);

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

    addWillTickListener,
    addDidTickListener,
    addScheduledTaskRunIdsListener,
    addRunningTaskRunIdsListener,
    addStartedTaskRunListener,
    addFinishedTaskRunListener,
    delListener,

    start,
    stop,
    getStatus,

    getNow,
  };

  return objFreeze(manager);
};
