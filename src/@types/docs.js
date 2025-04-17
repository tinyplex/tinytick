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
 * The IdOrNull type is a simple alias for the union of a string or `null`
 * value, where typically `null` indicates a wildcard - such as when used in the
 * Manager's addScheduledTaskRunListener method.
 * @category Identity
 * @since v1.2.0
 */
/// IdOrNull
/**
 * The Ids type is a simple alias for an array of strings.
 *
 * It is used to indicate that the strings should be considered to be the keys
 * of objects (such as those identifying task run, or category objects).
 * @category Identity
 * @since v1.0.0
 */
/// Ids
/**
 * The IdAddedOrRemoved type describes a change made to an Id in a list of Ids.
 *
 * This type is used in other types like ChangedTaskRunIds.
 *
 * It is a simple number: a 1 indicates that a given Id was added to a list of
 * Ids, and a -1 indicates that it was removed.
 * @category Identity
 * @since v1.2.0
 */
/// IdAddedOrRemoved
/**
 * The ChangedIds type describes the Ids that were added or removed from a list
 * of Ids.
 *
 * It is a simple object that has a Ids as keys, and an IdAddedOrRemoved number
 * indicating whether Table Id was added (1) or removed (-1).
 * @category Identity
 * @since v1.2.0
 */
/// ChangedIds
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
 * A task is an asynchronous function that is passed an optional string
 * argument, an AbortSignal to indicate that execution should be ceased, and a
 * reference to the Manager so that additional task runs can be scheduled if
 * needed.
 *
 * Note that a task can throw an exception to indicate that it has failed. It
 * will then be considered for retrying if the run's TaskRunConfig allows for
 * it.
 * @param arg A string argument that might have been provided when the task was
 * scheduled to run (or `undefined` if not).
 * @param signal An AbortSignal that can be used to detect that the Task should
 * cease execution.
 * @param info A TaskRunInfo object representing information about this test
 * run.
 * @category Task
 * @since v1.0.0
 */
/// Task
/**
 * The ManagerStatus enum represents the current status of the Manager.
 * @category Manager
 * @since v1.0.0
 */
/// ManagerStatus
{
  /**
   * Indicates that the Manager is stopped.
   * @category Enum
   * @since v1.2.0
   */
  /// ManagerStatus.Stopped
  /**
   * Indicates that the Manager is running.
   * @category Enum
   * @since v1.2.0
   */
  /// ManagerStatus.Running
  /**
   * Indicates that the Manager is stopping - in other words, completing its
   * outstanding task runs.
   * @category Enum
   * @since v1.2.0
   */
  /// ManagerStatus.Stopping
}
/**
 * The ManagerConfig type represents a configuration you can provide for the
 * Manager as a whole.
 *
 * This includes a property which lets you indicate the `tickInterval`. This
 * represents the time between Manager 'ticks' - essentially the heartbeat of
 * how often the Manager should check for new tasks to run, or existing ones to
 * abort.
 *
 * Use the setManagerConfig method to configure the Manager with this type.
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
 * This can be provided for a specific task run (via the scheduleTaskRun
 * method), all runs of a task (via the setTask method), or for all runs of
 * tasks in a category (via the setCategory method).
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
 * Its properties include the task Id, any argument provided, whether it is
 * currently running, and so on. This is passed to a task when it runs, so can
 * be used for understanding the context of the run (such as whether it is a
 * retry, and so on).
 * @category TaskRun
 * @since v1.0.0
 */
/// TaskRunInfo
{
  /**
   * A reference to the Manager that is running the task.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.manager
  /**
   * The Id of the task that is being run.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.taskId
  /**
   * The Id of the task run itself.
   * @category TaskRun
   * @since v1.0.0
   */
  /// TaskRunInfo.taskRunId
  /**
   * The string argument that was provided when the task was scheduled to run,
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
 * The TaskRunReason enum is used to indicate why a task run changed, most
 * usefully when it finishes.
 *
 * The enum is used to listen to just certain types of task run completions
 * (success, timeouts, or errors), and is also passed to a TaskRunListener
 * function.
 * @category TaskRun
 * @since v1.2.0
 */
/// TaskRunReason
{
  /**
   * Indicates that the task run was scheduled.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.Scheduled
  /**
   * Indicates that the task run was started because it was due.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.Started
  /**
   * Indicates that the task run finished successfully.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.Succeeded
  /**
   * Indicates that the task run finished because it timed out.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.TimedOut
  /**
   * Indicates that the task run finished because it threw an error.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.Errored
  /**
   * Indicates that the task run finished because the task run was deleted while
   * running.
   * @category Enum
   * @since v1.2.0
   */
  /// TaskRunReason.Deleted
}
/**
 * The TickListener type describes a function that is used to listen to the fact
 * that the Manager is either about to tick or did just tick.
 *
 * A TickListener is provided when using the addWillTickListener method or the
 * addDidTickListener method. See those methods for specific examples.
 * @param manager A reference to the Manager that is either about to tick or did
 * just tick.
 * @category Listener
 * @since v1.2.0
 */
/// TickListener
/**
 * The TaskRunIdsListener type describes a function that is used to listen to
 * changes to task run Ids in the Manager.
 *
 * A TaskRunIdsListener is provided when using the
 * addScheduledTaskRunIdsListener method or the addRunningTaskRunIdsListener.
 * See those methods for specific examples.
 *
 * When called, a TaskRunIdsListener is given a reference to the Manager and an
 * object listing all the Ids that have been added or removed from the list.
 * @param manager A reference to the Manager that changed.
 * @param idChanges An object listing all the Ids that have been added or
 * removed from the list.
 * @category Listener
 * @since v1.2.0
 */
/// TaskRunIdsListener
/**
 * The TaskRunListener type describes a function that is used to listen to
 * changes to a specific task run in the Manager.
 *
 * A TaskRunListener is provided when using the addTaskRunListener method. See
 * that method for specific examples.
 *
 * When called, a TaskRunListener is given a reference to the Manager, the Id of
 * the task, the Id of the task run that changed, the way in which it changed,
 * and the reason for that change.
 * @param manager A reference to the Manager that changed.
 * @param taskId The Id of the task that changed.
 * @param taskRunId The Id of the task run that changed.
 * @param running Whether the task run is now running (`true`), scheduled
 * (`false`), or deleted (`undefined`).
 * @param reason The reason the task run changed.
 * @category Listener
 * @since v1.2.0
 */
/// TaskRunListener
/**
 * The TaskRunFailedListener type describes a function that is used to listen to
 * a failing task run, whether because of timeout, error, or deletion.
 *
 * A TaskRunFailedListener is provided when using the addTaskRunFailedListener
 * method. See that method for specific examples.
 *
 * When called, a TaskRunFailedListener is given a reference to the Manager, the
 * Id of the task, the Id of the task run that changed, the reason it
 * failed, and a string message (in the case of an error being thrown).
 * @param manager A reference to the Manager that changed.
 * @param taskId The Id of the task that changed.
 * @param taskRunId The Id of the task run that changed.
 * @param reason The reason the task run failed.
 * @param message A string message indicating the reason for the failure (in the
 * case of an error being thrown).
 * @category Listener
 * @since v1.2.0
 */
/// TaskRunFailedListener
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
   * @param withDefaults An optional boolean indicating whether to return the
   * full configuration, including defaults.
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
   * A category is identified by a string Id, and all tasks associated with that
   * category will inherit its TaskRunConfig. If this method is called on a
   * category Id that already exists, its configuration will be updated.
   *
   * This has properties which let you indicate the duration of task runs and
   * their retry behaviors, for example.
   * @param categoryId The Id of the category to create or update.
   * @param config The TaskRunConfig to set.
   * @returns A reference to the Manager.
   * @example
   * This example creates a category called `network` with a specific maximum
   * duration.
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
   * This example creates a category with some invalid configuration items
   * (which are ignored).
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
   * @param withDefaults An optional boolean indicating whether to return the
   * full configuration, including defaults.
   * @returns The configuration as a TaskRunConfig (or `undefined` if the
   * category Id does not exist) or TaskRunConfigWithDefaults.
   * @example
   * This example creates a category called `network` with a specific maximum
   * duration. Its configuration can be accessed with or without the defaults
   * included.
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
   * This example tries to get the configuration of a category that does not
   * exist. The method returns `undefined`.
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
   * This example creates categories called `network` and `file`. Their Ids are
   * retrieved.
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
   * @example
   * This example creates a category called `network` which is then deleted.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * console.log(manager.getCategoryIds());
   * // -> ['network']
   *
   * manager.delCategory('network');
   * console.log(manager.getCategoryIds());
   * // -> []
   * ```
   * @category Category
   * @since v1.0.0
   */
  /// Manager.delCategory
  /**
   * The setTask method registers a task with the Manager, optionally
   * associating it with a category and/or a custom configuration.
   *
   * The task is an asynchronous function that is passed an optional string when
   * it is scheduled. This setTask method simply registers it with an Id so a
   * run can be scheduled in the future.
   *
   * The configuration has properties which let you indicate the duration of
   * task runs and their retry behaviors, for example.
   *
   * If this method is called on a task Id that already exists, its function,
   * category, and configuration will be updated.
   * @param taskId The Id of the task to register.
   * @param task The task function to register.
   * @param categoryId The optional Id of a category to associate the task with.
   * @param config An optional TaskRunConfig to set for all runs of this Task.
   * @returns A reference to the Manager.
   * @example
   * This example registers a task called `ping` that fetches content from a
   * website.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * console.log(manager.getTaskIds());
   * // -> ['ping']
   * ```
   * @example
   * This example registers a task called `ping` that fetches content from a
   * website. It has some task-specific configuration.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask(
   *   'ping',
   *   async () => await fetch('https://example.org'),
   *   undefined,
   *   {maxRetries: 3},
   * );
   *
   * console.log(manager.getTaskConfig('ping', true));
   * // -> {maxDuration: 1000, maxRetries: 3, retryDelay: 1000}
   * ```
   * @example
   * This example registers a task called `ping` that fetches content from a
   * website. It is given the category of 'network', which has been given some
   * specific configuration.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * manager.setTask(
   *   'ping',
   *   async () => await fetch('https://example.org'),
   *   'network',
   * );
   *
   * console.log(manager.getTaskConfig('ping', true));
   * // -> {maxDuration: 5000, maxRetries: 0, retryDelay: 1000}
   * ```
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
   *
   * If the task Id does not exist, this method will return `undefined`.
   * @param taskId The Id of the task to get the configuration for.
   * @param withDefaults An optional boolean indicating whether to return the
   * full configuration, including defaults.
   * @returns The configuration as a TaskRunConfig  (or `undefined` if the Task
   * Id does not exist) or TaskRunConfigWithDefaults.
   * @example
   * This example creates a category, and registers a task for which the
   * configuration is returned.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * manager.setTask(
   *   'ping',
   *   async () => await fetch('https://example.org'),
   *   'network',
   *   {maxRetries: 3},
   * );
   *
   * console.log(manager.getTaskConfig('ping', true));
   * // -> {maxDuration: 5000, maxRetries: 3, retryDelay: 1000}
   * ```
   * @example
   * This example tries to return the configuration of a task that does not
   * exist. The method returns `undefined`.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   *
   * console.log(manager.getTaskConfig('oops'));
   * // -> undefined
   * console.log(manager.getTaskConfig('oops', true));
   * // -> undefined
   * ```
   * @category Task
   * @since v1.0.0
   */
  /// Manager.getTaskConfig
  /**
   * The getTaskIds method returns an array containing all registered task Ids.
   * @returns An array of task Ids.
   * @example
   * This example creates tasks called `ping` and `pong`. Their Ids are
   * retrieved.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => {});
   * manager.setTask('pong', async () => {});
   *
   * console.log(manager.getTaskIds());
   * // -> ['ping', 'pong']
   * ```
   * @category Task
   * @since v1.0.0
   */
  /// Manager.getTaskIds
  /**
   * The delTask method deletes a task registration.
   * @param taskId The Id of the task to delete.
   * @returns A reference to the Manager.
   * @example
   * This example creates a task called `ping` which is then deleted.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => {});
   * console.log(manager.getTaskIds());
   * // -> ['ping']
   *
   * manager.delTask('ping');
   * console.log(manager.getTaskIds());
   * // -> []
   * ```
   * @category Task
   * @since v1.0.0
   */
  /// Manager.delTask
  /**
   * The scheduleTaskRun method schedules a specific task to run in the future.
   *
   * The task will be executed with the optional string argument provided, and
   * can be configured to start at a specific time (TimestampMs), or after a
   * specific delay (DurationMs).
   *
   * You can also provide a custom TaskRunConfig which lets you indicate the
   * duration of the task run and its retry behaviors, for example.
   *
   * The complete configuration of the task run will be created by merging the
   * properties of this TaskRunConfig with those registered with the Task, and
   * in turn with its category, if any. Any properties not provided will be
   * defaulted by TinyTick. This resolution of the run's configuration is done
   * at the moment the run starts (not when it is scheduled), but after that, it
   * will not change subsequently, even if, say, the task or category are
   * reconfigured after it has started.
   *
   * This method returns a unique Id for the scheduled task run. However, if the
   * Manager is in the stopping state, new task runs can not be scheduled, and
   * in that case, the method will return `undefined`.
   * @param taskId The Id of the task to run, or `undefined` if unsuccessful.
   * @param arg An optional string argument to pass to the Task.
   * @param startAfter A timestamp at, or duration after which, the task should
   * run.
   * @param config An optional TaskRunConfig to set for this run.
   * @returns A new unique Id of the scheduled task run.
   * @example
   * This example registers a task that is then scheduled to run.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * const taskRunId = manager.scheduleTaskRun('ping');
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   *
   * console.log(manager.getTaskRunConfig(taskRunId, true));
   * // -> {maxDuration: 1000, maxRetries: 0, retryDelay: 1000}
   * ```
   * @example
   * This example registers a task that takes a string parameter and that is
   * then scheduled to run with an argument.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async (url) => await fetch(url));
   *
   * const taskRunId = manager.scheduleTaskRun('ping', 'https://example.org');
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   *
   * console.log(manager.getTaskRunInfo(taskRunId).arg);
   * // -> 'https://example.org'
   * ```
   * @example
   * This example registers a task that has a category and that is then
   * scheduled to run. Configuration is provided, for the category, the task,
   * and this specific run.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * manager.setTask(
   *   'ping',
   *   async () => await fetch('https://example.org'),
   *   'network',
   *   {maxRetries: 3},
   * );
   * const taskRunId = manager.scheduleTaskRun('ping', '', 0, {retryDelay: 10});
   *
   * console.log(manager.getTaskRunConfig(taskRunId, true));
   * // -> {maxDuration: 5000, maxRetries: 3, retryDelay: 10}
   * ```
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
   *
   * If the task run Id does not exist, this method will return `undefined`.
   * @param taskRunId The Id of the task run to get the configuration for.
   * @param withDefaults An optional boolean indicating whether to return the
   * full configuration including defaults.
   * @returns The configuration as a TaskRunConfig (or `undefined` if the task
   * run Id does not exist) or TaskRunConfigWithDefaults.
   * @example
   * This example registers a task that has a category and that is then
   * scheduled to run. The configuration is then returned.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setCategory('network', {maxDuration: 5000});
   * manager.setTask(
   *   'ping',
   *   async () => await fetch('https://example.org'),
   *   'network',
   *   {maxRetries: 3},
   * );
   * const taskRunId = manager.scheduleTaskRun('ping', '', 0, {retryDelay: 10});
   *
   * console.log(manager.getTaskRunConfig(taskRunId));
   * // -> {retryDelay: 10}
   * console.log(manager.getTaskRunConfig(taskRunId, true));
   * // -> {maxDuration: 5000, maxRetries: 3, retryDelay: 10}
   * ```
   * @example
   * This example tries to return the configuration of a task run that does not
   * exist. The method returns `undefined`.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   *
   * console.log(manager.getTaskRunConfig('oops'));
   * // -> undefined
   * console.log(manager.getTaskRunConfig('oops', true));
   * // -> undefined
   * ```
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getTaskRunConfig
  /**
   * The getTaskRunInfo method returns information about a scheduled or running
   * task run.
   *
   * If the task run Id does not exist, this method will return `undefined`.
   * @param taskRunId The Id of the task run to get information for.
   * @returns The TaskRunInfo for the task run, or `undefined` if the task run
   * Id does not exist.
   * @example
   * This example registers a task that is then scheduled to run. The info is
   * then returned.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async (url) => await fetch(url));
   * const taskRunId = manager.scheduleTaskRun('ping', 'https://example.org');
   *
   * const info = manager.getTaskRunInfo(taskRunId);
   * console.log(info.taskId);
   * // -> 'ping'
   * console.log(info.arg);
   * // -> 'https://example.org'
   * console.log(info.running);
   * // -> false
   * ```
   * @example
   * This example tries to return the info of a task run that does not exist.
   * The method returns `undefined`.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   *
   * console.log(manager.getTaskRunInfo('oops'));
   * // -> undefined
   * console.log(manager.getTaskRunInfo('oops', true));
   * // -> undefined
   * ```
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getTaskRunInfo
  /**
   * The delTaskRun method deletes a scheduled task run or aborts a running one.
   * @param taskRunId The Id of the task run to delete or abort.
   * @returns A reference to the Manager.
   * @example
   * This example registers a task that is then scheduled to run. The task run
   * is then deleted.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * const taskRunId = manager.scheduleTaskRun('ping');
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   *
   * manager.delTaskRun(taskRunId);
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 0
   * ```
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.delTaskRun
  /**
   * The getScheduledTaskRunIds method returns an array containing all scheduled
   * task run Ids.
   *
   * When first scheduled, a task run will appear in this list. Once it starts
   * running, it will disappear from this list and appear on the list of running
   * task runs, accessible instead with the getRunningTaskRunIds method.
   * @returns An array of task run Ids.
   * @example
   * This example registers a task that is then scheduled to run twice.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * const taskRunId1 = manager.scheduleTaskRun('ping');
   * const taskRunId2 = manager.scheduleTaskRun('ping');
   *
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 2
   * console.log(manager.getScheduledTaskRunIds()[0] == taskRunId1);
   * // -> true
   * console.log(manager.getScheduledTaskRunIds()[1] == taskRunId2);
   * // -> true
   * ```
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getScheduledTaskRunIds
  /**
   * The getRunningTaskRunIds method returns an array containing all running
   * task run Ids.
   *
   * When first scheduled, a task run will not appear in this list, but will
   * appear in the list of scheduled task runs, accessible with the
   * getScheduledTaskRunIds method. Once it starts running, it will instead move
   * to appear on this list.
   * @returns An array of task run Ids.
   * @example
   * This example registers a task that is then scheduled to run. Once it runs,
   * its Id appears on the list of running tasks.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * const taskRunId = manager.scheduleTaskRun('ping');
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 0
   *
   * manager.start();
   *
   * // ... wait 100ms (the Manager tickInterval) for task run to start
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 0
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 1
   * console.log(manager.getRunningTaskRunIds()[0] == taskRunId);
   * // -> true
   *
   * // ... wait 100ms (another tick) for task run to finish
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 0
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 0
   * ```
   * @category TaskRun
   * @since v1.0.0
   */
  /// Manager.getRunningTaskRunIds
  /**
   * The addWillTickListener method registers a listener function with the
   * Manager that will be called just before the Manager ticks.
   *
   * The provided listener is a TickListener function, and will be called with a
   * reference to the Manager.
   * @param listener The function that will be called just before the Manager
   * ticks.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addWillTickListener
  /**
   * The addDidTickListener method registers a listener function with the
   * Manager that will be called just after the Manager ticks.
   *
   * The provided listener is a TickListener function, and will be called with a
   * reference to the Manager.
   * @param listener The function that will be called just after the Manager
   * ticks.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addDidTickListener
  /**
   * The addScheduledTaskRunIdsListener method registers a listener function
   * with the Manager that will be called whenever its list of scheduled task
   * run Ids changes.
   *
   * The provided listener is a TaskRunIdsListener function, and will be called
   * with a reference to the Manager.
   * @param listener The function that will be called whenever the list of
   * scheduled task run Ids changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to new task runs being
   * scheduled.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager().start();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   *
   * const listenerId = manager.addScheduledTaskRunIdsListener(
   *   (manager) => {
   *     console.log(
   *       manager.getScheduledTaskRunIds().length + ' scheduled Ids',
   *     );
   *   },
   * );
   *
   * const taskRunId1 = manager.scheduleTaskRun('ping', '', 200);
   * // -> '1 scheduled Ids'
   * const taskRunId2 = manager.scheduleTaskRun('ping', '', 400);
   * // -> '2 scheduled Ids'
   *
   * manager.delListener(listenerId);
   * ```
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addScheduledTaskRunIdsListener
  /**
   * The addRunningTaskRunIdsListener method.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addRunningTaskRunIdsListener
  /**
   * The addTaskRunListener method registers a listener function with the
   * Manager that will be called whenever the state of a relevant task run
   * changes.
   *
   * The provided listener is a TaskRunListener function, and will be called
   * with a reference to the Manager, the Id of the task, the Id of the task run
   * that was started, how it changed, and the reason for the change.
   *
   * You can either listen for a run of a single task starting (by specifying
   * the task Id as the method's first parameter) or for a run of any task
   * starting (by providing a `null` wildcard). You can specify a specific task
   * run Id to listen for with the second parameter, or `null` to listen for any
   * matching task run starting.
   * @param taskId The Id of the task, or `null` as a wildcard.
   * @param taskRunId The Id of the task run, or `null` as a wildcard.
   * @param listener The function that will be called whenever a matching task
   * run has changed.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addTaskRunListener
  /**
   * The addTaskRunFailedListener method registers a listener function with the
   * Manager that will be called whenever a task run fails, whether because of
   * timeout, error, or deletion.
   *
   * The provided listener is a TaskRunFailedListener function, and will be
   * called with a reference to the Manager, the Id of the task, the Id of the
   * task run that changed, the reason it failed, and a string message (in the
   * case of an error being thrown).
   *
   * You can either listen for a run of a single task starting (by specifying
   * the task Id as the method's first parameter) or for a run of any task
   * starting (by providing a `null` wildcard). You can specify a specific task
   * run Id to listen for with the second parameter, or `null` to listen for any
   * matching task run starting.
   * @param taskId The Id of the task, or `null` as a wildcard.
   * @param taskRunId The Id of the task run, or `null` as a wildcard.
   * @param listener The function that will be called whenever a matching task
   * run has failed.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.addTaskRunFailedListener
  /**
   * The delListener method.
   * @category Listener
   * @since v1.2.0
   */
  /// Manager.delListener
  /**
   * The start method begins the 'ticks' of the Manager, which will start the
   * process of managing the schedules, timeouts, and retries of tasks.
   *
   * Note that this method will not _immediately_ run any due task runs. Instead
   * it will wait for the next tickInterval to pass before doing so. This means
   * that you can expect this method to return very quickly.
   *
   * Though you can stop and start the Manager as many times as you like, it is
   * expected that you will only start it once at the beginning of your app's
   * lifecycle, and then stop it when it closes and you are cleaning up.
   * @returns A reference to the Manager.
   * @example
   * This example registers a task that is then scheduled to run. The Manager is
   * then started, and one `tickInterval` later, the task run starts.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   * manager.scheduleTaskRun('ping');
   *
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 0
   *
   * manager.start();
   * // ... wait 100ms (the Manager tickInterval) for task run to start
   *
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 1
   * ```
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.start
  /**
   * The stop method stops the 'ticks' of the Manager, which will cease the
   * process of managing the schedules, timeouts, and retries of tasks.
   *
   * Note that this will not abort any task runs currently underway, and by
   * default, it will wait for all future scheduled tasks to complete too.
   * (However, during this 'stopping' phase, no new task runs can be scheduled,
   * in case a task recursively schedules a new run of itself and the Manager
   * can therefore never stop).
   *
   * You can also use the optional `force` parameter to stop the Manager
   * immediately. This will still not abort any task runs currently underway,
   * but it will _not_ wait for future scheduled tasks to complete. These will
   * remain in the schedule list and will be run if the Manager is ever started
   * again.
   * @param force Whether to stop the Manager immediately instead of waiting for
   * all scheduled task runs to complete.
   * @returns A reference to the Manager.
   * @example
   * This example registers a task that is then scheduled to run twice. The
   * Manager is started, and one `tickInterval` later, stopped again. With the
   * `force` flag set, only the first task run is executed. If it had been
   * omitted or false, the Manager would only have stopped after the second
   * outstanding task had run.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * manager.setTask('ping', async () => await fetch('https://example.org'));
   * manager.scheduleTaskRun('ping');
   * manager.scheduleTaskRun('ping', '', 200); // In two tick intervals' time
   *
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 2
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 0
   *
   * manager.start();
   * // ... wait 100ms (the Manager tickInterval) for task run to start
   *
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 1
   *
   * manager.stop(true);
   * // ... wait 100ms; the first task run will end but the second won't start
   *
   * console.log(manager.getScheduledTaskRunIds().length);
   * // -> 1
   * console.log(manager.getRunningTaskRunIds().length);
   * // -> 0
   * ```
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.stop
  /**
   * The getStatus method returns the current status of the Manager.
   *
   * This returns a simple numeric value that indicates whether the Manager is
   * stopped (0), running (1), or stopping (2).
   * @returns The status of the Manager.
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Manager.getStatus
  /**
   * The getNow method is a convenience function to get the current timestamp as
   * seen by the Manager.
   *
   * It is simply an alias for the JavaScript `Date.now` function.
   * @returns The current timestamp in milliseconds.
   * @example
   * This example gets the current time in milliseconds from the Manager.
   *
   * ```js
   * import {createManager} from 'tinytick';
   *
   * const manager = createManager();
   * console.log(manager.getNow() == Date.now());
   * // -> true
   * ```
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
 * @example
 * This example creates a Manager object and then starts it immediately. Most of
 * the time you will want to do this so that scheduled tasks start running on
 * time.
 *
 * ```js
 * import {createManager} from 'tinytick';
 *
 * const manager = createManager();
 * manager.start();
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createManager
