/// tinytick

export type Id = string;
export type Ids = Id[];
export type TimestampMs = number;
export type DurationMs = number;

export type Task = (arg: string | undefined, tasks: Manager) => Promise<void>;

export type ManagerConfig = {
  readonly tickInterval?: DurationMs;
};

export type TaskRunConfig = {
  readonly maxDuration?: DurationMs;
  readonly maxRetries?: number;
  readonly retryDelay?: number | string;
};

export type TaskRunInfo = {
  readonly taskId: Id;
  readonly arg?: string;
  readonly startAfter: TimestampMs;
  readonly started?: TimestampMs;
};

/// Manager
export interface Manager {
  /// Manager.setManagerConfig
  setManagerConfig(config: ManagerConfig): Manager;
  /// Manager.getManagerConfig
  getManagerConfig(withDefaults?: boolean): ManagerConfig;

  /// Manager.setCategory
  setCategory(categoryId: Id, config: TaskRunConfig): Manager;
  /// Manager.getCategoryConfig
  getCategoryConfig(
    categoryId: Id,
    withDefaults?: boolean,
  ): TaskRunConfig | undefined;
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
  getTaskConfig(taskId: Id, withDefaults?: boolean): TaskRunConfig | undefined;
  /// Manager.getTaskIds
  getTaskIds(): Ids;
  /// Manager.delTask
  delTask(taskId: Id): Manager;

  /// Manager.setTaskRun
  setTaskRun(
    taskId: Id,
    arg?: string,
    startAfter?: TimestampMs | DurationMs,
    config?: TaskRunConfig,
  ): Id;
  /// Manager.getTaskRunConfig
  getTaskRunConfig(
    taskRunId: Id,
    withDefaults?: boolean,
  ): TaskRunConfig | undefined;
  /// Manager.getTaskRunInfo
  getTaskRunInfo(taskRunId: Id): TaskRunInfo | undefined;
  /// Manager.delTaskRun
  delTaskRun(taskRunId: Id): Manager;

  /// Manager.start
  start(): Manager;
  /// Manager.stop
  stop(): Manager;

  /// Manager.getNow
  getNow(): TimestampMs;
}

/// createManager
export function createManager(): Manager;
