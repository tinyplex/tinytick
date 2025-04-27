/**
 * The ui-react module of the TinyTick project provides both hooks and
 * components to make it easy to use TinyTick in a React application.
 *
 * The hooks in this module primarily provide access to the data and structures
 * exposed by an TinyTick Manager, as initialized by the Provider component.
 * @packageDocumentation
 * @module ui-react
 * @since v1.1.0
 */
/// ui-react

/**
 * The useCreateManager hook is used to create a Manager within a React
 * application with convenient memoization.
 *
 * It is possible to create a Manager outside of the React app with the regular
 * createManager function and pass it in, but you may prefer to create it within
 * the app, perhaps inside the top-level component. To prevent a new Manager
 * being created every time the app renders or re-renders, the useCreateManager
 * hook wraps the creation in a memoization.
 *
 * The useCreateManager hook is a very thin wrapper around the React `useMemo`
 * hook, defaulting to an empty array for its dependencies, so that by default,
 * the creation only occurs once.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should cause the Manager to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 * @param create A function for performing the creation of the Manager, plus any
 * additional steps such as starting it, and returning it.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Manager.
 * @example
 * This example creates an empty Manager at the top level of a React
 * application. Even though the App component is rendered twice, the Manager
 * creation only occurs once by default.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {useCreateManager} from 'tinytick/ui-react';
 *
 * const App = () => {
 *   const manager = useCreateManager(() => {
 *     console.log('Manager created');
 *     return createManager().start();
 *   });
 *   return <span>{manager.getStatus()}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Manager created'
 *
 * root.render(<App />); // !act
 * // No second Manager creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 * ```
 * @example
 * This example creates an empty Manager at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateManager hook takes the `managerStarted` prop as
 * a dependency, and so the Manager is created again on the second render.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {useCreateManager} from 'tinytick/ui-react';
 *
 * const App = ({managerStarted}) => {
 *   const manager = useCreateManager(() => {
 *     console.log(`New Manager, ${managerStarted ? 'started' : 'stopped'}`);
 *     return createManager()[managerStarted ? 'start' : 'stop']();
 *   }, [managerStarted]);
 *   return <span>{manager.getStatus()}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App managerStarted={true} />); // !act
 * // -> 'New Manager, started'
 *
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 *
 * root.render(<App managerStarted={false} />); // !act
 * // -> 'New Manager, stopped'
 *
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Manager hooks
 * @since v1.1.0
 */
/// useCreateManager

/**
 * The useManager hook returns the Manager provided by the a Provider component.
 * @returns The current Manager, or `undefined` if called from outside an active
 * Provider.
 * @example
 * This example shows how to use the `useManager` hook within a component that's
 * nested inside a Provider.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useManager} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   const manager = useManager();
 *   return <div>Status: {manager ? manager.getStatus() : 'unknown'}</div>;
 * };
 *
 * const App = () => {
 *   const manager = createManager().start();
 *   return (
 *     <Provider manager={manager}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<div>Status: 1</div>'
 * ```
 * @category Manager hooks
 * @since v1.1.0
 */
/// useManager

/**
 * The useStatus hook returns the current status of the Manager provided by a
 * Provider component.
 * @returns The current status of the Manager, or `undefined` if called from
 * outside an active Provider.
 * @example
 * This example shows how to use the useStatus hook within a component that's
 * nested inside a Provider. Because the hook is reactive, a change to the
 * status will rerender the component
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useStatus} from 'tinytick/ui-react';
 *
 * const Pane = () => <span>Status: {useStatus()}</span>;
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const manager = createManager();
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Status: 0</span>'
 *
 * manager.start(); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Status: 1</span>'
 * ```
 * @category Manager hooks
 * @since v1.2.0
 */
/// useStatus

/**
 * The useScheduledTaskRunIds hook returns the current scheduled task run Ids of
 * the Manager provided by a Provider component.
 * @returns The current scheduled task run Ids of the Manager, or `undefined` if
 * called from outside an active Provider.
 * @example
 * This example shows how to use the useScheduledTaskRunIds hook within a
 * component that's nested inside a Provider. Because the hook is reactive, a
 * change to the scheduled task run Ids will rerender the component
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useScheduledTaskRunIds} from 'tinytick/ui-react';
 *
 * const Pane = () => (
 *   <span>Scheduled task run Ids: {useScheduledTaskRunIds().length}</span>
 * );
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const manager = createManager();
 * manager.setTask('ping', async () => await fetch('https://example.org'));
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Scheduled task run Ids: 0</span>'
 *
 * manager.scheduleTaskRun('ping', 200); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Scheduled task run Ids: 1</span>'
 *
 * manager.scheduleTaskRun('ping', 400); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Scheduled task run Ids: 2</span>'
 * ```
 * @category Task run hooks
 * @since v1.2.0
 */
/// useScheduledTaskRunIds

/**
 * The useRunningTaskRunIds hook returns the current running task run Ids of the
 * Manager provided by a Provider component.
 * @returns The current running task run Ids of the Manager, or `undefined` if
 * called from outside an active Provider.
 * @example
 * This example shows how to use the useRunningTaskRunIds hook within a
 * component that's nested inside a Provider. Because the hook is reactive, a
 * change to the running task run Ids will rerender the component
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useRunningTaskRunIds} from 'tinytick/ui-react';
 *
 * const Pane = () => (
 *   <span>Running task run Ids: {useRunningTaskRunIds().length}</span>
 * );
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const manager = createManager().start();
 * manager.setTask(
 *   'takes200ms',
 *   async () => await new Promise((resolve) => setTimeout(resolve, 200)),
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Running task run Ids: 0</span>'
 *
 * manager.scheduleTaskRun('takes200ms'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Running task run Ids: 0</span>'
 *
 * // ... wait 100ms for task run to start // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Running task run Ids: 1</span>'
 *
 * // ... wait 200ms for task run to stop // !act
 * console.log(app.innerHTML);
 * // -> '<span>Running task run Ids: 0</span>'
 * ```
 * @category Task run hooks
 * @since v1.2.0
 */
/// useRunningTaskRunIds

/**
 * The useTaskRunRunning hook returns a boolean indicating whether a specific
 * task run is currently running in the Manager provided by a Provider
 * component.
 *
 * If the task run Id does not exist or if called from outside an active
 * Provider, this method will return `undefined`.
 * @param taskRunId The Id of the task run to get information for.
 * @returns Whether the task run is running, or `undefined` if the task run Id
 * does not exist or if called from outside an active Provider.
 * @example
 * This example shows how to use the useTaskRunRunning hook within a
 * component that's nested inside a Provider. Because the hook is reactive, a
 * change to the task run's running status will rerender the component
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useTaskRunRunning} from 'tinytick/ui-react';
 *
 * const Pane = ({taskRunId}) => (
 *   <span>
 *     Task run running: {useTaskRunRunning(taskRunId) ? 'true' : 'false'}
 *   </span>
 * );
 *
 * const App = ({manager, taskRunId}) => (
 *   <Provider manager={manager}>
 *     <Pane taskRunId={taskRunId} />
 *   </Provider>
 * );
 *
 * const manager = createManager();
 * manager.setTask('ping', async () => await fetch('https://example.org'));
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 *
 * const taskRunId = manager.scheduleTaskRun('ping');
 * root.render(<App manager={manager} taskRunId={taskRunId} />); // !act
 *
 * console.log(app.innerHTML);
 * // -> '<span>Task run running: false</span>'
 *
 * manager.start(); // !act
 * // ... wait 100ms for task to start running // !act
 * console.log(app.innerHTML);
 * // -> '<span>Task run running: true</span>'
 *
 * // ... wait 100ms for task to complete // !act
 * console.log(app.innerHTML);
 * // -> '<span>Task run running: false</span>'
 * ```
 * @category Task run hooks
 * @since v1.2.0
 */
/// useTaskRunRunning

/**
 * The useStartCallback hook returns a callback that can be used to start the
 * Manager provided by a Provider component.
 * @returns A callback that starts the Manager.
 * @example
 * This example shows how to use the useStartCallback hook within a component
 * that's nested inside a Provider. The callback is used to start the Manager
 * when the status is clicked.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useStartCallback, useStatus} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   const handleClick = useStartCallback();
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       Manager status: {useStatus()}
 *     </span>
 *   );
 * };
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const app = document.createElement('div');
 * const manager = createManager();
 * createRoot(app).render(<App manager={manager} />); // !act
 * const span = app.querySelector('span');
 *
 * console.log(span.innerHTML);
 * // -> 'Manager status: 0'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 *
 * console.log(span.innerHTML);
 * // -> 'Manager status: 1'
 * ```
 * @category Manager hooks
 * @since v1.2.0
 */
/// useStartCallback

/**
 * The useStopCallback hook returns a callback that can be used to stop the
 * Manager provided by a Provider component.
 * @param force Whether to stop the Manager immediately instead of waiting for
 * all scheduled task runs to complete.
 * @returns A callback that stops the Manager.
 * @example
 * This example shows how to use the useStopCallback hook within a component
 * that's nested inside a Provider. The callback is used to force-stop the
 * Manager when the status is clicked.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useStopCallback, useStatus} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   const handleClick = useStopCallback(true);
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       Manager status: {useStatus()}
 *     </span>
 *   );
 * };
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const app = document.createElement('div');
 * const manager = createManager().start();
 * createRoot(app).render(<App manager={manager} />); // !act
 * const span = app.querySelector('span');
 *
 * console.log(span.innerHTML);
 * // -> 'Manager status: 1'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 *
 * console.log(span.innerHTML);
 * // -> 'Manager status: 0'
 * ```
 * @category Manager hooks
 * @since v1.2.0
 */
/// useStopCallback

/**
 * The useSetTask hook returns registers task in the Manager provided by a
 * Provider component, optionally associating it with a category and/or a custom
 * configuration.
 *
 * Note that this hook will unregister the task when the component is unmounted,
 * so it is most suitable for setting up a task that is only needed within one
 * part of an application.
 *
 * The task is an asynchronous function that is passed an optional string when
 * it is scheduled. Like the setTask method, the hook simply registers it with
 * an Id so a run can be scheduled in the future.
 *
 * The configuration has properties which let you indicate the duration of task
 * runs and their retry behaviors, for example.
 *
 * If the hook is called on a task Id that already exists, its function,
 * category, and configuration will be updated. When the component unmounts, the
 * task will be removed, so it is best to use a unique Id for the task that will
 * not conflict with tasks registered elsewhere in the application.
 * @param taskId The Id of the task to register.
 * @param task The task function to register.
 * @param taskDeps An optional array of dependencies for the task function,
 * which, if any change, result in the task being registered. Defaults to an
 * empty array.
 * @param categoryId The optional Id of a category to associate the task with.
 * @param config An optional TaskRunConfig to set for all runs of this Task.
 * @param configDeps An optional array of dependencies for the config object,
 * which, if any change, result in the task being registered. Defaults to an
 * empty array.
 * @example
 * This example shows how to use the useSetTask hook within a component that's
 * nested inside a Provider. The hook is used to set a task in the component
 * that is removed when the component is unmounted.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useSetTask} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   useSetTask('ping', async () => await fetch('https://example.org'));
 * };
 *
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const app = document.createElement('div');
 * const manager = createManager();
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 *
 * console.log(manager.getTaskIds());
 * // -> ['ping']
 *
 * root.unmount(); // !act
 * console.log(manager.getTaskIds());
 * // -> []
 * ```
 * @category Task hooks
 * @since v1.2.0
 */
/// useSetTask

/**
 * The useScheduleTaskRun hook can be used to schedule a specific task in the
 * Manager provided by a Provider component.
 *
 * When called, the task will be executed with the optional string argument
 * provided, and can be configured to start at a specific time (TimestampMs), or
 * after a specific delay (DurationMs).
 *
 * You can also provide a custom TaskRunConfig which lets you indicate the
 * duration of the task run and its retry behaviors, for example.
 *
 * The hook will return a unique Id for the scheduled task run. However, if the
 * Manager is in the stopping state, new task runs can not be scheduled, and in
 * that case, the method will return `undefined`.
 *
 * The task run will be scheduled once when the component is first rendered, and
 * will be only scheduled again if any of the arguments or configDeps
 * dependencies change.
 * @param taskId The Id of the task to run.
 * @param arg An optional string argument to pass to the Task.
 * @param startAfter A timestamp at, or duration after which, the task should
 * run.
 * @param config An optional TaskRunConfig to set for this run.
 * @param configDeps An optional array of dependencies for the config object,
 * which, if any change, result in the task being scheduled again. Defaults to
 * an empty array.
 * @returns The new unique Id of the scheduled task run, or `undefined` if
 * unsuccessful.
 * @example
 * This example shows how to use the useScheduleTaskRun hook within a
 * component that's nested inside a Provider. The hook is used to create a
 * callback that will schedule a task in response to a click event.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useScheduleTaskRun} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   useScheduleTaskRun('log');
 *   return null;
 * };
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const manager = createManager().start();
 * manager.setTask('log', async () => console.log('Task ran'));
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 *
 * // ... wait 100ms for task to start running // !act
 * // -> 'Task ran'
 * ```
 * @category Task run hooks
 * @since v1.2.1
 */
/// useScheduleTaskRun

/**
 * The useScheduleTaskRunCallback hook returns a function that can be used to
 * schedule a specific task in the Manager provided by a Provider component.
 *
 * The hook returns a callback. When called, the task will be executed with the
 * optional string argument provided, and can be configured to start at a
 * specific time (TimestampMs), or after a specific delay (DurationMs).
 *
 * You can also provide a custom TaskRunConfig which lets you indicate the
 * duration of the task run and its retry behaviors, for example.
 *
 * The callback will return a unique Id for the scheduled task run. However, if
 * the Manager is in the stopping state, new task runs can not be scheduled, and
 * in that case, the method will return `undefined`.
 * @param taskId The Id of the task to run.
 * @param arg An optional string argument to pass to the Task.
 * @param startAfter A timestamp at, or duration after which, the task should
 * run.
 * @param config An optional TaskRunConfig to set for this run.
 * @param configDeps An optional array of dependencies for the config object,
 * which, if any change, result in the callback being regenerated. Defaults to
 * an empty array.
 * @returns A callback that will return the new unique Id of the scheduled task
 * run, or `undefined` if unsuccessful.
 * @example
 * This example shows how to use the useScheduleTaskRunCallback hook within a
 * component that's nested inside a Provider. The hook is used to create a
 * callback that will schedule a task in response to a click event.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useScheduleTaskRunCallback} from 'tinytick/ui-react';
 *
 * const Pane = () => {
 *   const handleClick = useScheduleTaskRunCallback('log');
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       Log
 *     </span>
 *   );
 * };
 * const App = ({manager}) => (
 *   <Provider manager={manager}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const manager = createManager().start();
 * manager.setTask('log', async () => console.log('Task ran'));
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App manager={manager} />); // !act
 * const span = app.querySelector('span');
 *
 * console.log(span.innerHTML);
 * // -> 'Log'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 *
 * // ... wait 100ms for task to start running // !act
 * // -> 'Task ran'
 * ```
 * @category Task run hooks
 * @since v1.2.0
 */
/// useScheduleTaskRunCallback

/**
 * ProviderProps props are used with the Manager component, so that a TinyTick
 * Manager can be passed into the context of an application and used throughout.
 * @category Props
 * @since v1.1.0
 */
/// ProviderProps

{
  /**
   * A default single Manager object that will be available within the Provider
   * context.
   * @category Prop
   * @since v1.1.0
   */
  /// ProviderProps.manager
}

/**
 * The Provider component is used to wrap part of an application in a context
 * that provides a Manager to be used by hooks and components within.
 * @param props The props for this component.
 * @returns A rendering of the child components.
 * @example
 * This example creates a Provider context into which a Manager is made
 * available to the whole app.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createManager} from 'tinytick';
 * import {Provider, useCreateManager, useManager} from 'tinytick/ui-react';
 *
 * const App = () => {
 *   const manager = useCreateManager(() => createManager().start());
 *   return (
 *     <Provider manager={manager}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>Status: {useManager().getStatus()}</span>;
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Status: 1</span>'
 * ```
 * @category Context components
 * @since v1.1.0
 */
/// Provider
