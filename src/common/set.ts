import type {Id} from '../@types/index.d.ts';
import {IdMap} from './map.ts';

export type IdSet = Set<Id>;
export type IdSet2 = IdMap<IdSet>;

export const setNew = <Value>(): Set<Value> => new Set();

export const setAdd = <Value>(
  set: Set<Value> | undefined,
  value: Value,
): Set<Value> | undefined => set?.add(value);
