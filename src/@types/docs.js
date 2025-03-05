/**
 * The tinytick module.
 * @packageDocumentation
 * @module tinytick
 * @since v1.0.0
 */
/// tinytick

/**
 * The Id type is a simple alias for a string.
 *
 * It is used to indicate that the string should be considered to be the key of
 * an object (such as a Task, task run, or category).
 * @category Identity
 * @since v1.0.0
 */
/// Id

/**
 * The Ids type is a simple alias for an array of strings.
 *
 * It is used to indicate that the strings should be considered to be the keys
 * of objects (such as those identifying Task task run, or category objects).
 * @category Identity
 * @since v1.0.0
 */
/// Ids

/**
 * The TimestampMs type is a simple alias for a number.
 *
 * It is used to indicate that the number should be considered to be a timestamp
 * in 'milliseconds since the start of 1970'.
 *
 * Some parts of the API will accept a number typed as either a TimestampMs or a
 * DurationMs. The heuristic to disambiguate them is that a number less than the
 * number of milliseconds in a year (31536000000) is considered a DurationMs
 * duration, and a number larger than that is considered a TimestampMs
 * timestamp.
 *
 * In other words, it is not expected that TinyTick will be used to schedule
 * things for more than a year in the future (or for absolute times during
 * 1970).
 * @category Timing
 * @since v1.0.0
 */
/// TimestampMs

/**
 * The DurationMs type.
 *
 * It is used to indicate that the number should be considered to be a duration
 * in milliseconds.
 *
 * Some parts of the API will accept a number typed as either a TimestampMs or a
 * DurationMs. The heuristic to disambiguate them is that a number less than the
 * number of milliseconds in a year (31536000000) is considered a DurationMs
 * duration, and a number larger than that is considered a TimestampMs
 * timestamp.
 *
 * In other words, it is not expected that TinyTick will be used to schedule
 * things for more than a year in the future (or for absolute times during
 * 1970).
 * @category Timing
 * @since v1.0.0
 */
/// DurationMs

/**
 * The Task type represents a task function that has been registered with the
 * Manager.
 *
 * A Task is an asynchronous function that is passed an optional string
 * argument, an AbortSignal to indicate that execution should be ceased, and a
 * reference to the Manager so that additional task runs can be scheduled if
 * needed.
 * @param arg A string argument that might have been provided when the Task was
 * scheduled to run (or `undefined` if not).
 * @param signal An AbortSignal that can be used to indicate that the Task
 * should cease execution.
 * @param manager A reference to the Manager that has executed the Task.
 * @category Identity
 * @since v1.0.0
 */
/// Task

/**
 * The ManagerConfig type represents a configuration you can provide for the
 * Manager as a whole.
 *
 * This includes a property which lets you indicate the `tickInterval`. This
 * represents the time between Manager 'ticks' - essentially the heartbeat of
 * how often the Manager should check for new tasks to run, or existing ones to
 * abort.
 * @category Manager
 * @since v1.0.0
 */
/// ManagerConfig
{
  /**
   * The optional time in milliseconds after one tick completes before the next
   * tick will start, defaulting to 100.
   * @category Manager
   * @since v1.0.0
   */
  /// ManagerConfig.tickInterval
}

/**
 * The ManagerConfigWithDefaults type represents the full configuration for the
 * Manager as a whole, including any defaults of those you yourself have not
 * provided.
 *
 * It currently has just one property, which lets you indicate the
 * `tickInterval`. This represents the time between Manager 'ticks' -
 * essentially the heartbeat of how often the Manager should check for new tasks
 * to run, or existing ones to abort.
 * @category Manager
 * @since v1.0.0
 */
/// ManagerConfigWithDefaults
{
  /**
   * The time in milliseconds after one tick completes before the next tick will
   * start, defaulting to 100.
   * @category Manager
   * @since v1.0.0
   */
  /// ManagerConfigWithDefaults.tickInterval
}

/**
 * The TaskRunConfig type represents a configuration you can provide for a task
 * run.
 *
 * This can be provided for a specific task run, a Task as a whole, or for all
 * tasks in a category.
 *
 * Individual configuration items for a task run will override that of the Task,
 * which in turn override those of a task category, if any. The Manager itself
 * provides defaults if none are provided at any level.
 *
 * This has properties which let you indicate the duration of task runs and
 * their retry behaviors, for example.
 * @category TaskRun
 * @since v1.0.0
 */
/// TaskRunConfig
{
  /**
   * The optional maximum time in milliseconds that a task can run for before a
   * signal is sent to abort it, defaulting to 1000.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfig.maxDuration
  /**
   * The optional number of times that a task can will be retried if it fails or
   * times out, defaulting to 0.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfig.maxRetries
  /**
   * The optional duration between task run retries in milliseconds, defaulting
   * to 1000. This can also be a string of comma delimited numbers if you want
   * to implement a back-off strategy, for example.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfig.retryDelay
}

/**
 * The TaskRunConfigWithDefaults type represents the full configuration for a
 * task run, including any defaults of those you yourself have not provided.
 *
 * This has properties which let you indicate the duration of task runs and
 * their retry behaviors, for example.
 * @category TaskRun
 * @since v1.0.0
 */
/// TaskRunConfigWithDefaults
{
  /**
   * The maximum time in milliseconds that a task can run for before a signal is
   * sent to abort it, defaulting to 1000.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfigWithDefaults.maxDuration
  /**
   * The number of times that a task can will be retried if it fails or times
   * out, defaulting to 0.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfigWithDefaults.maxRetries
  /**
   * The duration between task run retries in milliseconds, defaulting to 1000.
   * This can also be a string of comma delimited numbers if you want to
   * implement a back-off strategy, for example.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunConfigWithDefaults.retryDelay
}

/**
 * The TaskRunInfo type represents information about a scheduled or running task
 * run.
 *
 * Its properties include the Task Id, any argument provided, whether it is
 * currently running, and so on.
 * @category TaskRun
 * @since v1.0.0
 */
/// TaskRunInfo
{
  /**
   * The Id of the Task that is being run.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.taskId
  /**
   * The string argument that was provided when the Task was scheduled to run,
   * or `undefined` if one was not provided.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.arg
  /**
   * The number of times that this task run has been retried.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.retry
  /**
   * Whether the task is currently running (`true`) or scheduled to run in the
   * future (`false`).
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.running
  /**
   * The timestamp of when the task run is scheduled to start (if not yet
   * running), or when it is scheduled to be aborted (if running).
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.nextTimestamp
}

/**
 * The Manager interface represents the main entry point for the TinyTick API,
 * and the object with which you register each Task, and schedule them to run.
 *
 * Create a Manager easily with the createManager function.
 * @category Manager
 * @since v1.0.0
 */
/// Manager
{
  /**
   * The setManagerConfig method lets you configure the Manager as a whole.
   *
   * This includes a property which lets you indicate the `tickInterval`. This
   * represents the time between Manager 'ticks' - essentially the heartbeat of
   * how often the Manager should check for new tasks to run, or existing ones
   * to abort.
   * @param config The ManagerConfig to set.
   * @returns A reference to the Manager.
   * @example
   * This example creates a Manager object and sets its configuration.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setManagerConfig({tickInterval: 200});
   *
   * console.log(manager.getManagerConfig());
   * // -> {tickInterval: 200}
   * ```
   * @example
   * This example creates a Manager object with some invalid configuration items
   * (which are ignored).
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setManagerConfig({
   *   tickInterval: -2000, // should be a positive integer
   *   oops: 42, // not a valid configuration item
   * });
   *
   * console.log(manager.getManagerConfig());
   * // -> {}
   * ```
   * @category Manager
   * @since v1.0.0
   */
  /// Manager.setManagerConfig
  /**
   * The getManagerConfig method returns the current configuration of the
   * Manager as a whole.
   *
   * You can either return just the configuration you have set, or the full
   * configuration, including any defaults of those you have not provided.
   * @param withDefaults Whether to return the full configuration including
   * defaults.
   * @returns The configuration as a ManagerConfig or ManagerConfigWithDefaults.
   * @example
   * This example creates a Manager object and gets its default configuration.
   * No additional configuration has been provided, so when the `withDefaults`
   * flag is not set, the object returned is empty.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   *
   * console.log(manager.getManagerConfig(true));
   * // -> {tickInterval: 100}
   * console.log(manager.getManagerConfig());
   * // -> {}
   * ```
   * @category Manager
   * @since v1.0.0
   */
  /// Manager.getManagerConfig
  /**
   * The setCategory method lets you create and configure a category for tasks.
   *
   * A category is identified by a string Id, and all tasks associated with
   * that category will inherit its TaskRunConfig. If this method is called on a
   * category Id that already exists, its configuration will be updated.
   *
   * This has properties which let you indicate the duration of task runs and
   * their retry behaviors, for example.
   * @param categoryId The Id of the category to create or update.
   * @param config The TaskRunConfig to set.
   * @returns A reference to the Manager.
   * @example
   * This example creates a Manager object and creates a category called
   * `network` with a specific maximum duration.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   *
   * console.log(manager.getCategoryConfig('network'));
   * // -> {maxDuration: 5000}
   * ```
   * @example
   * This example creates a Manager object and creates a category with some
   * invalid configuration items (which are ignored).
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {
   *   maxDuration: 5000,
   *   maxRetries: -2, // should be a positive integer
   *   oops: 42, // not a valid configuration item
   * });
   *
   * console.log(manager.getCategoryConfig('network'));
   * // -> {maxDuration: 5000}
   * ```
   * @category Category
   * @since v1.0.0
   */
  /// Manager.setCategory
  /**
   * The getCategoryConfig method returns the current configuration of a
   * category.
   *
   * You can either return just the configuration you have set for this
   * category, or the full configuration, including any defaults of those you
   * have not provided.
   *
   * If the category Id does not exist, this method will return `undefined`.
   * @param categoryId The Id of the category to get the configuration for.
   * @param withDefaults Whether to return the full configuration including
   * defaults.
   * @returns The configuration as a TaskRunConfig (or `undefined` if the
   * category Id does not exist) or TaskRunConfigWithDefaults.
   * @example
   * This example creates a Manager object and a category called `network` with
   * a specific maximum duration. Its configuration can be accessed with or
   * without the defaults included.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   *
   * console.log(manager.getCategoryConfig('network'));
   * // -> {maxDuration: 5000}
   * console.log(manager.getCategoryConfig('network', true));
   * // -> {maxDuration: 5000, maxRetries: 0, retryDelay: 1000}
   * ```
   * @example
   * This example creates a Manager object and tries to get the configuration of
   * a category that does not exist. The method returns `undefined`.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   *
   * console.log(manager.getCategoryConfig('oops'));
   * // -> undefined
   * console.log(manager.getCategoryConfig('oops', true));
   * // -> undefined
   * ```
   * @category Category
   * @since v1.0.0
   */
  /// Manager.getCategoryConfig
  /**
   * The getCategoryIds method returns an array containing all registered
   * category Ids.
   * @returns An array of category Ids.
   * @example
   * This example creates a Manager object and categories called `network` and
   * `file`. Their Ids are retrieved.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * manager.setCategory('file', {maxDuration: 100});
   *
   * console.log(manager.getCategoryIds());
   * // -> ['network', 'file']
   * ```
   * @category Category
   * @since v1.0.0
   */
  /// Manager.getCategoryIds
  /**
   * The delCategory method deletes a category configuration.
   * @param categoryId The Id of the category to delete.
   * @returns A reference to the Manager.
   * @category Category
   * @since v1.0.0
   */
  /// Manager.delCategory
  /**
   * The setTask method registers a Task with the Manager, optionally
   * associating it with a category and/or a custom configuration.
   *
   * The Task is an asynchronous function that is passed an optional string when
   * it is scheduled. This setTask method simply registers it with an Id so a
   * run can be scheduled in the future.
   *
   * The configuration has properties which let you indicate the duration of
   * task runs and their retry behaviors, for example.
   *
   * If this method is called on a Task Id that already exists, its function,
   * category, and configuration will be updated.
   * @param taskId The Id of the Task to register.
   * @param task The Task function to register.
   * @param categoryId The optional Id of a category to associate the Task with.
   * @param config An optional TaskRunConfig to set for all runs of this Task.
   * @returns A reference to the Manager.
   * @category Task
   * @since v1.0.0
   */
  /// Manager.setTask
  /**
   * The getTaskConfig method returns the current configuration of a Task.
   *
   * You can either return just the configuration you have set for this Task, or
   * the full configuration, including any inherited from the category, or
   * defaults of those you have not provided.
   * @param taskId The Id of the Task to get the configuration for.
   * @param withDefaults Whether to return the full configuration including
   * defaults.
   * @returns The configuration as a TaskRunConfig  (or `undefined` if the Task
   * Id does not exist) or TaskRunConfigWithDefaults.
   * @category Task
   * @since v1.0.0
   */
  /// Manager.getTaskConfig
  /**
   * The getTaskIds method returns an array containing all registered Task Ids.
   * @returns An array of Task Ids.
   * @category Task
   * @since v1.0.0
   */
  /// Manager.getTaskIds
  /**
   * The delTask method deletes a Task registration.
   * @param taskId The Id of the Task to delete.
   * @returns A reference to the Manager.
   * @category Task
   * @since v1.0.0
   */
  /// Manager.delTask
  /**
   * The scheduleTaskRun method schedules a specific Task to run in the future.
   *
   * The Task will be executed with the optional string argument provided, and
   * can be configured to start at a specific time (TimestampMs), or after a
   * specific delay (DurationMs).
   *
   * You can also provide a custom TaskRunConfig which lets you indicate the
   * duration of the task run and its retry behaviors, for example.
   *
   * The complete configuration of the test run will be created by merging the
   * properties of this TaskRunConfig with those registered with the Task, and
   * in turn with its category, if any. Any properties not provided will be
   * defaulted by TinyTick. This resolution of the run's configuration is done
   * at the moment the run starts (not when it is scheduled), and will not
   * change subsequently, even if, say, the Task or category are reconfigured
   * after it has started.
   *
   * This method returns a unique Id for the scheduled task run.
   * @param taskId The Id of the Task to run.
   * @param arg An optional string argument to pass to the Task.
   * @param startAfter A timestamp at, or duration after which, the Task should
   * run.
   * @param config An optional TaskRunConfig to set for this run.
   * @returns A new unique Id of the scheduled task run.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.scheduleTaskRun
  /**
   * The getTaskRunConfig method returns the configuration of a task run.
   *
   * You can either return just the configuration you have set for this run, or
   * the full configuration, including any inherited from the Task, its
   * category, or defaults of those you have not provided.
   * @param taskRunId The Id of the task run to get the configuration for.
   * @param withDefaults Whether to return the full configuration including
   * defaults.
   * @returns The configuration as a TaskRunConfig (or `undefined` if the task
   * run Id does not exist) or TaskRunConfigWithDefaults.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getTaskRunConfig
  /**
   * The getTaskRunInfo method returns information about a scheduled or running
   * task run.
   * @param taskRunId The Id of the task run to get information for.
   * @returns The TaskRunInfo for the task run, or `undefined` if the task run
   * Id does not exist.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getTaskRunInfo
  /**
   * The delTaskRun method deletes a scheduled task run or aborts a running one.
   * @param taskRunId The Id of the task run to delete or abort.
   * @returns A reference to the Manager.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.delTaskRun
  /**
   * The getScheduledTaskRunIds method returns an array containing all scheduled
   * task run Ids.
   * @returns An array of task run Ids.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getScheduledTaskRunIds
  /**
   * The getRunningTaskRunIds method returns an array containing all running
   * task run Ids.
   * @returns An array of task run Ids.
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getRunningTaskRunIds
  /**
   * The start method begins the 'ticks' of the Manager, which will start the
   * process of managing the schedules, timeouts, and retries of tasks.
   * @returns A reference to the Manager.
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.start
  /**
   * The stop method stops the 'ticks' of the Manager, which will cease the
   * process of managing the schedules, timeouts, and retries of tasks.
   * @returns A reference to the Manager.
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.stop
  /**
   * The getNow method is a convenience function to get the current timestamp as
   * seen by the Manager.
   * @returns The current timestamp in milliseconds.
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.getNow
}

/**
 * The createManager function creates a Manager, and is the main entry point
 * into the tinytick module.
 *
 * Once you have a reference to the Manager, you can start and stop it, register
 * tasks and categories, and schedule task runs.
 * @returns A new Manager.
 * @example
 * This example creates a Manager object and gets its default configuration.
 *
 * ```js
 * import {createManager} from 'tinytick';
 *
 * const manager = createManager();
 *
 * console.log(manager.getManagerConfig(true));
 * // -> {tickInterval: 100}
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createManager
