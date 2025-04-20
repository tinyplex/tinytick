import type {DurationMs, TimestampMs} from '../@types/index.d.ts';
import {getTypeOf, strSplit} from './strings.ts';

export const GLOBAL = globalThis;
export const math = Math;
export const mathFloor = math.floor;

const MASK6 = 63;
const ENCODE = /* @__PURE__ */ strSplit(
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
);

const MILLISECONDS_IN_YEAR = 31536000000;

export const encode = (num: number): string => ENCODE[num & MASK6];

export const isPositiveNumber = (thing: unknown): thing is number =>
  getTypeOf(thing) == 'number' && (thing as number) >= 0;

export const isUndefined = (thing: unknown): thing is undefined | null =>
  thing == undefined;

export const ifNotUndefined = <Value, Return>(
  value: Value | null | undefined,
  then: (value: Value) => Return,
  otherwise?: () => Return,
): Return | undefined => (isUndefined(value) ? otherwise?.() : then(value));

export const isArray = (thing: unknown): thing is any[] => Array.isArray(thing);

export const size = (arrayOrString: string | unknown[]): number =>
  arrayOrString.length;

export const test = (regex: RegExp, subject: string): boolean =>
  regex.test(subject);

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
