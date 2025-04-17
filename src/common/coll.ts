type Coll<Value> = Map<unknown, Value> | Set<Value>;

const collSize = (coll: Coll<unknown>): number => coll.size;

export const collHas = (coll: Coll<unknown>, keyOrValue: unknown): boolean =>
  coll.has(keyOrValue);

export const collDel = (
  coll: Coll<unknown>,
  keyOrValue: unknown,
): boolean | undefined => coll.delete(keyOrValue);

export const collIsEmpty = (coll: Coll<unknown>): boolean =>
  collSize(coll) == 0;

export const collForEach = <Value>(
  coll: Coll<Value> | undefined,
  cb: (value: Value, key: any) => void,
): void => coll?.forEach(cb);

export const collClear = (coll: Coll<unknown>): void => coll.clear();
