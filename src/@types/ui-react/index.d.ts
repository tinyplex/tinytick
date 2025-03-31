/// ui-react
import {ReactElement} from 'react';

/// ProviderProps
export type ProviderProps = {
  /// ProviderProps.started
  readonly started?: boolean;
};

/// ComponentReturnType
export type ComponentReturnType = ReactElement<any, any> | null;

/// Provider
export function Provider(
  props: ProviderProps & {children: React.ReactNode},
): ComponentReturnType;
