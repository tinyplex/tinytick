import type {Id} from '../@types/index.js';
import {collDel, collForEach, collHas, collIsEmpty} from './coll.ts';
import {IdObj} from './obj.ts';
import {ifNotUndefined, isUndefined, size} from './other.ts';

export type IdMap<Value> = Map<Id, Value>;

export const mapNew = /* @__PURE__ */ <Key, Value>(
  entries?: [Key, Value][],
): Map<Key, Value> => new Map(entries);

export const mapSet = <Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  value?: Value,
): Map<Key, Value> =>
  isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);

export const mapEnsure = <Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  getDefaultValue: () => Value,
  hadExistingValue?: (value: Value) => void,
): Value => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map, key) as Value);
  }
  return mapGet(map, key) as Value;
};

export const mapGet = <Key, Value>(
  map: Map<Key, Value> | undefined,
  key: Key,
): Value | undefined => map?.get(key);

export const mapKeys = <Key>(map: Map<Key, unknown>): Key[] => [...map.keys()];

export const mapToObj = <MapValue, ObjValue = MapValue>(
  map: IdMap<MapValue> | undefined,
  valueMapper?: (mapValue: MapValue, id: Id) => ObjValue,
): IdObj<ObjValue> => {
  const obj: IdObj<ObjValue> = {};
  collForEach(
    map,
    (mapValue, id) =>
      (obj[id] = valueMapper
        ? valueMapper(mapValue, id)
        : (mapValue as any as ObjValue)),
  );
  return obj;
};

export type Node<Path, Leaf> = Map<Path, Node<Path, Leaf> | Leaf>;
export const visitTree = <Path, Leaf>(
  node: Node<Path, Leaf>,
  path: Path[],
  ensureLeaf?: () => Leaf,
  pruneLeaf?: (leaf: Leaf) => 1 | 0 | void,
  p = 0,
): Leaf | undefined =>
  ifNotUndefined(
    (ensureLeaf ? mapEnsure : mapGet)(
      node,
      path[p],
      p > size(path) - 2 ? (ensureLeaf as () => Leaf) : mapNew,
    ),
    (nodeOrLeaf) => {
      if (p > size(path) - 2) {
        if (pruneLeaf?.(nodeOrLeaf as Leaf)) {
          mapSet(node, path[p]);
        }
        return nodeOrLeaf as Leaf;
      }
      const leaf = visitTree(
        nodeOrLeaf as Node<Path, Leaf>,
        path,
        ensureLeaf,
        pruneLeaf,
        p + 1,
      ) as Leaf;
      if (collIsEmpty(nodeOrLeaf as Node<Path, Leaf>)) {
        mapSet(node, path[p]);
      }
      return leaf;
    },
  );
