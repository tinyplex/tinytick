import {useMemo, type ReactNode} from 'react';
import type {
  Provider as ProviderDecl,
  ProviderProps,
} from '../@types/ui-react/index.d.ts';
import {createManager} from '../index.ts';
import {Context} from './context.ts';

export const Provider: typeof ProviderDecl = ({
  started = true,
  children,
}: ProviderProps & {readonly children: ReactNode}): any => (
  <Context.Provider
    value={useMemo(
      () => createManager()[started ? 'start' : 'stop'](),
      [started],
    )}
  >
    {children}
  </Context.Provider>
);
