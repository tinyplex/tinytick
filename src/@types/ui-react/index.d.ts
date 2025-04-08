/// ui-react
import {ReactElement} from 'react';
import type {Manager} from '../index.d.ts';

/// useCreateManager
export function useCreateManager(
  create: () => Manager,
  createDeps?: React.DependencyList,
): Manager;

/// useManager
export function useManager(): Manager | undefined;

/// ProviderProps
export type ProviderProps = {
  /// ProviderProps.manager
  readonly manager?: Manager;
};

/// Provider
export function Provider(
  props: ProviderProps & {children: React.ReactNode},
): ReactElement<any, any>;
