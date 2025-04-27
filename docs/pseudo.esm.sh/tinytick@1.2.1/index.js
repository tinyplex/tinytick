// dist/index.js
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
var isPositiveNumber = (thing) => getTypeOf(thing) == "number" && thing >= 0;
var isUndefined = (thing) => thing == void 0;
var ifNotUndefined = (value, then, otherwise) => isUndefined(value) ? otherwise?.() : then(value);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var isEmpty = (arrayOrString) => size(arrayOrString) == 0;
var getNow = Date.now;
var normalizeTimestamp = (number) => {
  if (!isPositiveNumber(number)) {
    number = 0;
  }
  return number > MILLISECONDS_IN_YEAR ? number : getNow() + number;
};
var arrayMap = (array, cb) => array.map(cb);
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayForEach = (array, cb) => array.forEach(cb);
var arraySplice = (array, start, deleteCount, ...values) => array.splice(start, deleteCount, ...values);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var arraySplit = (string, separator) => string.split(separator);
var arrayFilter = (array, cb) => array.filter(cb);
var collSize = (coll) => coll.size;
var collHas = (coll, keyOrValue) => coll.has(keyOrValue);
var collDel = (coll, keyOrValue) => coll.delete(keyOrValue);
var collIsEmpty = (coll) => collSize(coll) == 0;
var collForEach = (coll, cb) => coll?.forEach(cb);
var collClear = (coll) => coll.clear();
var mapNew = (entries) => new Map(entries);
var mapSet = (map, key, value) => isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
var mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map, key));
  }
  return mapGet(map, key);
};
var mapGet = (map, key) => map?.get(key);
var mapKeys = (map) => [...map.keys()];
var mapToObj = (map, valueMapper) => {
  const obj = {};
  collForEach(map, (mapValue, id2) => obj[id2] = mapValue);
  return obj;
};
var visitTree = (node, path, ensureLeaf, pruneLeaf, p = 0) => ifNotUndefined(
  (ensureLeaf ? mapEnsure : mapGet)(
    node,
    path[p],
    p > size(path) - 2 ? ensureLeaf : mapNew
  ),
  (nodeOrLeaf) => {
    if (p > size(path) - 2) {
      if (pruneLeaf?.(nodeOrLeaf)) {
        mapSet(node, path[p]);
      }
      return nodeOrLeaf;
    }
    const leaf = visitTree(nodeOrLeaf, path, ensureLeaf, pruneLeaf, p + 1);
    if (collIsEmpty(nodeOrLeaf)) {
      mapSet(node, path[p]);
    }
    return leaf;
  }
);
var INTEGER = /^\d+$/;
var getPoolFunctions = () => {
  const pool = [];
  let nextId = 0;
  return [
    () => arrayShift(pool) ?? EMPTY_STRING + nextId++,
    (id2) => {
      if (test(INTEGER, id2) && size(pool) < 1e3) {
        arrayPush(pool, id2);
      }
    }
  ];
};
var setNew = () => /* @__PURE__ */ new Set();
var setAdd = (set, value) => set?.add(value);
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
  const leaves = [];
  const deep = (node, p) => p == size(path) ? arrayPush(leaves, node) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
  deep(deepIdSet, 0);
  return leaves;
};
var getListenerFunctions = (getThing) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path) => {
    thing ??= getThing();
    const id2 = getId();
    mapSet(allListeners, id2, [listener, idSetNode, path]);
    setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING], setNew), id2);
    return id2;
  };
  const callListeners = (idSetNode, ids, ...extraArgs) => arrayForEach(
    getWildcardedLeaves(idSetNode, ids),
    (set) => collForEach(
      set,
      (id2) => mapGet(allListeners, id2)[0](thing, ...ids ?? [], ...extraArgs)
    )
  );
  const delListener = (id2) => ifNotUndefined(mapGet(allListeners, id2), ([, idSetNode, idOrNulls]) => {
    visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING], void 0, (idSet) => {
      collDel(idSet, id2);
      return collIsEmpty(idSet) ? 1 : 0;
    });
    mapSet(allListeners, id2);
    releaseId(id2);
    return idOrNulls;
  });
  return [addListener, callListeners, delListener];
};
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objFrozen = object.isFrozen;
var objEntries = object.entries;
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
var objForEach = (obj, cb) => arrayForEach(objEntries(obj), ([id2, value]) => cb(value, id2));
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
var pairNewMap = () => [mapNew(), mapNew()];
var getRandomValues = GLOBAL.crypto ? (array) => GLOBAL.crypto.getRandomValues(array) : (
  /* istanbul ignore next */
  (array) => arrayMap(array, () => mathFloor(math.random() * 256))
);
var getUniqueId = (length = 16) => arrayReduce(
  getRandomValues(new Uint8Array(length)),
  (uniqueId, number) => uniqueId + encode(number),
  ""
);
var TICK_INTERVAL = "tickInterval";
var MAX_DURATION = "maxDuration";
var MAX_RETRIES = "maxRetries";
var RETRY_DELAY = "retryDelay";
var DEFAULT_MANAGER_CONFIG = {
  [TICK_INTERVAL]: 100
};
var DEFAULT_TASK_RUN_CONFIG = {
  [MAX_DURATION]: 1e3,
  [MAX_RETRIES]: 0,
  [RETRY_DELAY]: 1e3
};
var RETRY_PATTERN = /^(\d*\.?\d+)(, ?\d*\.?\d+)*$/;
var managerConfigValidators = {
  [TICK_INTERVAL]: isPositiveNumber
};
var taskRunConfigValidators = {
  [MAX_DURATION]: isPositiveNumber,
  [MAX_RETRIES]: isPositiveNumber,
  [RETRY_DELAY]: (child) => isPositiveNumber(child) || isString(child) && RETRY_PATTERN.test(child)
};
var validatedTestRunConfig = (config) => objValidate(config, (child, id2) => taskRunConfigValidators[id2]?.(child)) ? config : {};
var abortTaskRun = (taskRun) => taskRun[
  7
  /* AbortController */
]?.abort();
var updateTaskRun = (obj1, obj2) => objForEach(obj2, (value, id2) => obj1[id2] = value);
var createManager = () => {
  let config = {};
  let tickHandle;
  let status = 0;
  const categoryMap = mapNew();
  const taskMap = mapNew();
  const taskRunMap = mapNew();
  const statusListeners = mapNew();
  const tickListeners = pairNewMap();
  const taskRunIdsListeners = pairNewMap();
  const taskRunRunningListeners = mapNew();
  const taskRunFailedListeners = mapNew();
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => manager
  );
  const allTaskRunPointers = [[], []];
  const allTaskRunIdsChanged = pairNewMap();
  const taskRunChanges = mapNew();
  const taskRunFailures = mapNew();
  const insertTaskRunPointer = (taskRunState, taskId, taskRunId, timestamp, reason) => {
    const taskRunPointers = allTaskRunPointers[taskRunState];
    const nextIndex = taskRunPointers.findIndex(
      (existingPointer) => existingPointer[
        2
        /* Timestamp */
      ] > timestamp
    );
    const taskRunPointer = [taskId, taskRunId, timestamp];
    arraySplice(
      taskRunPointers,
      nextIndex == -1 ? size(taskRunPointers) : nextIndex,
      0,
      taskRunPointer
    );
    taskRunChanged(taskRunState, taskId, taskRunId, 1, [
      taskRunState == 1,
      reason
    ]);
  };
  const removeTaskRunPointer = (taskRunState, taskId, taskRunId, reason) => {
    const taskRunPointers = allTaskRunPointers[taskRunState];
    const index = taskRunPointers.findIndex(
      (pointer) => pointer[
        1
        /* TaskRunId */
      ] == taskRunId
    );
    if (index != -1) {
      arraySplice(taskRunPointers, index, 1);
      taskRunChanged(taskRunState, taskId, taskRunId, -1, [
        void 0,
        reason
      ]);
    }
  };
  const shiftTaskRunPointer = (taskRunState, reason) => {
    const [taskId, taskRunId] = arrayShift(allTaskRunPointers[taskRunState]);
    taskRunChanged(taskRunState, taskId, taskRunId, -1, [
      void 0,
      reason
    ]);
    return [taskId, taskRunId, mapGet(taskRunMap, taskRunId)];
  };
  const getTaskRunIds = (taskRunState) => arrayFilter(
    arrayMap(
      allTaskRunPointers[taskRunState],
      (taskRunPointer) => taskRunPointer[
        1
        /* TaskRunId */
      ]
    ),
    isString
  );
  const changeStatus = (newStatus) => callListeners(statusListeners, void 0, status = newStatus);
  const taskRunChanged = (taskRunState, taskId, taskRunId, addedOrRemoved, runningAndReason) => {
    const taskRunIdsChanged = allTaskRunIdsChanged[taskRunState];
    mapSet(taskRunIdsChanged, taskRunId, addedOrRemoved);
    mapSet(
      mapEnsure(taskRunChanges, taskId, mapNew),
      taskRunId,
      runningAndReason
    );
  };
  const taskRunFailed = (taskId, taskRunId, reason, message = EMPTY_STRING) => mapSet(mapEnsure(taskRunFailures, taskId, mapNew), taskRunId, [
    reason,
    message
  ]);
  const callAllListeners = () => {
    arrayForEach(allTaskRunIdsChanged, (taskRunIdsChanged, taskRunState) => {
      if (!collIsEmpty(taskRunIdsChanged)) {
        callListeners(
          taskRunIdsListeners[taskRunState],
          void 0,
          mapToObj(taskRunIdsChanged)
        );
        collClear(taskRunIdsChanged);
      }
    });
    collForEach(
      taskRunChanges,
      (taskChanges, taskId) => collForEach(
        taskChanges,
        ([running, reason], taskRunId) => callListeners(
          taskRunRunningListeners,
          [taskId, taskRunId],
          running,
          reason
        )
      )
    );
    collClear(taskRunChanges);
    collForEach(
      taskRunFailures,
      (taskFailures, taskId) => collForEach(
        taskFailures,
        ([reason, message], taskRunId) => callListeners(
          taskRunFailedListeners,
          [taskId, taskRunId],
          reason,
          message
        )
      )
    );
    collClear(taskRunFailures);
  };
  const tick = () => {
    const now = getNow();
    const [scheduledTaskRunPointers, runningTaskRunPointers] = allTaskRunPointers;
    callListeners(tickListeners[
      0
      /* Will */
    ]);
    while (size(scheduledTaskRunPointers) && scheduledTaskRunPointers[0][
      2
      /* Timestamp */
    ] <= now) {
      const [taskId, taskRunId, taskRun] = shiftTaskRunPointer(
        0,
        1
      );
      ifNotUndefined(
        mapGet(taskMap, taskId),
        ([task]) => {
          if (isUndefined(taskRun[
            8
            /* Duration */
          ])) {
            const config2 = getTaskRunConfig(taskRunId, true);
            const retryDelay = config2[RETRY_DELAY];
            updateTaskRun(taskRun, {
              [
                8
                /* Duration */
              ]: config2[MAX_DURATION],
              [
                9
                /* Retries */
              ]: config2[MAX_RETRIES],
              [
                10
                /* Delays */
              ]: isString(retryDelay) ? arrayMap(
                arraySplit(retryDelay, ","),
                (number) => parseInt(number)
              ) : [retryDelay]
            });
          }
          const finishTimestamp = now + taskRun[
            8
            /* Duration */
          ];
          const abortController = new AbortController();
          updateTaskRun(taskRun, {
            [
              6
              /* NextTimestamp */
            ]: finishTimestamp,
            [
              5
              /* Running */
            ]: true,
            [
              7
              /* AbortController */
            ]: abortController
          });
          insertTaskRunPointer(
            1,
            taskId,
            taskRunId,
            finishTimestamp,
            1
          );
          task(
            taskRun[
              1
              /* Arg */
            ],
            abortController.signal,
            getTaskRunInfoFromTaskRun(taskRunId, taskRun)
          ).then(() => {
            if (taskRun[
              5
              /* Running */
            ]) {
              removeTaskRunPointer(
                1,
                taskId,
                taskRunId,
                2
              );
              mapSet(taskRunMap, taskRunId);
              callAllListeners();
            }
          }).catch((error) => {
            removeTaskRunPointer(
              1,
              taskId,
              taskRunId,
              4
            );
            rescheduleTaskRun(
              taskRunId,
              taskRun,
              getNow(),
              4
              /* Errored */
            );
            taskRunFailed(taskId, taskRunId, 4, error.message);
            callAllListeners();
          });
        },
        () => delTaskRunImpl(taskRunId)
      );
    }
    callAllListeners();
    while (size(runningTaskRunPointers) && runningTaskRunPointers[0][
      2
      /* Timestamp */
    ] <= now) {
      const [taskId, taskRunId, taskRun] = shiftTaskRunPointer(
        1,
        3
      );
      abortTaskRun(taskRun);
      rescheduleTaskRun(
        taskRunId,
        taskRun,
        now,
        3
        /* TimedOut */
      );
      taskRunFailed(
        taskId,
        taskRunId,
        3
        /* TimedOut */
      );
    }
    callAllListeners();
    callListeners(tickListeners[
      1
      /* Did */
    ]);
    if (status == 1 || status == 2 && !isEmpty(scheduledTaskRunPointers)) {
      scheduleTick();
    } else {
      unscheduleTick();
      changeStatus(
        0
        /* Stopped */
      );
    }
  };
  const rescheduleTaskRun = (taskRunId, taskRun, now, reason) => {
    if (taskRun[
      9
      /* Retries */
    ]-- > 0) {
      const delays = taskRun[
        10
        /* Delays */
      ];
      const delay = size(delays) > 1 ? delays.shift() : delays[0];
      const startTimestamp = now + delay;
      updateTaskRun(taskRun, {
        [
          4
          /* Retry */
        ]: taskRun[
          4
          /* Retry */
        ] + 1,
        [
          5
          /* Running */
        ]: false,
        [
          6
          /* NextTimestamp */
        ]: startTimestamp,
        [
          7
          /* AbortController */
        ]: void 0
      });
      insertTaskRunPointer(
        0,
        taskRun[
          0
          /* TaskId */
        ],
        taskRunId,
        startTimestamp,
        reason
      );
    } else {
      delTaskRunImpl(taskRunId, reason);
    }
  };
  const delTaskRunImpl = (taskRunId, reason = 5) => ifNotUndefined(mapGet(taskRunMap, taskRunId), (taskRun) => {
    abortTaskRun(taskRun);
    removeTaskRunPointer(
      taskRun[
        5
        /* Running */
      ] ? 1 : 0,
      taskRun[
        0
        /* TaskId */
      ],
      taskRunId,
      reason
    );
    mapSet(taskRunMap, taskRunId);
  });
  const scheduleTick = () => {
    unscheduleTick();
    tickHandle = setTimeout(tick, getManagerConfig(true)[TICK_INTERVAL]);
  };
  const unscheduleTick = () => isUndefined(tickHandle) ? 0 : clearTimeout(tickHandle);
  const getTaskRunInfoFromTaskRun = (taskRunId, [taskId, arg, , , retry, running, nextTimestamp]) => objFilterUndefined({
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
    const startTimestamp = normalizeTimestamp(startAfter);
    mapSet(taskRunMap, taskRunId, [
      id(taskId),
      arg,
      startTimestamp,
      validatedTestRunConfig(config2),
      0,
      false,
      startTimestamp
    ]);
    insertTaskRunPointer(
      0,
      id(taskId),
      taskRunId,
      startTimestamp,
      0
    );
    callAllListeners();
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
  const getTaskRunRunning = (taskRunId) => mapGet(taskRunMap, id(taskRunId))?.[
    5
    /* Running */
  ];
  const delTaskRun = (taskRunId) => fluent((taskRunId2) => {
    delTaskRunImpl(taskRunId2);
    callAllListeners();
  }, taskRunId);
  const getScheduledTaskRunIds = () => getTaskRunIds(0);
  const getRunningTaskRunIds = () => getTaskRunIds(1);
  const addStatusListener = (listener) => addListener(listener, statusListeners);
  const addWillTickListener = (listener) => addListener(listener, tickListeners[
    0
    /* Will */
  ]);
  const addDidTickListener = (listener) => addListener(listener, tickListeners[
    1
    /* Did */
  ]);
  const addScheduledTaskRunIdsListener = (listener) => addListener(listener, taskRunIdsListeners[
    0
    /* Scheduled */
  ]);
  const addRunningTaskRunIdsListener = (listener) => addListener(listener, taskRunIdsListeners[
    1
    /* Running */
  ]);
  const addTaskRunRunningListener = (taskId, taskRunId, listener) => addListener(listener, taskRunRunningListeners, [taskId, taskRunId]);
  const addTaskRunFailedListener = (taskId, taskRunId, listener) => addListener(listener, taskRunFailedListeners, [taskId, taskRunId]);
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return manager;
  };
  const start = () => fluent(() => {
    changeStatus(
      1
      /* Running */
    );
    scheduleTick();
  });
  const stop = (force = false) => fluent(() => {
    if (force) {
      changeStatus(
        0
        /* Stopped */
      );
      unscheduleTick();
    } else if (status != 0) {
      changeStatus(
        2
        /* Stopping */
      );
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
    getTaskRunRunning,
    delTaskRun,
    getScheduledTaskRunIds,
    getRunningTaskRunIds,
    addStatusListener,
    addWillTickListener,
    addDidTickListener,
    addScheduledTaskRunIdsListener,
    addRunningTaskRunIdsListener,
    addTaskRunRunningListener,
    addTaskRunFailedListener,
    delListener,
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
