/**
 * The ui-react module of the TinyTick project provides both hooks and
 * components to make it easy to use TinyTick in a React application.
 *
 * The hooks in this module provide access to the data and structures exposed by
 * other modules in the project.
 * @packageDocumentation
 * @module ui-react
 * @since v1.1.0
 */
/// ui-react

/**
 * ProviderProps props are used with the Provider component, so that a TinyTick
 * Manager can be passed into the context of an application and used throughout.
 * @category Props
 * @since v1.1.0
 */
/// ProviderProps
{
  /**
   * Whether the Manager should be started on first render, defaulting to
   * `true`.
   * @category Prop
   * @since v1.1.0
   */
  /// ProviderProps.started
}
/**
 * ComponentReturnType is a simple alias for what a React component can return:
 * either a ReactElement, or `null` for an empty component.
 * @category Component
 * @since v1.1.0
 */
/// ComponentReturnType
/**
 * The Provider component is used to wrap part of an application in a context
 * that provides a Manager to be used by hooks and components within.
 * @param props The props for this component.
 * @returns A rendering of the child components.
 * @category Context components
 * @since v1.1.0
 */
/// Provider
