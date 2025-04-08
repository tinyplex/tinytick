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
 * @category Lifecycle hooks
 * @since v1.1.0
 */
/// useManager
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
 * @category Context components
 * @since v1.1.0
 */
/// Provider
