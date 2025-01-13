/// tinytick

export type Id = string;
export type Ids = Id[];
export type Timestamp = number;
export type Seconds = number;

export type TaskRunInfo = {
  readonly taskId: Id;
  readonly arg?: string;
  readonly started?: Timestamp;
};

export type Task = (runInfo: TaskRunInfo, tasks: Manager) => Promise<void>;

export type TaskConfig = {
  readonly categoryId?: Id;
  readonly maxDuration?: Seconds;
  readonly maxRetries?: number;
  readonly retryDelay?: number | string;
};

export type CategoryConfig = {
  readonly maxDuration?: Seconds;
  readonly maxRetries?: number;
  readonly retryDelay?: number | string;
};

export type ManagerConfig = {
  readonly tickInterval?: Seconds;
};

/// Manager
export interface Manager {
  /// Manager.setManagerConfig
  setManagerConfig(config: ManagerConfig): this;
  /// Manager.getManagerConfig
  getManagerConfig(): ManagerConfig;

  /// Manager.setTask
  setTask(taskId: Id, task: Task, config?: TaskConfig): this;
  /// Manager.setTaskConfig
  setTaskConfig(taskId: Id, config: TaskConfig): this;
  /// Manager.getTaskConfig
  getTaskConfig(taskId: Id, withDefaults?: boolean): TaskConfig | undefined;
  /// Manager.getTaskIds
  getTaskIds(): Ids;
  /// Manager.delTask
  delTask(taskId: Id): this;
  /// Manager.setCategoryConfig
  setCategoryConfig(categoryId: Id, config?: CategoryConfig): this;
  /// Manager.getCategoryConfig
  getCategoryConfig(categoryId: Id, withDefaults?: boolean): CategoryConfig;
  /// Manager.getCategoryIds
  getCategoryIds(): Ids;
  /// Manager.delCategory
  delCategory(categoryId: Id): this;

  /// Manager.scheduleTaskRun
  scheduleTaskRun(
    taskId: Id,
    arg?: string,
    after?: Seconds | Timestamp,
    before?: Seconds | Timestamp,
  ): Id | undefined;
  /// Manager.getTaskRunInfo
  getTaskRunInfo(taskRunId: Id): TaskRunInfo | undefined;
  /// Manager.unscheduleTaskRun
  unscheduleTaskRun(taskRunId: Id): this;

  /// Manager.start
  start(): this;
  /// Manager.stop
  stop(): this;
}

/// createManager
export function createManager(): Manager;
