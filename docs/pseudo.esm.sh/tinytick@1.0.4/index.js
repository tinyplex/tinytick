// dist/index.js
var collDel = (coll, keyOrValue) => coll.delete(keyOrValue);
var arrayMap = (array, cb) => array.map(cb);
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayForEach = (array, cb) => array.forEach(cb);
var arraySplice = (array, start, deleteCount, ...values) => array.splice(start, deleteCount, ...values);
var arrayShift = (array) => array.shift();
var arraySplit = (string, separator) => string.split(separator);
var arrayFilter = (array, cb) => array.filter(cb);
var EMPTY_STRING = "";
var getTypeOf = (thing) => typeof thing;
var id = (key) => EMPTY_STRING + key;
var isString = (thing) => getTypeOf(thing) == "string";
var strSplit = (str, separator = EMPTY_STRING, limit) => str.split(separator, limit);
var GLOBAL = globalThis;
var math = Math;
var mathFloor = math.floor;
var MASK6 = 63;
var ENCODE = /* @__PURE__ */ strSplit(
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);
var MILLISECONDS_IN_YEAR = 31536e6;
var encode = (num) => ENCODE[num & MASK6];
var getRandomValues = GLOBAL.crypto ? (array) => GLOBAL.crypto.getRandomValues(array) : (
  /* istanbul ignore next */
  (array) => arrayMap(array, () => mathFloor(math.random() * 256))
);
var isPositiveNumber = (thing) => getTypeOf(thing) == "number" && thing >= 0;
var isUndefined = (thing) => thing == void 0;
var ifNotUndefined = (value, then, otherwise) => isUndefined(value) ? otherwise?.() : then(value);
var getUniqueId = (length = 16) => arrayReduce(
  getRandomValues(new Uint8Array(length)),
  (uniqueId, number) => uniqueId + encode(number),
  ""
);
var size = (arrayOrString) => arrayOrString.length;
var isEmpty = (arrayOrString) => size(arrayOrString) == 0;
var getNow = Date.now;
var normalizeTimestamp = (number) => {
  if (!isPositiveNumber(number)) {
    number = 0;
  }
  return number > MILLISECONDS_IN_YEAR ? number : getNow() + number;
};
var mapNew = (entries) => new Map(entries);
var mapSet = (map, key, value) => isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
var mapGet = (map, key) => map?.get(key);
var mapKeys = (map) => [...map.keys()];
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objFrozen = object.isFrozen;
var objEntries = object.entries;
var objForEach = (obj, cb) => arrayForEach(objEntries(obj), ([id2, value]) => cb(value, id2));
var isObject = (obj) => !isUndefined(obj) && ifNotUndefined(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isUndefined(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objDel = (obj, id2) => {
  delete obj[id2];
  return obj;
};
var objFreeze = object.freeze;
var objMerge = (...objs) => object.assign({}, ...objs);
var objFilterUndefined = (obj) => {
  objForEach(obj, (value, id2) => value === void 0 ? delete obj[id2] : 0);
  return obj;
};
var objValidate = (obj, validateChild) => {
  if (isUndefined(obj) || !isObject(obj) || objFrozen(obj)) {
    return 0;
  }
  objForEach(obj, (child, id2) => {
    if (!validateChild(child, id2)) {
      objDel(obj, id2);
    }
  });
  return 1;
};
var TASK_ID = 0;
var ARG = 1;
var RETRY = 4;
var RUNNING = 5;
var TIMESTAMP_PAIR = 6;
var ABORT_CONTROLLER = 7;
var DURATION = 8;
var RETRIES = 9;
var DELAYS = 10;
var TICK_INTERVAL = "tickInterval";
var MAX_DURATION = "maxDuration";
var MAX_RETRIES = "maxRetries";
var RETRY_DELAY = "retryDelay";
var RETRY_PATTERN = /^(\d*\.?\d+)(, ?\d*\.?\d+)*$/;
var DEFAULT_MANAGER_CONFIG = {
  [TICK_INTERVAL]: 100
};
var DEFAULT_TASK_RUN_CONFIG = {
  [MAX_DURATION]: 1e3,
  [MAX_RETRIES]: 0,
  [RETRY_DELAY]: 1e3
};
var managerConfigValidators = {
  [TICK_INTERVAL]: isPositiveNumber
};
var taskRunConfigValidators = {
  [MAX_DURATION]: isPositiveNumber,
  [MAX_RETRIES]: isPositiveNumber,
  [RETRY_DELAY]: (child) => isPositiveNumber(child) || isString(child) && RETRY_PATTERN.test(child)
};
var validatedTestRunConfig = (config) => objValidate(config, (child, id2) => taskRunConfigValidators[id2]?.(child)) ? config : {};
var insertTimestampPair = (taskRuns, taskRunId, timestamp) => {
  const nextIndex = taskRuns.findIndex(
    ([, existingTimestamp]) => existingTimestamp > timestamp
  );
  const timestampPair = [taskRunId, timestamp];
  arraySplice(
    taskRuns,
    nextIndex == -1 ? size(taskRuns) : nextIndex,
    0,
    timestampPair
  );
  return timestampPair;
};
var abortTaskRun = (taskRun) => taskRun[ABORT_CONTROLLER]?.abort();
var getTaskRunIds = (taskRuns) => arrayFilter(
  arrayMap(taskRuns, ([taskRunId]) => taskRunId),
  isString
);
var createManager = () => {
  let config = {};
  let tickHandle;
  let status = 0;
  const categoryMap = mapNew();
  const taskMap = mapNew();
  const taskRunMap = mapNew();
  const scheduledTaskRuns = [];
  const runningTaskRuns = [];
  const tick = () => {
    const now = getNow();
    while (size(scheduledTaskRuns) && scheduledTaskRuns[0][1] <= now) {
      const [taskRunId] = arrayShift(scheduledTaskRuns);
      ifNotUndefined(
        mapGet(taskRunMap, taskRunId),
        (taskRun) => ifNotUndefined(
          mapGet(taskMap, taskRun[TASK_ID]),
          ([task]) => {
            if (isUndefined(taskRun[DURATION])) {
              const config2 = getTaskRunConfig(taskRunId, true);
              const retryDelay = config2[RETRY_DELAY];
              taskRun[DURATION] = config2[MAX_DURATION];
              taskRun[RETRIES] = config2[MAX_RETRIES];
              taskRun[DELAYS] = isString(retryDelay) ? arrayMap(
                arraySplit(retryDelay, ","),
                (number) => parseInt(number)
              ) : [retryDelay];
            }
            taskRun[TIMESTAMP_PAIR] = insertTimestampPair(
              runningTaskRuns,
              taskRunId,
              now + taskRun[DURATION]
            );
            taskRun[RUNNING] = true;
            taskRun[ABORT_CONTROLLER] = new AbortController();
            task(
              taskRun[ARG],
              taskRun[ABORT_CONTROLLER].signal,
              getTaskRunInfoFromTaskRun(taskRunId, taskRun)
            ).then(() => {
              if (taskRun[RUNNING]) {
                taskRun[TIMESTAMP_PAIR][0] = null;
                mapSet(taskRunMap, taskRunId);
              }
            }).catch(() => rescheduleTaskRun(taskRunId, taskRun, getNow()));
          },
          () => delTaskRun(taskRunId)
        )
      );
    }
    while (size(runningTaskRuns) && (isUndefined(runningTaskRuns[0][0]) || runningTaskRuns[0][1] <= now)) {
      const [taskRunId] = arrayShift(runningTaskRuns);
      ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
        abortTaskRun(taskRun);
        rescheduleTaskRun(taskRunId, taskRun, now);
      });
    }
    if (status == 1 || status == 2 && !isEmpty(scheduledTaskRuns)) {
      scheduleTick();
    } else {
      unscheduleTick();
      status = 0;
    }
  };
  const rescheduleTaskRun = (taskRunId, taskRun, now) => {
    if (taskRun[RETRIES]-- > 0) {
      const delays = taskRun[DELAYS];
      const delay = size(delays) > 1 ? delays.shift() : delays[0];
      taskRun[RETRY]++;
      taskRun[RUNNING] = false;
      taskRun[TIMESTAMP_PAIR] = insertTimestampPair(
        scheduledTaskRuns,
        taskRunId,
        now + delay
      );
      taskRun[ABORT_CONTROLLER] = void 0;
    } else {
      delTaskRun(taskRunId);
    }
  };
  const scheduleTick = () => {
    unscheduleTick();
    tickHandle = setTimeout(tick, getManagerConfig(true)[TICK_INTERVAL]);
  };
  const unscheduleTick = () => isUndefined(tickHandle) ? 0 : clearTimeout(tickHandle);
  const getTaskRunInfoFromTaskRun = (taskRunId, [taskId, arg, , , retry, running, [, nextTimestamp]]) => objFilterUndefined({
    manager,
    taskId,
    taskRunId,
    arg,
    retry,
    running,
    nextTimestamp
  });
  const fluent = (actions, ...args) => {
    actions(...arrayMap(args, id));
    return manager;
  };
  const setManagerConfig = (managerConfig) => fluent(
    () => objValidate(
      managerConfig,
      (child, id2) => managerConfigValidators[id2]?.(child)
    ) ? config = managerConfig : 0
  );
  const getManagerConfig = (withDefaults) => objMerge(withDefaults ? DEFAULT_MANAGER_CONFIG : {}, config);
  const setCategory = (categoryId, config2) => fluent(
    (categoryId2) => mapSet(categoryMap, categoryId2, validatedTestRunConfig(config2)),
    categoryId
  );
  const getCategoryConfig = (categoryId, withDefaults) => ifNotUndefined(
    mapGet(categoryMap, id(categoryId)),
    (config2) => objMerge(withDefaults ? DEFAULT_TASK_RUN_CONFIG : {}, config2)
  );
  const getCategoryIds = () => mapKeys(categoryMap);
  const delCategory = (categoryId) => fluent((categoryId2) => mapSet(categoryMap, categoryId2), categoryId);
  const setTask = (taskId, task, categoryId, config2 = {}) => fluent(
    (taskId2, categoryId2) => mapSet(taskMap, taskId2, [
      task,
      categoryId2,
      validatedTestRunConfig(config2)
    ]),
    taskId,
    categoryId
  );
  const getTaskConfig = (taskId, withDefaults) => ifNotUndefined(
    mapGet(taskMap, id(taskId)),
    ([, categoryId, config2]) => objMerge(
      withDefaults ? DEFAULT_TASK_RUN_CONFIG : {},
      withDefaults && !isUndefined(categoryId) ? getCategoryConfig(categoryId) ?? {} : {},
      config2
    )
  );
  const getTaskIds = () => mapKeys(taskMap);
  const delTask = (taskId) => fluent((taskId2) => mapSet(taskMap, taskId2), taskId);
  const scheduleTaskRun = (taskId, arg, startAfter = 0, config2 = {}) => {
    if (status == 2) {
      return void 0;
    }
    const taskRunId = getUniqueId();
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      normalizeTimestamp(startAfter),
      validatedTestRunConfig(config2),
      0,
      false,
      insertTimestampPair(
        scheduledTaskRuns,
        taskRunId,
        normalizeTimestamp(startAfter)
      )
    ]);
    return taskRunId;
  };
  const getTaskRunConfig = (taskRunId, withDefaults) => ifNotUndefined(
    mapGet(taskRunMap, id(taskRunId)),
    ([taskId, , , config2]) => objMerge(
      withDefaults ? DEFAULT_TASK_RUN_CONFIG : {},
      withDefaults ? getTaskConfig(taskId, true) ?? {} : {},
      config2
    )
  );
  const getTaskRunInfo = (taskRunId) => ifNotUndefined(
    mapGet(taskRunMap, id(taskRunId)),
    (taskRun) => getTaskRunInfoFromTaskRun(taskRunId, taskRun)
  );
  const delTaskRun = (taskRunId) => fluent(
    (taskRunId2) => ifNotUndefined(mapGet(taskRunMap, taskRunId2), (taskRun) => {
      abortTaskRun(taskRun);
      taskRun[TIMESTAMP_PAIR][0] = null;
      mapSet(taskRunMap, taskRunId2);
    }),
    taskRunId
  );
  const getScheduledTaskRunIds = () => getTaskRunIds(scheduledTaskRuns);
  const getRunningTaskRunIds = () => getTaskRunIds(runningTaskRuns);
  const start = () => fluent(() => {
    status = 1;
    scheduleTick();
  });
  const stop = (force = false) => fluent(() => {
    if (force) {
      status = 0;
      unscheduleTick();
    } else {
      status = 2;
    }
  });
  const getStatus = () => status;
  const manager = {
    setManagerConfig,
    getManagerConfig,
    setCategory,
    getCategoryConfig,
    getCategoryIds,
    delCategory,
    setTask,
    getTaskConfig,
    getTaskIds,
    delTask,
    scheduleTaskRun,
    getTaskRunConfig,
    getTaskRunInfo,
    delTaskRun,
    getScheduledTaskRunIds,
    getRunningTaskRunIds,
    start,
    stop,
    getStatus,
    getNow
  };
  return objFreeze(manager);
};
export {
  createManager
};
