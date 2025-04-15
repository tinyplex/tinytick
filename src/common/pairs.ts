import {IdMap, mapNew} from './map.ts';

export type Pair<Value> = [Value, Value];

export const pairNewMap = <Value>(): Pair<IdMap<Value>> => [mapNew(), mapNew()];
