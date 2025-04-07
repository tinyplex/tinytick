import {useMemo, type ReactNode} from 'react';
import type {
  Provider as ProviderDecl,
  ProviderProps,
} from '../@types/ui-react/index.d.ts';
import {Context} from './context.ts';

export const Provider: typeof ProviderDecl = ({
  manager,
  children,
}: ProviderProps & {readonly children: ReactNode}): any => {
  return (
    <Context.Provider value={useMemo(() => [manager], [manager])}>
      {children}
    </Context.Provider>
  );
};
