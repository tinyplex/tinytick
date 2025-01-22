type Coll<Value> = Map<unknown, Value> | Set<Value>;

export const collHas = (coll: Coll<unknown>, keyOrValue: unknown): boolean =>
  coll.has(keyOrValue);

export const collDel = (
  coll: Coll<unknown>,
  keyOrValue: unknown,
): boolean | undefined => coll.delete(keyOrValue);
