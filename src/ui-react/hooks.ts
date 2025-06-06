import {
  DependencyList,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type {
  DurationMs,
  Id,
  Manager,
  Task,
  TaskRunConfig,
  TimestampMs,
} from '../@types/index.d.ts';
import type {
  useCreateManager as useCreateManagerDecl,
  useManager as useManagerDecl,
  useRunningTaskRunIds as useRunningTaskRunIdsDecl,
  useScheduledTaskRunIds as useScheduledTaskRunIdsDecl,
  useScheduleTaskRunCallback as useScheduleTaskRunCallbackDecl,
  useScheduleTaskRun as useScheduleTaskRunDecl,
  useSetTask as useSetTaskDecl,
  useStartCallback as useStartCallbackDecl,
  useStatus as useStatusDecl,
  useStopCallback as useStopCallbackDecl,
  useTaskRunRunning as useTaskRunRunningDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayIsEqual} from '../common/array.ts';
import {isObject} from '../common/obj.ts';
import {ifNotUndefined, isUndefined} from '../common/other.ts';
import {Context} from './context.ts';

const EMPTY_ARRAY: Readonly<[]> = [];

enum ReturnType {
  Array,
  Number,
  Boolean,
}
const DEFAULTS = [[], 0, false];
const IS_EQUALS: ((thing1: any, thing2: any) => boolean)[] = [arrayIsEqual];
const isEqual = (thing1: any, thing2: any) => thing1 === thing2;

const useListenable = (
  listenable: string,
  returnType: ReturnType,
  args: Readonly<(Id | null)[]> = EMPTY_ARRAY,
): any => {
  const manager = useManager();
  const lastResult = useRef(DEFAULTS[returnType]);
  const getResult = useCallback(
    () => {
      const nextResult = isUndefined(manager)
        ? undefined
        : ((manager as any)['get' + listenable]?.(
            ...args.filter((arg) => arg !== null),
          ) ?? DEFAULTS[returnType]);

      return !(IS_EQUALS[returnType] ?? isEqual)(nextResult, lastResult.current)
        ? (lastResult.current = nextResult)
        : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [manager, returnType, listenable, ...args],
  );
  const subscribe = useCallback(
    (listener: () => void) =>
      addAndDelListener(manager, listenable, ...args, listener),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [manager, returnType, listenable, ...args],
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.['add' + listenable + 'Listener']?.(...args);
  return () => thing?.delListener?.(listenerId);
};

const useScheduleTaskRunImpl = (
  args: [taskId: Id, arg?: string, startAfter?: TimestampMs | DurationMs],
  config?: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) => {
  const manager = useManager();
  useLayoutEffect(
    () =>
      ifNotUndefined(
        manager?.scheduleTaskRun(...args, config),
        (taskRunId) => () => {
          manager?.delTaskRun(taskRunId);
        },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager, ...args, ...configDeps],
  );
};

const useScheduleTaskRunCallbackImpl = (
  args: [taskId: Id, arg?: string, startAfter?: TimestampMs | DurationMs],
  config?: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) => {
  const manager = useManager();
  return useCallback(
    () => manager?.scheduleTaskRun(...args, config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager, ...args, ...configDeps],
  );
};

export const useCreateManager: typeof useCreateManagerDecl = (
  create: () => Manager,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Manager => useMemo(create, createDeps);

export const useManager: typeof useManagerDecl = () => useContext(Context)[0];

export const useStatus: typeof useStatusDecl = () =>
  useListenable('Status', ReturnType.Number);

export const useScheduledTaskRunIds: typeof useScheduledTaskRunIdsDecl = () =>
  useListenable('ScheduledTaskRunIds', ReturnType.Array);

export const useRunningTaskRunIds: typeof useRunningTaskRunIdsDecl = () =>
  useListenable('RunningTaskRunIds', ReturnType.Array);

export const useTaskRunRunning: typeof useTaskRunRunningDecl = (
  taskRunId: Id,
) => useListenable('TaskRunRunning', ReturnType.Boolean, [null, taskRunId]);

export const useStartCallback: typeof useStartCallbackDecl = () => {
  const manager = useManager();
  return useCallback(() => manager?.start(), [manager]);
};

export const useStopCallback: typeof useStopCallbackDecl = (
  force?: boolean,
) => {
  const manager = useManager();
  return useCallback(() => manager?.stop(force), [manager, force]);
};

export const useSetTask: typeof useSetTaskDecl = (
  taskId: Id,
  task: Task,
  taskDeps: DependencyList = EMPTY_ARRAY,
  categoryId?: Id,
  config?: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) => {
  const manager = useManager();
  useLayoutEffect(
    () => {
      manager?.setTask(taskId, task, categoryId, config);
      return () => {
        manager?.delTask(taskId);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager, taskId, ...taskDeps, categoryId, ...configDeps],
  );
};

export const useScheduleTaskRun: typeof useScheduleTaskRunDecl = (
  taskIdOrArgs:
    | Id
    | {
        taskId?: Id;
        arg?: string;
        startAfter?: TimestampMs | DurationMs;
        config?: TaskRunConfig;
      },
  argOrConfigDeps?: string | DependencyList,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
) =>
  (useScheduleTaskRunImpl as any)(
    ...(isObject(taskIdOrArgs)
      ? [
          [taskIdOrArgs.taskId, taskIdOrArgs.arg, taskIdOrArgs.startAfter],
          taskIdOrArgs.config,
          argOrConfigDeps,
        ]
      : [[taskIdOrArgs, argOrConfigDeps, startAfter], config, configDeps]),
  );

export const useScheduleTaskRunCallback: typeof useScheduleTaskRunCallbackDecl =
  (
    taskIdOrArgs:
      | Id
      | {
          taskId?: Id;
          arg?: string;
          startAfter?: TimestampMs | DurationMs;
          config?: TaskRunConfig;
        },
    argOrConfigDeps?: string | DependencyList,
    startAfter?: TimestampMs | DurationMs,
    config?: TaskRunConfig,
    configDeps?: DependencyList,
  ) =>
    (useScheduleTaskRunCallbackImpl as any)(
      ...(isObject(taskIdOrArgs)
        ? [
            [taskIdOrArgs.taskId, taskIdOrArgs.arg, taskIdOrArgs.startAfter],
            taskIdOrArgs.config,
            argOrConfigDeps,
          ]
        : [[taskIdOrArgs, argOrConfigDeps, startAfter], config, configDeps]),
    );
