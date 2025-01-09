(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyTick = {})));
})(this, function (exports) {
  'use strict';

  const EMPTY_STRING = '';
  const id = (key) => EMPTY_STRING + key;
  const strSplit = (str, separator = EMPTY_STRING, limit) =>
    str.split(separator, limit);

  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const arrayMap = (array, cb) => array.map(cb);
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
  const arrayForEach = (array, cb) => array.forEach(cb);

  const GLOBAL = globalThis;
  const math = Math;
  const mathFloor = math.floor;
  const MASK6 = 63;
  const ENCODE = /* @__PURE__ */ strSplit(
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
  );
  const isUndefined = (thing) => thing == undefined;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const getRandomValues = GLOBAL.crypto
    ? (array) => GLOBAL.crypto.getRandomValues(array)
    : /* istanbul ignore next */
      (array) => arrayMap(array, () => mathFloor(math.random() * 256));
  const getUniqueId = (length = 16) =>
    arrayReduce(
      getRandomValues(new Uint8Array(length)),
      (uniqueId, number) => uniqueId + encode(number),
      '',
    );
  const encode = (num) => ENCODE[num & MASK6];
  const size = (arrayOrString) => arrayOrString.length;

  const mapNew = (entries) => new Map(entries);
  const mapSet = (map, key, value) =>
    isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
  const mapGet = (map, key) => map?.get(key);
  const mapKeys = (map) => [...(map?.keys() ?? [])];

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
  const objFrozen = object.isFrozen;
  const objEntries = object.entries;
  const isObject = (obj) =>
    !isUndefined(obj) &&
    ifNotUndefined(
      getPrototypeOf(obj),
      (objPrototype) =>
        objPrototype == object.prototype ||
        isUndefined(getPrototypeOf(objPrototype)),

      /* istanbul ignore next */
      () => true,
    );
  const objIds = object.keys;
  const objFreeze = object.freeze;
  const objSize = (obj) => size(objIds(obj));
  const objForEach = (obj, cb) =>
    arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
  const objMerge = (...objs) => object.assign({}, ...objs);
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
  const objDel = (obj, id) => {
    delete obj[id];
    return obj;
  };
  const objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
    if (
      isUndefined(obj) ||
      !isObject(obj) ||
      (!emptyIsValid && objIsEmpty(obj)) ||
      objFrozen(obj)
    ) {
      return false;
    }
    objForEach(obj, (child, id) => {
      if (!validateChild(child, id)) {
        objDel(obj, id);
      }
    });
    return emptyIsValid ? true : !objIsEmpty(obj);
  };

  const RETRY_PATTERN = /^\d+(,\d+)*$/;
  const DEFAULT_CONFIG = {
    maxDuration: 1,
    maxRetries: 2,
    retryDelay: 3,
  };
  const isString = (child) => typeof child == 'string';
  const isPositiveNumber = (child) => typeof child == 'number' && child > 0;
  const managerConfigValidators = {
    tickInterval: isPositiveNumber,
  };
  const categoryConfigValidators = {
    maxDuration: isPositiveNumber,
    maxRetries: isPositiveNumber,
    retryDelay: (child) =>
      isPositiveNumber(child) ||
      (typeof child == 'string' && RETRY_PATTERN.test(child)),
  };
  const taskConfigValidators = {
    categoryId: isString,
    ...categoryConfigValidators,
  };
  const createManager = () => {
    let validConfig = {};
    const categoryMap = mapNew();
    const taskMap = mapNew();
    const taskRunMap = mapNew();
    const fluent = (actions, ...args) => {
      actions(...arrayMap(args, id));
      return manager;
    };
    const setManagerConfig = (managerConfig) =>
      fluent(() =>
        objValidate(managerConfig, (child, id2) =>
          managerConfigValidators[id2]?.(child),
        )
          ? (validConfig = managerConfig)
          : 0,
      );
    const getManagerConfig = () => objMerge(validConfig);
    const setTask = (taskId, task, taskConfig = {}) =>
      fluent((taskId2) => mapSet(taskMap, taskId2, [task, taskConfig]), taskId);
    const setTaskConfig = (taskId, taskConfig) =>
      fluent(
        (taskId2) =>
          ifNotUndefined(mapGet(taskMap, taskId2), (taskAndConfig) =>
            objValidate(taskConfig, (child, id2) =>
              taskConfigValidators[id2]?.(child),
            )
              ? (taskAndConfig[1] = taskConfig)
              : 0,
          ),
        taskId,
      );
    const getTaskConfig = (taskId, withDefaults = false) =>
      ifNotUndefined(mapGet(taskMap, id(taskId)), ([, taskConfig]) =>
        objMerge(
          withDefaults
            ? ifNotUndefined(
                taskConfig.categoryId,
                (categoryId) => getCategoryConfig(categoryId, true),
                () => DEFAULT_CONFIG,
              )
            : {},
          taskConfig,
        ),
      );
    const getTaskIds = () => mapKeys(taskMap);
    const delTask = (taskId) =>
      fluent((taskId2) => mapSet(taskMap, taskId2), taskId);
    const setCategoryConfig = (categoryId, config) =>
      fluent(
        (categoryId2) =>
          objValidate(
            config,
            (child, id2) => categoryConfigValidators[id2]?.(child),
            undefined,
            1,
          )
            ? mapSet(categoryMap, categoryId2, config)
            : 0,
        categoryId,
      );
    const getCategoryConfig = (categoryId, withDefaults = false) =>
      ifNotUndefined(mapGet(categoryMap, id(categoryId)), (categoryConfig) =>
        objMerge(withDefaults ? DEFAULT_CONFIG : {}, categoryConfig),
      );
    const getCategoryIds = () => mapKeys(categoryMap);
    const delCategory = (categoryId) =>
      fluent((categoryId2) => mapSet(categoryMap, categoryId2), categoryId);
    const scheduleTaskRun = (
      taskId,
      arg = EMPTY_STRING,
      _after = 0,
      _before = Infinity,
    ) => {
      const taskRunId = getUniqueId();
      mapSet(taskRunMap, taskRunId, {taskId, arg, started: null});
      return taskRunId;
    };
    const getTaskRunInfo = (taskRunId) => mapGet(taskRunMap, taskRunId);
    const unscheduleTaskRun = (taskRunId) =>
      fluent((taskRunId2) => mapSet(taskRunMap, taskRunId2), taskRunId);
    const manager = {
      setManagerConfig,
      getManagerConfig,
      setTask,
      setTaskConfig,
      getTaskConfig,
      getTaskIds,
      delTask,
      setCategoryConfig,
      getCategoryConfig,
      getCategoryIds,
      delCategory,
      scheduleTaskRun,
      getTaskRunInfo,
      unscheduleTaskRun,
    };
    return objFreeze(manager);
  };

  exports.createManager = createManager;
});
