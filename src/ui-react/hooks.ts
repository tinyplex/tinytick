import {
  DependencyList,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type {Ids, Manager} from '../@types/index.d.ts';
import type {
  useCreateManager as useCreateManagerDecl,
  useManager as useManagerDecl,
  useStatus as useStatusDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayIsEqual} from '../common/array.ts';
import {isUndefined} from '../common/other.ts';
import {Context} from './context.ts';

const EMPTY_ARRAY: Readonly<[]> = [];

enum ReturnType {
  Array,
  Number,
}
const DEFAULTS = [[], 0];
const IS_EQUALS: ((thing1: any, thing2: any) => boolean)[] = [
  arrayIsEqual,
  (thing1: any, thing2: any) => thing1 === thing2,
];

const useListenable = (
  listenable: string,
  returnType: ReturnType,
  args: Readonly<Ids> = EMPTY_ARRAY,
): any => {
  const manager = useManager();
  const lastResult = useRef(DEFAULTS[returnType]);
  const getResult = useCallback(
    () => {
      const nextResult = isUndefined(manager)
        ? undefined
        : ((manager as any)['get' + listenable]?.(...args) ??
          DEFAULTS[returnType]);
      return !IS_EQUALS[returnType](nextResult, lastResult.current)
        ? (lastResult.current = nextResult)
        : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [manager, returnType, listenable, ...args],
  );
  const subscribe = useCallback(
    (listener: () => void) =>
      addAndDelListener(manager, listenable, ...args, listener),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [manager, returnType, listenable, ...args],
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.['add' + listenable + 'Listener']?.(...args);
  return () => thing?.delListener?.(listenerId);
};

export const useCreateManager: typeof useCreateManagerDecl = (
  create: () => Manager,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Manager => useMemo(create, createDeps);

export const useManager: typeof useManagerDecl = () => useContext(Context)[0];

export const useStatus: typeof useStatusDecl = () =>
  useListenable('Status', ReturnType.Number);
