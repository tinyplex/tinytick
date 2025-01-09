type Coll<Value> = Map<unknown, Value> | Set<Value>;

export const collDel = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean | undefined => coll?.delete(keyOrValue);

export const collHas = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean => coll?.has(keyOrValue) ?? false;
