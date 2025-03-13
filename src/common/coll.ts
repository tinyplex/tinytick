type Coll<Value> = Map<unknown, Value> | Set<Value>;

export const collDel = (
  coll: Coll<unknown>,
  keyOrValue: unknown,
): boolean | undefined => coll.delete(keyOrValue);
