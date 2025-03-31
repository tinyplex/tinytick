import type {DurationMs, Id, TimestampMs} from '../@types/index.d.ts';
import {arrayMap, arrayReduce} from './array.ts';
import {getTypeOf, strSplit} from './strings.ts';

export const GLOBAL = globalThis;
const math = Math;
const mathFloor = math.floor;

const MASK6 = 63;
const ENCODE = /* @__PURE__ */ strSplit(
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
);

const MILLISECONDS_IN_YEAR = 31536000000;

const encode = (num: number): string => ENCODE[num & MASK6];

// Fallback is not cryptographically secure but tolerable for ReactNative UUIDs.
const getRandomValues = GLOBAL.crypto
  ? (array: Uint8Array): Uint8Array => GLOBAL.crypto.getRandomValues(array)
  : /*! istanbul ignore next */
    (array: Uint8Array): Uint8Array =>
      arrayMap(array as any, () => mathFloor(math.random() * 256)) as any;

export const isPositiveNumber = (thing: unknown): thing is number =>
  getTypeOf(thing) == 'number' && (thing as number) >= 0;

export const isUndefined = (thing: unknown): thing is undefined | null =>
  thing == undefined;

export const ifNotUndefined = <Value, Return>(
  value: Value | null | undefined,
  then: (value: Value) => Return,
  otherwise?: () => Return,
): Return | undefined => (isUndefined(value) ? otherwise?.() : then(value));

export const getUniqueId = (length = 16): Id =>
  arrayReduce<number, Id>(
    getRandomValues(new Uint8Array(length)) as any,
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );

export const size = (arrayOrString: string | unknown[]): number =>
  arrayOrString.length;

export const isEmpty = (arrayOrString: string | unknown[]): boolean =>
  size(arrayOrString) == 0;

export const getNow: () => TimestampMs = Date.now;

export const normalizeTimestamp = (
  number: TimestampMs | DurationMs,
): TimestampMs => {
  if (!isPositiveNumber(number)) {
    number = 0;
  }
  return number > MILLISECONDS_IN_YEAR ? number : getNow() + number;
};
