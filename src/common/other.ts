import {arrayMap, arrayReduce} from './array.ts';
import {getTypeOf, strSplit} from './strings.ts';
import type {Id} from '../@types/index.d.ts';

const GLOBAL = globalThis;
const math = Math;
const mathFloor = math.floor;

const MASK6 = 63;
const ENCODE = /* @__PURE__ */ strSplit(
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
);

export const isPositiveNumber = (thing: unknown): thing is number =>
  getTypeOf(thing) == 'number' && (thing as number) > 0;

export const isUndefined = (thing: unknown): thing is undefined | null =>
  thing == undefined;

export const ifNotUndefined = <Value, Return>(
  value: Value | null | undefined,
  then: (value: Value) => Return,
  otherwise?: () => Return,
): Return | undefined => (isUndefined(value) ? otherwise?.() : then(value));

// Fallback is not cryptographically secure but tolerable for ReactNative UUIDs.
const getRandomValues = GLOBAL.crypto
  ? (array: Uint8Array): Uint8Array => GLOBAL.crypto.getRandomValues(array)
  : /*! istanbul ignore next */
    (array: Uint8Array): Uint8Array =>
      arrayMap(array as any, () => mathFloor(math.random() * 256)) as any;

export const getUniqueId = (length = 16): Id =>
  arrayReduce<number, Id>(
    getRandomValues(new Uint8Array(length)) as any,
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );

const encode = (num: number): string => ENCODE[num & MASK6];
