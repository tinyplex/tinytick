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
 * const Pane = () => (<span>Status: {useStatus()}</span>);
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
 * The useScheduledTaskRunIds hook returns the current scheduled task run Ids
 * of the Manager provided by a Provider component.
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
 * @category Manager hooks
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
 * manager.setTask('takes200ms',
 *   async () => await new Promise(resolve => setTimeout(resolve, 200)),
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
 * @category Manager hooks
 * @since v1.2.0
 */
/// useRunningTaskRunIds
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
 * const Pane = () => (<span>Status: {useManager().getStatus()}</span>);
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
