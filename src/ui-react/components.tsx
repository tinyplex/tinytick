import {useMemo, type ReactNode} from 'react';
import type {
  ManagerProvider as ManagerProviderDecl,
  ManagerProviderProps,
} from '../@types/ui-react/index.d.ts';
import {createManager} from '../index.ts';
import {Context} from './context.ts';

export const ManagerProvider: typeof ManagerProviderDecl = ({
  started = true,
  children,
}: ManagerProviderProps & {readonly children: ReactNode}): any => (
  <Context.Provider
    value={useMemo(
      () => createManager()[started ? 'start' : 'stop'](),
      [started],
    )}
  >
    {children}
  </Context.Provider>
);
