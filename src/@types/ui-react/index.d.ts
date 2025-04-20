/// ui-react
import {ReactElement} from 'react';
import type {Manager, ManagerStatus} from '../index.d.ts';

/// useCreateManager
export function useCreateManager(
  create: () => Manager,
  createDeps?: React.DependencyList,
): Manager;

/// useManager
export function useManager(): Manager | undefined;

/// useStatus
export function useStatus(): ManagerStatus | undefined;

/// ProviderProps
export type ProviderProps = {
  /// ProviderProps.manager
  readonly manager?: Manager;
};

/// Provider
export function Provider(
  props: ProviderProps & {children: React.ReactNode},
): ReactElement<any, any>;
