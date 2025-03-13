export const arrayMap = <Value, Return>(
  array: Value[],
  cb: (value: Value, index: number, array: Value[]) => Return,
): Return[] => array.map(cb);

export const arrayReduce = <Value, Result>(
  array: Value[],
  cb: (previous: Result, current: Value) => Result,
  initial: Result,
): Result => array.reduce(cb, initial);

export const arrayForEach = <Value>(
  array: {forEach: (cb: (value: Value, index: number) => void) => void},
  cb: (value: Value, index: number) => void,
): void => array.forEach(cb);

export const arraySplice = <Value>(
  array: Value[],
  start: number,
  deleteCount: number,
  ...values: Value[]
) => array.splice(start, deleteCount, ...values);

export const arrayShift = <Value>(array: Value[]): Value | undefined =>
  array.shift();

export const arraySplit = (string: string, separator: string): string[] =>
  string.split(separator);

export const arrayFilter = <Value>(
  array: Value[],
  cb: (value: Value) => boolean,
): Value[] => array.filter(cb);
