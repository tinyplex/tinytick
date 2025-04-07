/// ui-react
import {DependencyList, ReactElement} from 'react';
import type {
  DurationMs,
  Id,
  Ids,
  Manager,
  ManagerConfig,
  ManagerConfigWithDefaults,
  ManagerStatus,
  Task,
  TaskRunConfig,
  TaskRunConfigWithDefaults,
  TaskRunInfo,
  TimestampMs,
} from '../index.d.ts';

/// useManager
export function useManager(): Manager | undefined;

/// useSetManagerConfig
export function useSetManagerConfig(
  config: ManagerConfig,
  configDeps?: DependencyList,
): Manager | undefined;
/// useGetManagerConfig
export function useGetManagerConfig<WithDefaults extends boolean>(
  withDefaults?: WithDefaults,
):
  | (WithDefaults extends true ? ManagerConfigWithDefaults : ManagerConfig)
  | undefined;

/// useSetCategory
export function useSetCategory(
  categoryId: Id,
  config: TaskRunConfig,
  configDeps?: DependencyList,
): Manager | undefined;
/// useGetCategoryConfig
export function useGetCategoryConfig<WithDefaults extends boolean>(
  categoryId: Id,
  withDefaults?: WithDefaults,
):
  | (WithDefaults extends true
      ? TaskRunConfigWithDefaults
      : TaskRunConfig | undefined)
  | undefined;
/// useGetCategoryIds
export function useGetCategoryIds(): Ids | undefined;
/// useDelCategory
export function useDelCategory(categoryId: Id): Manager | undefined;

/// useSetTask
export function useSetTask(
  taskId: Id,
  task: Task,
  taskDeps?: DependencyList,
  categoryId?: Id,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): Manager | undefined;
/// useGetTaskConfig
export function useGetTaskConfig<WithDefaults extends boolean>(
  taskId: Id,
  withDefaults?: WithDefaults,
):
  | (WithDefaults extends true
      ? TaskRunConfigWithDefaults
      : TaskRunConfig | undefined)
  | undefined;
/// useGetTaskIds
export function useGetTaskIds(): Ids | undefined;
/// useDelTask
export function useDelTask(taskId: Id): Manager | undefined;

/// useScheduleTaskRun
export function useScheduleTaskRun(
  taskId: Id,
  arg?: string,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): Id | undefined;
/// useGetTaskRunConfig
export function useGetTaskRunConfig<WithDefaults extends boolean>(
  taskRunId: Id,
  withDefaults?: WithDefaults,
):
  | (WithDefaults extends true
      ? TaskRunConfigWithDefaults
      : TaskRunConfig | undefined)
  | undefined;
/// useGetTaskRunInfo
export function useGetTaskRunInfo(taskRunId: Id): TaskRunInfo | undefined;
/// useDelTaskRun
export function useDelTaskRun(taskRunId: Id): Manager | undefined;

/// useGetScheduledTaskRunIds
export function useGetScheduledTaskRunIds(): Ids | undefined;

/// useGetRunningTaskRunIds
export function useGetRunningTaskRunIds(): Ids | undefined;

/// useStart
export function useStart(): Manager | undefined;
/// useStop
export function useStop(force?: boolean): Manager | undefined;
/// useGetStatus
export function useGetStatus(): ManagerStatus | undefined;

/// useGetNow
export function useGetNow(): TimestampMs | undefined;

/// ManagerProviderProps
export type ManagerProviderProps = {
  /// ManagerProviderProps.started
  readonly started?: boolean;
  /// ManagerProviderProps.forceStop
  readonly forceStop?: boolean;
};

/// ManagerProvider
export function ManagerProvider(
  props: ManagerProviderProps & {children: React.ReactNode},
): ReactElement<any, any>;
