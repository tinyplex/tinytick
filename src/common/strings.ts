import type {Id} from '../@types/index.js';

export const EMPTY_STRING = '';

export const TINYTICK = 'tinytick';

export const getTypeOf = (thing: unknown): string => typeof thing;

export const id = (key: unknown): Id => EMPTY_STRING + key;

export const isString = (thing: unknown): thing is string =>
  getTypeOf(thing) == 'string';

export const strSplit = (
  str: string,
  separator: string | RegExp = EMPTY_STRING,
  limit?: number,
): string[] => str.split(separator, limit);
