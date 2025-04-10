import type {Id} from '../@types/index.d.ts';
import {arrayForEach} from './array.ts';
import {ifNotUndefined, isUndefined} from './other.ts';

const object = Object;

const getPrototypeOf = (obj: any) => object.getPrototypeOf(obj);

const objFrozen = object.isFrozen;

const objEntries = object.entries;

const objForEach = <Value>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => void,
): void => arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));

const isObject = (obj: unknown): boolean =>
  !isUndefined(obj) &&
  (ifNotUndefined(
    getPrototypeOf(obj),
    (objPrototype) =>
      objPrototype == object.prototype ||
      isUndefined(getPrototypeOf(objPrototype)),
    /*! istanbul ignore next */
    () => true,
  ) as boolean);

const objDel = <Value>(obj: IdObj<Value>, id: Id): IdObj<Value> => {
  delete obj[id];
  return obj;
};

export type IdObj<Value> = {[id: string]: Value};

export const objFreeze = object.freeze;

export const objMerge = (...objs: IdObj<unknown>[]) =>
  object.assign({}, ...objs);

export const objFilterUndefined = <Obj extends IdObj<any>>(obj: Obj): Obj => {
  objForEach(obj, (value, id) => (value === undefined ? delete obj[id] : 0));
  return obj;
};

export const objValidate = (
  obj: IdObj<any> | undefined,
  validateChild: (child: any, id: Id) => boolean,
): 0 | 1 => {
  if (isUndefined(obj) || !isObject(obj) || objFrozen(obj)) {
    return 0;
  }
  objForEach(obj, (child, id) => {
    if (!validateChild(child, id)) {
      objDel(obj, id);
    }
  });
  return 1;
};
