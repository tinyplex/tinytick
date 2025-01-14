type Coll<Value> = Map<unknown, Value> | Set<Value>;

export const collHas = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean => coll?.has(keyOrValue) ?? false;

export const collForEach = <Value>(
  coll: Coll<Value> | undefined,
  cb: (value: Value, key: any) => void,
): void => coll?.forEach(cb);

export const collDel = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean | undefined => coll?.delete(keyOrValue);
