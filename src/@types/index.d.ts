/// tinytick

/// Id
export type Id = string;

/// Ids
export type Ids = Id[];

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
export type ManagerStatus = 0 | 1 | 2;

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
};

/// TaskRunConfigWithDefaults
export type TaskRunConfigWithDefaults = {
  /// TaskRunConfigWithDefaults.maxDuration
  readonly maxDuration: DurationMs;
  /// TaskRunConfigWithDefaults.maxRetries
  readonly maxRetries: number;
  /// TaskRunConfigWithDefaults.retryDelay
  readonly retryDelay: DurationMs | string;
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
  /// Manager.delTaskRun
  delTaskRun(taskRunId: Id): Manager;

  /// Manager.getScheduledTaskRunIds
  getScheduledTaskRunIds(): Ids;

  /// Manager.getRunningTaskRunIds
  getRunningTaskRunIds(): Ids;

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
