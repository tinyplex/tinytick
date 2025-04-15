import {IdMap, mapNew} from './map.ts';
import {setNew} from './set.ts';

export type Pair<Value> = [Value, Value];

export const pairNewMap = <Value>(): Pair<IdMap<Value>> => [mapNew(), mapNew()];
export const pairNewSet = <Value>(): Pair<Set<Value>> => [setNew(), setNew()];
