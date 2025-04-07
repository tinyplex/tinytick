import {DependencyList, useContext, useMemo} from 'react';
import type {
  DurationMs,
  Id,
  Manager,
  ManagerConfig,
  Task,
  TaskRunConfig,
  TimestampMs,
} from '../@types/index.d.ts';
import type {
  useCreateManager as useCreateManagerDecl,
  useDelCategory as useDelCategoryDecl,
  useDelTask as useDelTaskDecl,
  useDelTaskRun as useDelTaskRunDecl,
  useGetCategoryConfig as useGetCategoryConfigDecl,
  useGetCategoryIds as useGetCategoryIdsDecl,
  useGetManagerConfig as useGetManagerConfigDecl,
  useGetNow as useGetNowDecl,
  useGetRunningTaskRunIds as useGetRunningTaskRunIdsDecl,
  useGetScheduledTaskRunIds as useGetScheduledTaskRunIdsDecl,
  useGetStatus as useGetStatusDecl,
  useGetTaskConfig as useGetTaskConfigDecl,
  useGetTaskIds as useGetTaskIdsDecl,
  useGetTaskRunConfig as useGetTaskRunConfigDecl,
  useGetTaskRunInfo as useGetTaskRunInfoDecl,
  useManager as useManagerDecl,
  useScheduleTaskRun as useScheduleTaskRunDecl,
  useSetCategory as useSetCategoryDecl,
  useSetManagerConfig as useSetManagerConfigDecl,
  useSetTask as useSetTaskDecl,
  useStart as useStartDecl,
  useStop as useStopDecl,
} from '../@types/ui-react/index.d.ts';
import {isUndefined} from '../common/other.ts';
import {Context} from './context.ts';

const EMPTY_ARRAY: Readonly<[]> = [];

type Primitive = string | number | boolean;
type PrimitiveParams<Params extends any[]> = Params['length'] extends 0
  ? readonly []
  : Params extends [first: infer Param1, ...infer ParamsN]
    ? [Param1] extends [Primitive]
      ? readonly [Param1, ...PrimitiveParams<ParamsN>]
      : PrimitiveParams<ParamsN>
    : Params extends [first?: infer Param1, ...infer ParamsN]
      ? [Param1] extends [Primitive]
        ? readonly [Param1 | undefined, ...PrimitiveParams<ParamsN>]
        : PrimitiveParams<ParamsN>
      : readonly [];

type DependencyParams<Params extends any[]> = Params['length'] extends 0
  ? readonly []
  : Params extends [first: infer Param1, ...infer ParamsN]
    ? [Param1] extends [Primitive]
      ? DependencyParams<ParamsN>
      : readonly [readonly any[], ...DependencyParams<ParamsN>]
    : Params extends [first?: infer Param1, ...infer ParamsN]
      ? [Param1] extends [Primitive]
        ? DependencyParams<ParamsN>
        : readonly [readonly any[], ...DependencyParams<ParamsN>]
      : readonly [];

const useManagerProxy = <Method extends keyof Manager>(
  method: Method,
  args?: Parameters<Manager[Method]>,
  depLiterals?: PrimitiveParams<Parameters<Manager[Method]>>,
  depArrays?: DependencyParams<Parameters<Manager[Method]>>,
) => {
  const manager = useManager();
  return useMemo(
    () =>
      isUndefined(manager)
        ? manager
        : (manager[method] as any)(...(args ?? EMPTY_ARRAY)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      manager,
      // @ts-expect-error recursion is mitigated
      depLiterals ?? args ?? EMPTY_ARRAY,
      depArrays ?? EMPTY_ARRAY,
    ].flat(2) as DependencyList,
  );
};

export const useCreateManager: typeof useCreateManagerDecl = (
  create: () => Manager,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Manager => useMemo(create, createDeps);

export const useManager: typeof useManagerDecl = () => useContext(Context)[0];

export const useSetManagerConfig: typeof useSetManagerConfigDecl = (
  config: ManagerConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) => useManagerProxy('setManagerConfig', [config], EMPTY_ARRAY, [configDeps]);

export const useGetManagerConfig: typeof useGetManagerConfigDecl = (
  withDefaults?: boolean,
) => useManagerProxy('getManagerConfig', [withDefaults]);

export const useSetCategory: typeof useSetCategoryDecl = (
  categoryId: Id,
  config: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) =>
  useManagerProxy(
    'setCategory',
    [categoryId, config],
    [categoryId],
    [configDeps],
  );

export const useGetCategoryConfig: typeof useGetCategoryConfigDecl = (
  categoryId: Id,
  withDefaults?: boolean,
) => useManagerProxy('getCategoryConfig', [categoryId, withDefaults]);

export const useGetCategoryIds: typeof useGetCategoryIdsDecl = () =>
  useManagerProxy('getCategoryIds');

export const useDelCategory: typeof useDelCategoryDecl = (categoryId: Id) =>
  useManagerProxy('delCategory', [categoryId]);

export const useSetTask: typeof useSetTaskDecl = (
  taskId: Id,
  task: Task,
  taskDeps: DependencyList = EMPTY_ARRAY,
  categoryId?: string,
  config?: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) =>
  useManagerProxy(
    'setTask',
    [taskId, task, categoryId, config],
    [taskId, categoryId],
    [taskDeps, configDeps],
  );

export const useGetTaskConfig: typeof useGetTaskConfigDecl = (
  taskId: Id,
  withDefaults?: boolean,
) => useManagerProxy('getTaskConfig', [taskId, withDefaults]);

export const useGetTaskIds: typeof useGetTaskIdsDecl = () =>
  useManagerProxy('getTaskIds');

export const useDelTask: typeof useDelTaskDecl = (taskId: Id) =>
  useManagerProxy('delTask', [taskId]);

export const useScheduleTaskRun: typeof useScheduleTaskRunDecl = (
  taskId: Id,
  arg?: string,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps: DependencyList = EMPTY_ARRAY,
) =>
  useManagerProxy(
    'scheduleTaskRun',
    [taskId, arg, startAfter, config],
    [taskId, arg, startAfter],
    [configDeps],
  );

export const useGetTaskRunConfig: typeof useGetTaskRunConfigDecl = (
  taskRunId: Id,
  withDefaults?: boolean,
) => useManagerProxy('getTaskRunConfig', [taskRunId, withDefaults]);

export const useGetTaskRunInfo: typeof useGetTaskRunInfoDecl = (
  taskRunId: Id,
) => useManagerProxy('getTaskRunInfo', [taskRunId]);

export const useDelTaskRun: typeof useDelTaskRunDecl = (taskRunId: Id) =>
  useManagerProxy('delTaskRun', [taskRunId]);

export const useGetScheduledTaskRunIds: typeof useGetScheduledTaskRunIdsDecl =
  () => useManagerProxy('getScheduledTaskRunIds');

export const useGetRunningTaskRunIds: typeof useGetRunningTaskRunIdsDecl = () =>
  useManagerProxy('getRunningTaskRunIds');

export const useStart: typeof useStartDecl = () => useManagerProxy('start');

export const useStop: typeof useStopDecl = (force?: boolean) =>
  useManagerProxy('stop', [force]);

export const useGetStatus: typeof useGetStatusDecl = () =>
  useManagerProxy('getStatus');

export const useGetNow: typeof useGetNowDecl = () => useManagerProxy('getNow');
