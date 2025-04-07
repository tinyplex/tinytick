import {useEffect, useState, type ReactNode} from 'react';
import type {Manager} from '../@types/index.d.ts';
import type {
  ManagerProvider as ManagerProviderDecl,
  ManagerProviderProps,
} from '../@types/ui-react/index.d.ts';
import {createManager} from '../index.ts';
import {Context} from './context.ts';

export const ManagerProvider: typeof ManagerProviderDecl = ({
  started = true,
  forceStop = true,
  children,
}: ManagerProviderProps & {readonly children: ReactNode}): any => {
  const [manager, setManager] = useState<Manager | undefined>(undefined);

  useEffect(() => {
    const manager = createManager()[started ? 'start' : 'stop']();
    setManager(manager);
    return () => {
      manager?.stop(forceStop);
      setManager(undefined);
    };
  }, [started, forceStop]);

  return <Context.Provider value={manager}>{children}</Context.Provider>;
};
