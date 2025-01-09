import {ifNotUndefined, isUndefined, size} from './other.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayForEach} from './array.ts';

export const object = Object;

const getPrototypeOf = (obj: any) => object.getPrototypeOf(obj);

const objFrozen = object.isFrozen;

const objEntries = object.entries;

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

export const objIds = object.keys;

export type IdObj<Value> = {[id: string]: Value};

export const objFreeze = object.freeze;

export const objSize = (obj: IdObj<unknown>): number => size(objIds(obj));

export const objForEach = <Value>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => void,
): void => arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));

export const objMerge = (...objs: IdObj<unknown>[]) =>
  object.assign({}, ...objs);

export const objIsEmpty = <Value>(obj: IdObj<Value> | any): boolean =>
  isObject(obj) && objSize(obj) == 0;

export const objDel = <Value>(obj: IdObj<Value>, id: Id): IdObj<Value> => {
  delete obj[id];
  return obj;
};

export const objValidate = (
  obj: IdObj<any> | undefined,
  validateChild: (child: any, id: Id) => boolean,
  onInvalidObj?: () => void,
  emptyIsValid: 0 | 1 = 0,
): boolean => {
  if (
    isUndefined(obj) ||
    !isObject(obj) ||
    (!emptyIsValid && objIsEmpty(obj)) ||
    objFrozen(obj)
  ) {
    onInvalidObj?.();
    return false;
  }
  objForEach(obj, (child, id) => {
    if (!validateChild(child, id)) {
      objDel(obj, id);
    }
  });
  return emptyIsValid ? true : !objIsEmpty(obj);
};
