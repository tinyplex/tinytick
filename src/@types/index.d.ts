/// tinytick

export type Id = string;
export type Ids = Id[];
export type Timestamp = number;
export type Seconds = number;

export type Task = (arg: string | undefined, tasks: Manager) => Promise<void>;

export type ManagerConfig = {
  readonly tickInterval?: Seconds;
};

// readonly startAfter?: Seconds | Timestamp;
// readonly startBefore?: Seconds | Timestamp;
// readonly categoryId?: Id;

export type TaskRunConfig = {
  readonly maxDuration?: Seconds;
  readonly maxRetries?: number;
  readonly retryDelay?: number | string;
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
  getCategoryConfig(categoryId: Id, withDefaults?: boolean): TaskRunConfig;
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
  getTaskConfig(taskId: Id, withDefaults?: boolean): TaskRunConfig;
  /// Manager.getTaskIds
  getTaskIds(): Ids;
  /// Manager.delTask
  delTask(taskId: Id): Manager;

  /// Manager.setTaskRun
  setTaskRun(taskId: Id, arg?: string, config?: TaskRunConfig): Id;
  /// Manager.getTaskRunConfig
  getTaskRunConfig(taskRunId: Id, withDefaults?: boolean): TaskRunConfig;
  /// Manager.delTaskRun
  delTaskRun(taskRunId: Id): Manager;

  /// Manager.start
  start(): Manager;
  /// Manager.stop
  stop(): Manager;
}

/// createManager
export function createManager(): Manager;
