import type {
  Id,
  IdOrNull,
  Ids,
  Manager,
  StatusListener,
  TaskRunFailedListener,
  TaskRunIdsListener,
  TaskRunRunningListener,
  TickListener,
} from '../@types/index.d.ts';
import {arrayForEach, arrayPush} from './array.ts';
import {collDel, collForEach, collIsEmpty} from './coll.ts';
import {IdMap, Node, mapGet, mapNew, mapSet, visitTree} from './map.ts';
import {ifNotUndefined, size} from './other.ts';
import {getPoolFunctions} from './pool.ts';
import {IdSet, setAdd, setNew} from './set.ts';
import {EMPTY_STRING} from './strings.ts';

export type IdSetNode = Node<IdOrNull, IdSet> | IdSet;
export type ListenerArgument = IdOrNull | boolean | number | undefined;
export type AddListener = (
  listener: Listener,
  idSetNode: IdSetNode,
  path?: ListenerArgument[],
) => Id;
export type CallListeners = (
  idSetNode: IdSetNode,
  ids?: IdOrNumber[],
  ...extra: any[]
) => void;

type DelListener = (id: Id) => Ids;
type Listener =
  | StatusListener
  | TickListener
  | TaskRunIdsListener
  | TaskRunRunningListener
  | TaskRunFailedListener;

type IdOrNumber = Id | number;

const getWildcardedLeaves = (
  deepIdSet: IdSetNode,
  path: IdOrNumber[] = [EMPTY_STRING],
): IdSet[] => {
  const leaves: IdSet[] = [];
  const deep = (node: IdSetNode, p: number): number | void =>
    p == size(path)
      ? arrayPush(leaves, node)
      : arrayForEach([path[p], null], (id) =>
          deep(mapGet(node as Node<IdOrNull, IdSet>, id) as IdSetNode, p + 1),
        );
  deep(deepIdSet, 0);
  return leaves;
};

export const getListenerFunctions = (
  getThing: () => Manager,
): [
  addListener: AddListener,
  callListeners: CallListeners,
  delListener: DelListener,
] => {
  let thing: Manager;

  const [getId, releaseId] = getPoolFunctions();
  const allListeners: IdMap<[Listener, IdSetNode, ListenerArgument[]]> =
    mapNew();

  const addListener = (
    listener: Listener,
    idSetNode: IdSetNode,
    path?: ListenerArgument[],
  ): Id => {
    thing ??= getThing();
    const id = getId();
    mapSet(allListeners, id, [listener, idSetNode, path]);
    setAdd(
      visitTree(
        idSetNode as Node<IdOrNull, IdSet>,
        path ?? [EMPTY_STRING],
        setNew,
      ),
      id,
    ) as IdSet;
    return id;
  };

  const callListeners = (
    idSetNode: IdSetNode,
    ids?: IdOrNumber[],
    ...extraArgs: any[]
  ): void =>
    arrayForEach(getWildcardedLeaves(idSetNode, ids), (set) =>
      collForEach(set, (id: Id) =>
        (mapGet(allListeners, id) as any)[0](
          thing,
          ...(ids ?? []),
          ...extraArgs,
        ),
      ),
    );

  const delListener = (id: Id): Ids =>
    ifNotUndefined(mapGet(allListeners, id), ([, idSetNode, idOrNulls]) => {
      visitTree(
        idSetNode as Node<IdOrNull, IdSet>,
        idOrNulls ?? [EMPTY_STRING],
        undefined,
        (idSet) => {
          collDel(idSet, id);
          return collIsEmpty(idSet) ? 1 : 0;
        },
      );
      mapSet(allListeners, id);
      releaseId(id);
      return idOrNulls;
    }) as Ids;

  return [addListener, callListeners, delListener];
};
