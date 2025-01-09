/// tinytick

export type Id = string;
export type Ids = Id[];
export type Timestamp = number;
export type Seconds = number;

export type TaskRunInfo = {
  readonly taskId: Id;
  readonly arg: string;
  readonly started: Timestamp | null;
};

export type Task = (arg: string, runInfo: TaskRunInfo, tasks: Manager) => void;

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
  setManagerConfig(config: ManagerConfig): Manager;
  /// Manager.getManagerConfig
  getManagerConfig(): ManagerConfig;

  /// Manager.setTask
  setTask(taskId: Id, task: Task, config?: TaskConfig): Manager;
  /// Manager.setTaskConfig
  setTaskConfig(taskId: Id, config: TaskConfig): Manager;
  /// Manager.getTaskConfig
  getTaskConfig(taskId: Id, withDefaults?: boolean): TaskConfig | undefined;
  /// Manager.getTaskIds
  getTaskIds(): Ids;
  /// Manager.delTask
  delTask(taskId: Id): Manager;
  /// Manager.setCategoryConfig
  setCategoryConfig(categoryId: Id, config?: CategoryConfig): Manager;
  /// Manager.getCategoryConfig
  getCategoryConfig(categoryId: Id, withDefaults?: boolean): CategoryConfig;
  /// Manager.getCategoryIds
  getCategoryIds(): Ids;
  /// Manager.delCategory
  delCategory(categoryId: Id): Manager;

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
  unscheduleTaskRun(taskRunId: Id): Manager;
}

/// createManager
export function createManager(): Manager;
