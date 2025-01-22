import type {Id} from '../@types/index.js';
import {collDel} from './coll.ts';
import {isUndefined} from './other.ts';

export type IdMap<Value> = Map<Id, Value>;

export const mapNew = /* @__PURE__ */ <Key, Value>(
  entries?: [Key, Value][],
): Map<Key, Value> => new Map(entries);

export const mapSet = <Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  value?: Value,
): Map<Key, Value> =>
  isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);

export const mapGet = <Key, Value>(
  map: Map<Key, Value> | undefined,
  key: Key,
): Value | undefined => map?.get(key);

export const mapKeys = <Key>(map: Map<Key, unknown>): Key[] => [...map.keys()];
