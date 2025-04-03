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
export function useManager(): Manager;

/// useSetManagerConfig
export function useSetManagerConfig(
  config: ManagerConfig,
  configDeps?: DependencyList,
): Manager;
/// useGetManagerConfig
export function useGetManagerConfig<WithDefaults extends boolean>(
  withDefaults?: WithDefaults,
): WithDefaults extends true ? ManagerConfigWithDefaults : ManagerConfig;

/// useSetCategory
export function useSetCategory(
  categoryId: Id,
  config: TaskRunConfig,
  configDeps?: DependencyList,
): Manager;
/// useGetCategoryConfig
export function useGetCategoryConfig<WithDefaults extends boolean>(
  categoryId: Id,
  withDefaults?: WithDefaults,
): WithDefaults extends true
  ? TaskRunConfigWithDefaults
  : TaskRunConfig | undefined;
/// useGetCategoryIds
export function useGetCategoryIds(): Ids;
/// useDelCategory
export function useDelCategory(categoryId: Id): Manager;

/// useSetTask
export function useSetTask(
  taskId: Id,
  task: Task,
  taskDeps?: DependencyList,
  categoryId?: Id,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): Manager;
/// useGetTaskConfig
export function useGetTaskConfig<WithDefaults extends boolean>(
  taskId: Id,
  withDefaults?: WithDefaults,
): WithDefaults extends true
  ? TaskRunConfigWithDefaults
  : TaskRunConfig | undefined;
/// useGetTaskIds
export function useGetTaskIds(): Ids;
/// useDelTask
export function useDelTask(taskId: Id): Manager;

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
): WithDefaults extends true
  ? TaskRunConfigWithDefaults
  : TaskRunConfig | undefined;
/// useGetTaskRunInfo
export function useGetTaskRunInfo(taskRunId: Id): TaskRunInfo | undefined;
/// useDelTaskRun
export function useDelTaskRun(taskRunId: Id): Manager;

/// useGetScheduledTaskRunIds
export function useGetScheduledTaskRunIds(): Ids;

/// useGetRunningTaskRunIds
export function useGetRunningTaskRunIds(): Ids;

/// useStart
export function useStart(): Manager;
/// useStop
export function useStop(force?: boolean): Manager;
/// useGetStatus
export function useGetStatus(): ManagerStatus;

/// useGetNow
export function useGetNow(): TimestampMs;

/// ManagerProviderProps
export type ManagerProviderProps = {
  /// ManagerProviderProps.started
  readonly started?: boolean;
};

/// ManagerProvider
export function ManagerProvider(
  props: ManagerProviderProps & {children: React.ReactNode},
): ReactElement<any, any>;
