/**
 * The ui-react module of the TinyTick project provides both hooks and
 * components to make it easy to use TinyTick in a React application.
 *
 * The hooks in this module primarily provide access to the data and structures
 * exposed by an TinyTick Manager, as initialized by the ManagerProvider
 * component.
 * @packageDocumentation
 * @module ui-react
 * @since v1.1.0
 */
/// ui-react

/**
 * The useManager hook returns the Manager provided by the a ManagerProvider
 * component.
 * @returns The current Manager, or `undefined` if called from outside an active
 * ManagerProvider.
 * @example
 * This example gets the Manager from the ManagerProvider component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {ManagerProvider, useManager} from 'tinytick/ui-react';
 *
 * const App = () => (
 *   <ManagerProvider>
 *     <Pane />
 *   </ManagerProvider>
 * );
 * const Pane = () => (
 *   <span>{useManager().getNow()}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 *
 * ```
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useManager

/**
 * The useSetManagerConfig hook is the equivalent of the Manager's
 * setManagerConfig method, and lets you configure the Manager as a whole.
 *
 * This includes a property which lets you indicate the `tickInterval`. This
 * represents the time between Manager 'ticks' - essentially the heartbeat of
 * how often the Manager should check for new tasks to run, or existing ones to
 * abort.
 * @param config The ManagerConfig to set.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Manager hooks
 * @since v1.1.0
 */
/// useSetManagerConfig
/**
 * The useGetManagerConfig hook is the equivalent of the Manager's
 * getManagerConfig method, and returns the current configuration of the Manager
 * as a whole.
 *
 * You can either return just the configuration you have set, or the full
 * configuration, including any defaults of those you have not provided.
 * @param withDefaults An optional boolean indicating whether to return the full
 * configuration, including defaults.
 * @returns The configuration as a ManagerConfig or ManagerConfigWithDefaults,
 * or `undefined` if called from outside an active ManagerProvider.
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
 * @category Manager hooks
 * @since v1.1.0
 */
/// useGetManagerConfig
/**
 * The useSetCategory hook is the equivalent of the Manager's setCategory
 * method, and lets you create and configure a category for tasks.
 *
 * A category is identified by a string Id, and all tasks associated with that
 * category will inherit its TaskRunConfig. If this method is called on a
 * category Id that already exists, its configuration will be updated.
 *
 * This has properties which let you indicate the duration of task runs and
 * their retry behaviors, for example.
 * @param categoryId The Id of the category to create or update.
 * @param config The TaskRunConfig to set.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Category hooks
 * @since v1.1.0
 */
/// useSetCategory
/**
 * The useGetCategoryConfig hook is the equivalent of the Manager's
 * getCategoryConfig method, and returns the current configuration of a
 * category.
 *
 * You can either return just the configuration you have set for this category,
 * or the full configuration, including any defaults of those you have not
 * provided.
 *
 * If the category Id does not exist, this method will return `undefined`.
 * @param categoryId The Id of the category to get the configuration for.
 * @param withDefaults An optional boolean indicating whether to return the full
 * configuration, including defaults.
 * @returns The configuration as a TaskRunConfig (or `undefined` if the category
 * Id does not exist) or TaskRunConfigWithDefaults, or `undefined` if called
 * from outside an active ManagerProvider.
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
 * @category Category hooks
 * @since v1.1.0
 */
/// useGetCategoryConfig
/**
 * The useGetCategoryIds hook is the equivalent of the Manager's getCategoryIds
 * method, and returns an array containing all registered category Ids.
 * @returns An array of category Ids, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Category hooks
 * @since v1.1.0
 */
/// useGetCategoryIds
/**
 * The useDelCategory hook is the equivalent of the Manager's delCategory
 * method, and deletes a category configuration.
 * @param categoryId The Id of the category to delete.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Category hooks
 * @since v1.1.0
 */
/// useDelCategory
/**
 * The useSetTask hook is the equivalent of the Manager's setTask method, and
 * registers a task with the Manager, optionally associating it with a category
 * and/or a custom configuration.
 *
 * The task is an asynchronous function that is passed an optional string when
 * it is scheduled. This setTask method simply registers it with an Id so a run
 * can be scheduled in the future.
 *
 * The configuration has properties which let you indicate the duration of task
 * runs and their retry behaviors, for example.
 *
 * If this method is called on a task Id that already exists, its function,
 * category, and configuration will be updated.
 * @param taskId The Id of the task to register.
 * @param task The task function to register.
 * @param categoryId The optional Id of a category to associate the task with.
 * @param config An optional TaskRunConfig to set for all runs of this Task.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Task hooks
 * @since v1.1.0
 */
/// useSetTask
/**
 * The useGetTaskConfig hook is the equivalent of the Manager's getTaskConfig
 * method, and returns the current configuration of a Task.
 *
 * You can either return just the configuration you have set for this Task, or
 * the full configuration, including any inherited from the category, or
 * defaults of those you have not provided.
 *
 * If the task Id does not exist, this method will return `undefined`.
 * @param taskId The Id of the task to get the configuration for.
 * @param withDefaults An optional boolean indicating whether to return the full
 * configuration, including defaults.
 * @returns The configuration as a TaskRunConfig  (or `undefined` if the Task Id
 * does not exist) or TaskRunConfigWithDefaults, or `undefined` if called from
 * outside an active ManagerProvider.
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
 * @category Task hooks
 * @since v1.1.0
 */
/// useGetTaskConfig
/**
 * The useGetTaskIds hook is the equivalent of the Manager's getTaskIds method,
 * and returns an array containing all registered task Ids.
 * @returns An array of task Ids, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Task hooks
 * @since v1.1.0
 */
/// useGetTaskIds
/**
 * The useDelTask hook is the equivalent of the Manager's delTask method, and
 * deletes a task registration.
 * @param taskId The Id of the task to delete.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Task hooks
 * @since v1.1.0
 */
/// useDelTask
/**
 * The useScheduleTaskRun hook is the equivalent of the Manager's
 * scheduleTaskRun method, and schedules a specific task to run in the future.
 *
 * The task will be executed with the optional string argument provided, and can
 * be configured to start at a specific time (TimestampMs), or after a specific
 * delay (DurationMs).
 *
 * You can also provide a custom TaskRunConfig which lets you indicate the
 * duration of the task run and its retry behaviors, for example.
 *
 * The complete configuration of the task run will be created by merging the
 * properties of this TaskRunConfig with those registered with the Task, and in
 * turn with its category, if any. Any properties not provided will be defaulted
 * by TinyTick. This resolution of the run's configuration is done at the moment
 * the run starts (not when it is scheduled), but after that, it will not change
 * subsequently, even if, say, the task or category are reconfigured after it
 * has started.
 *
 * This method returns a unique Id for the scheduled task run. However, if the
 * Manager is in the stopping state, new task runs can not be scheduled, and in
 * that case, the method will return `undefined`.
 * @param taskId The Id of the task to run, or `undefined` if unsuccessful.
 * @param arg An optional string argument to pass to the Task.
 * @param startAfter A timestamp at, or duration after which, the task should
 * run.
 * @param config An optional TaskRunConfig to set for this run.
 * @returns A new unique Id of the scheduled task run, or `undefined` if called
 * from outside an active ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useScheduleTaskRun
/**
 * The useGetTaskRunConfig hook is the equivalent of the Manager's
 * getTaskRunConfig method, and returns the configuration of a task run.
 *
 * You can either return just the configuration you have set for this run, or
 * the full configuration, including any inherited from the Task, its category,
 * or defaults of those you have not provided.
 *
 * If the task run Id does not exist, this method will return `undefined`.
 * @param taskRunId The Id of the task run to get the configuration for.
 * @param withDefaults An optional boolean indicating whether to return the full
 * configuration including defaults.
 * @returns The configuration as a TaskRunConfig (or `undefined` if the task run
 * Id does not exist) or TaskRunConfigWithDefaults, or `undefined` if called
 * from outside an active ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useGetTaskRunConfig
/**
 * The useGetTaskRunInfo hook is the equivalent of the Manager's getTaskRunInfo
 * method, and returns information about a scheduled or running task run.
 *
 * If the task run Id does not exist, this method will return `undefined`.
 * @param taskRunId The Id of the task run to get information for.
 * @returns The TaskRunInfo for the task run, or `undefined` if the task run Id
 * does not exist, or `undefined` if called from outside an active
 * ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useGetTaskRunInfo
/**
 * The useDelTaskRun hook is the equivalent of the Manager's delTaskRun method,
 * and deletes a scheduled task run or aborts a running one.
 * @param taskRunId The Id of the task run to delete or abort.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useDelTaskRun
/**
 * The useGetScheduledTaskRunIds hook is the equivalent of the Manager's
 * getScheduledTaskRunIds method, and returns an array containing all scheduled
 * task run Ids.
 *
 * When first scheduled, a task run will appear in this list. Once it starts
 * running, it will disappear from this list and appear on the list of running
 * task runs, accessible instead with the getRunningTaskRunIds method.
 * @returns An array of task run Ids, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useGetScheduledTaskRunIds
/**
 * The useGetRunningTaskRunIds hook is the equivalent of the Manager's
 * getRunningTaskRunIds method, and returns an array containing all running task
 * run Ids.
 *
 * When first scheduled, a task run will not appear in this list, but will
 * appear in the list of scheduled task runs, accessible with the
 * getScheduledTaskRunIds method. Once it starts running, it will instead move
 * to appear on this list.
 * @returns An array of task run Ids, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category TaskRun hooks
 * @since v1.1.0
 */
/// useGetRunningTaskRunIds
/**
 * The useStart method hook is the equivalent of the Manager's start method, and
 * the 'ticks' of the Manager, which will start the process of managing the
 * schedules, timeouts, and retries of tasks.
 *
 * Note that this method will not _immediately_ run any due task runs. Instead
 * it will wait for the next tickInterval to pass before doing so. This means
 * that you can expect this method to return very quickly.
 *
 * Though you can stop and start the Manager as many times as you like, it is
 * expected that you will only start it once at the beginning of your app's
 * lifecycle, and then stop it when it closes and you are cleaning up.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useStart
/**
 * The useStop method hook is the equivalent of the Manager's stop method, and
 * 'ticks' of the Manager, which will cease the process of managing the
 * schedules, timeouts, and retries of tasks.
 *
 * Note that this will not abort any task runs currently underway, and by
 * default, it will wait for all future scheduled tasks to complete too.
 * (However, during this 'stopping' phase, no new task runs can be scheduled, in
 * case a task recursively schedules a new run of itself and the Manager can
 * therefore never stop).
 *
 * You can also use the optional `force` parameter to stop the Manager
 * immediately. This will still not abort any task runs currently underway, but
 * it will _not_ wait for future scheduled tasks to complete. These will remain
 * in the schedule list and will be run if the Manager is ever started again.
 * @param force Whether to stop the Manager immediately instead of waiting for
 * all scheduled task runs to complete.
 * @returns A reference to the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
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
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useStop
/**
 * The useGetStatus hook is the equivalent of the Manager's getStatus method,
 * and returns the current status of the Manager.
 *
 * This returns a simple numeric value that indicates whether the Manager is
 * stopped (0), running (1), or stopping (2).
 * @returns The status of the Manager, or `undefined` if called from outside an
 * active ManagerProvider.
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useGetStatus
/**
 * The useGetNow hook is the equivalent of the Manager's getNow method, and is a
 * convenience function to get the current timestamp as seen by the Manager.
 *
 * It is simply an alias for the JavaScript `Date.now` function.
 * @returns The current timestamp in milliseconds, or `undefined` if called from
 * outside an active ManagerProvider.
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
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useGetNow
/**
 * ManagerProviderProps props are used with the Manager component, so that a
 * TinyTick Manager can be passed into the context of an application and used
 * throughout.
 * @category Props
 * @since v1.1.0
 */
/// ManagerProviderProps
{
  /**
   * Whether the Manager should be started on first render, defaulting to
   * `true`.
   * @category Prop
   * @since v1.1.0
   */
  /// ManagerProviderProps.started
  /**
   * Whether the Manager should be force-stopped when the context is unmounted,
   * defaulting to `true`.
   * @category Prop
   * @since v1.1.0
   */
  /// ManagerProviderProps.forceStop
}
/**
 * The ManagerProvider component is used to wrap part of an application in a
 * context that provides a Manager to be used by hooks and components within.
 * @param props The props for this component.
 * @returns A rendering of the child components.
 * @category Context components
 * @since v1.1.0
 */
/// ManagerProvider
