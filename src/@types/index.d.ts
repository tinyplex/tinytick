/// tinytick

/// Id
export type Id = string;

/// IdOrNull
export type IdOrNull = Id | null;

/// Ids
export type Ids = Id[];

/// IdAddedOrRemoved
export type IdAddedOrRemoved = 1 | -1;

/// ChangedIds
export type ChangedIds = {[id: Id]: IdAddedOrRemoved};

/// TimestampMs
export type TimestampMs = number;

/// DurationMs
export type DurationMs = number;

/// Task
export type Task = (
  arg: string | undefined,
  signal: AbortSignal,
  info: TaskRunInfo,
) => Promise<unknown>;

/// ManagerStatus
export const enum ManagerStatus {
  /// ManagerStatus.Stopped
  Stopped = 0,
  /// ManagerStatus.Running
  Running = 1,
  /// ManagerStatus.Stopping
  Stopping = 2,
}

/// ManagerConfig
export type ManagerConfig = {
  /// ManagerConfig.tickInterval
  readonly tickInterval?: DurationMs;
};

/// ManagerConfigWithDefaults
export type ManagerConfigWithDefaults = {
  /// ManagerConfigWithDefaults.tickInterval
  readonly tickInterval: DurationMs;
};

/// TaskRunConfig
export type TaskRunConfig = {
  /// TaskRunConfig.maxDuration
  readonly maxDuration?: DurationMs;
  /// TaskRunConfig.maxRetries
  readonly maxRetries?: number;
  /// TaskRunConfig.retryDelay
  readonly retryDelay?: DurationMs | string;
  /// TaskRunConfig.repeatDelay
  readonly repeatDelay?: DurationMs | null;
};

/// TaskRunConfigWithDefaults
export type TaskRunConfigWithDefaults = {
  /// TaskRunConfigWithDefaults.maxDuration
  readonly maxDuration: DurationMs;
  /// TaskRunConfigWithDefaults.maxRetries
  readonly maxRetries: number;
  /// TaskRunConfigWithDefaults.retryDelay
  readonly retryDelay: DurationMs | string;
  /// TaskRunConfigWithDefaults.repeatDelay
  readonly repeatDelay: DurationMs | null;
};

/// TaskRunInfo
export type TaskRunInfo = {
  /// TaskRunInfo.manager
  readonly manager: Manager;
  /// TaskRunInfo.taskId
  readonly taskId: Id;
  /// TaskRunInfo.taskRunId
  readonly taskRunId: Id;
  /// TaskRunInfo.arg
  readonly arg: string | undefined;
  /// TaskRunInfo.retry
  readonly retry: number;
  /// TaskRunInfo.running
  readonly running: boolean;
  /// TaskRunInfo.nextTimestamp
  readonly nextTimestamp: TimestampMs;
};

/// TaskRunReason
export const enum TaskRunReason {
  /// TaskRunReason.Scheduled
  Scheduled = 0,
  /// TaskRunReason.Started
  Started = 1,
  /// TaskRunReason.Succeeded
  Succeeded = 2,
  /// TaskRunReason.TimedOut
  TimedOut = 3,
  /// TaskRunReason.Errored
  Errored = 4,
  /// TaskRunReason.Deleted
  Deleted = 5,
}

/// StatusListener
export type StatusListener = (manager: Manager, status: ManagerStatus) => void;

/// TickListener
export type TickListener = (manager: Manager) => void;

/// TaskRunIdsListener
export type TaskRunIdsListener = (
  manager: Manager,
  changedIds: ChangedIds,
) => void;

/// TaskRunRunningListener
export type TaskRunRunningListener = (
  manager: Manager,
  taskId: Id,
  taskRunId: Id,
  running: boolean | undefined,
  reason: TaskRunReason,
) => void;

/// TaskRunFailedListener
export type TaskRunFailedListener = (
  manager: Manager,
  taskId: Id,
  taskRunId: Id,
  reason: TaskRunReason,
  message: string,
) => void;

/// Manager
export interface Manager {
  /// Manager.setManagerConfig
  setManagerConfig(config: ManagerConfig): Manager;

  /// Manager.getManagerConfig
  getManagerConfig<WithDefaults extends boolean>(
    withDefaults?: WithDefaults,
  ): WithDefaults extends true ? ManagerConfigWithDefaults : ManagerConfig;

  /// Manager.setCategory
  setCategory(categoryId: Id, config: TaskRunConfig): Manager;

  /// Manager.getCategoryConfig
  getCategoryConfig<WithDefaults extends boolean>(
    categoryId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined;

  /// Manager.getCategoryIds
  getCategoryIds(): Ids;

  /// Manager.delCategory
  delCategory(categoryId: Id): Manager;

  /// Manager.setTask
  setTask(
    taskId: Id,
    task: Task,
    categoryId?: Id,
    config?: TaskRunConfig,
  ): Manager;

  /// Manager.getTaskConfig
  getTaskConfig<WithDefaults extends boolean>(
    taskId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined;

  /// Manager.getTaskIds
  getTaskIds(): Ids;

  /// Manager.delTask
  delTask(taskId: Id): Manager;

  /// Manager.scheduleTaskRun
  scheduleTaskRun(
    taskId: Id,
    arg?: string,
    startAfter?: TimestampMs | DurationMs,
    config?: TaskRunConfig,
  ): Id | undefined;

  /// Manager.getTaskRunConfig
  getTaskRunConfig<WithDefaults extends boolean>(
    taskRunId: Id,
    withDefaults?: WithDefaults,
  ): WithDefaults extends true
    ? TaskRunConfigWithDefaults
    : TaskRunConfig | undefined;

  /// Manager.getTaskRunInfo
  getTaskRunInfo(taskRunId: Id): TaskRunInfo | undefined;

  /// Manager.getTaskRunRunning
  getTaskRunRunning(taskRunId: Id): boolean | undefined;

  /// Manager.untilTaskRunDone
  untilTaskRunDone(taskRunId: Id): Promise<void>;

  /// Manager.delTaskRun
  delTaskRun(taskRunId: Id): Manager;

  /// Manager.getScheduledTaskRunIds
  getScheduledTaskRunIds(): Ids;

  /// Manager.getRunningTaskRunIds
  getRunningTaskRunIds(): Ids;

  /// Manager.addStatusListener
  addStatusListener(listener: StatusListener): Id;

  /// Manager.addWillTickListener
  addWillTickListener(listener: TickListener): Id;

  /// Manager.addDidTickListener
  addDidTickListener(listener: TickListener): Id;

  /// Manager.addScheduledTaskRunIdsListener
  addScheduledTaskRunIdsListener(listener: TaskRunIdsListener): Id;

  /// Manager.addRunningTaskRunIdsListener
  addRunningTaskRunIdsListener(listener: TaskRunIdsListener): Id;

  /// Manager.addTaskRunRunningListener
  addTaskRunRunningListener(
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    listener: TaskRunRunningListener,
  ): Id;

  /// Manager.addTaskRunFailedListener
  addTaskRunFailedListener(
    taskId: IdOrNull,
    taskRunId: IdOrNull,
    listener: TaskRunFailedListener,
  ): Id;

  /// Manager.delListener
  delListener(listenerId: Id): Manager;

  /// Manager.start
  start(): Manager;

  /// Manager.stop
  stop(force?: boolean): Manager;

  /// Manager.getStatus
  getStatus(): ManagerStatus;

  /// Manager.getNow
  getNow(): TimestampMs;
}

/// createManager
export function createManager(): Manager;
