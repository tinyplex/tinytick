/// tinytick

export type Id = string;
export type Ids = Id[];
export type TimestampMs = number;
export type DurationMs = number;

export type Task = (
  arg: string | undefined,
  tasks: Manager,
) => Promise<unknown>;

export type ManagerConfig = {
  readonly tickInterval?: DurationMs;
};

export type ManagerConfigWithDefaults = {
  readonly tickInterval: DurationMs;
};

export type TaskRunConfig = {
  readonly maxDuration?: DurationMs;
  readonly maxRetries?: number;
  readonly retryDelay?: number | string;
};

export type TaskRunConfigWithDefaults = {
  readonly maxDuration: DurationMs;
  readonly maxRetries: number;
  readonly retryDelay: number | string;
};

export type TaskRunInfo = {
  readonly taskId: Id;
  readonly arg?: string;
  readonly startAfter: TimestampMs;
  readonly running?: true;
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
  ): Id;
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
  stop(): Manager;

  /// Manager.getNow
  getNow(): TimestampMs;
}

/// createManager
export function createManager(): Manager;
