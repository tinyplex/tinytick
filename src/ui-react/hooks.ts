import {DependencyList, useContext, useMemo} from 'react';
import type {Manager} from '../@types/index.d.ts';
import type {
  useCreateManager as useCreateManagerDecl,
  useManager as useManagerDecl,
} from '../@types/ui-react/index.d.ts';
import {Context} from './context.ts';

const EMPTY_ARRAY: Readonly<[]> = [];

export const useCreateManager: typeof useCreateManagerDecl = (
  create: () => Manager,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Manager => useMemo(create, createDeps);

export const useManager: typeof useManagerDecl = () => useContext(Context)[0];
