/// ui-react
import {DependencyList, ReactElement} from 'react';
import type {
  DurationMs,
  Id,
  Ids,
  Manager,
  ManagerStatus,
  Task,
  TaskRunConfig,
  TimestampMs,
} from '../index.d.ts';

/// useCreateManager
export function useCreateManager(
  create: () => Manager,
  createDeps?: React.DependencyList,
): Manager;

/// useManager
export function useManager(): Manager | undefined;

/// useStatus
export function useStatus(): ManagerStatus | undefined;

/// useScheduledTaskRunIds
export function useScheduledTaskRunIds(): Ids | undefined;

/// useRunningTaskRunIds
export function useRunningTaskRunIds(): Ids | undefined;

/// useTaskRunRunning
export function useTaskRunRunning(taskRunId: Id): boolean;

/// useStartCallback
export function useStartCallback(): () => Manager | undefined;

/// useStopCallback
export function useStopCallback(force?: boolean): () => Manager | undefined;

/// useSetTask
export function useSetTask(
  taskId: Id,
  task: Task,
  taskDeps?: DependencyList,
  categoryId?: Id,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): void;

/// useScheduleTaskRun
export function useScheduleTaskRun(
  taskId: Id,
  arg?: string,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): Id | undefined;

/// useScheduleTaskRun.2
export function useScheduleTaskRun(
  args: {
    taskId: Id;
    arg?: string;
    startAfter?: TimestampMs | DurationMs;
    config?: TaskRunConfig;
  },
  configDeps?: DependencyList,
): Id | undefined;

/// useScheduleTaskRunCallback
export function useScheduleTaskRunCallback(
  taskId: Id,
  arg?: string,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps?: DependencyList,
): () => Id | undefined;

/// useScheduleTaskRunCallback.2
export function useScheduleTaskRunCallback(
  args: {
    taskId: Id;
    arg?: string;
    startAfter?: TimestampMs | DurationMs;
    config?: TaskRunConfig;
  },
  configDeps?: DependencyList,
): () => Id | undefined;

/// ProviderProps
export type ProviderProps = {
  /// ProviderProps.manager
  readonly manager?: Manager;
};

/// Provider
export function Provider(
  props: ProviderProps & {children: React.ReactNode},
): ReactElement<any, any>;
