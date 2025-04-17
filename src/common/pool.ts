import type {Id, Ids} from '../@types/index.d.ts';
import {arrayPush, arrayShift} from './array.ts';
import {size, test} from './other.ts';
import {EMPTY_STRING} from './strings.ts';

const INTEGER = /^\d+$/;

export type PoolFunctions = [() => Id, (id: Id) => void];

export const getPoolFunctions = (): PoolFunctions => {
  const pool: Ids = [];
  let nextId = 0;
  return [
    (): Id => arrayShift(pool) ?? EMPTY_STRING + nextId++,
    (id: Id): void => {
      if (test(INTEGER, id) && size(pool) < 1e3) {
        arrayPush(pool, id);
      }
    },
  ];
};
