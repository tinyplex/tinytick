import {DependencyList, useContext, useMemo} from 'react';
import type {
  DurationMs,
  Id,
  Task,
  TaskRunConfig,
  TimestampMs,
} from '../@types/index.d.ts';
import {Context} from './context.ts';

export const useManager = () => useContext(Context);

export const useSetTask = (
  taskId: Id,
  task: Task,
  taskDeps: DependencyList = [],
  categoryId?: string,
  config?: TaskRunConfig,
  configDeps: DependencyList = [],
) => {
  const manager = useManager();
  useMemo(
    () => manager?.setTask(taskId, task, categoryId, config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager, taskId, ...taskDeps, categoryId, ...configDeps],
  );
};

export const useScheduleTaskRun = (
  taskId: Id,
  arg?: string,
  startAfter?: TimestampMs | DurationMs,
  config?: TaskRunConfig,
  configDeps: DependencyList = [],
) => {
  const manager = useManager();
  return useMemo(
    () => manager?.scheduleTaskRun(taskId, arg, startAfter, config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager, taskId, arg, startAfter, ...configDeps],
  );
};
