import {type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
let log: {[key: string]: any}[];
let tickListenerId1: string;
let tickListenerId2: string;

const task = async () => await pause(5);

describe('ticked sequences', () => {
  beforeEach(() => {
    manager = createManager().setManagerConfig({tickInterval: 10});
    log = [];
    let willTick = 0;
    let didTick = 0;
    tickListenerId1 = manager.addWillTickListener(() =>
      log.push({willTick: ++willTick}),
    );
    tickListenerId2 = manager.addDidTickListener(() =>
      log.push({didTick: ++didTick}),
    );
  });

  afterEach(() => {
    manager.stop();
    manager.delListener(tickListenerId1);
    manager.delListener(tickListenerId2);
  });

  test('manager status', async () => {
    manager.addStatusListener((manager, status) =>
      log.push({status: [manager.getStatus(), status]}),
    );
    manager.start();
    manager.stop();
    await pause(40);
    manager.start();
    manager.stop(true);
    expect(log).toEqual([
      {status: [1, 1]},
      {status: [2, 2]},
      {willTick: 1},
      {didTick: 1},
      {status: [0, 0]},
      {status: [1, 1]},
      {status: [0, 0]},
    ]);
  });

  describe('ticks', () => {
    test('no ticks', async () => {
      await pause(40);
      expect(log).toEqual([]);
    });

    test('ticks', async () => {
      manager.start();
      await pause(30);
      expect(log).toEqual([
        {willTick: 1},
        {didTick: 1},
        {willTick: 2},
        {didTick: 2},
      ]);
    });
  });

  describe('common sequences', () => {
    let scheduledTaskRunIdsListenerId: string;
    let runningTaskRunIdsListenerId: string;
    let taskRunListenerId: string;
    let taskRunFailedListenerId: string;

    beforeEach(() => {
      scheduledTaskRunIdsListenerId = manager.addScheduledTaskRunIdsListener(
        (manager, changedIds) =>
          log.push(
            {scheduledIds: manager.getScheduledTaskRunIds()},
            {changedIds},
          ),
      );
      runningTaskRunIdsListenerId = manager.addRunningTaskRunIdsListener(
        (manager, changedIds) =>
          log.push({runningIds: manager.getRunningTaskRunIds()}, {changedIds}),
      );
      taskRunListenerId = manager.addTaskRunListener(
        null,
        null,
        (_manager, taskId, taskRunId, running, reason) =>
          log.push({taskRun: [taskId, taskRunId, running, reason]}),
      );
      taskRunFailedListenerId = manager.addTaskRunFailedListener(
        null,
        null,
        (_manager, taskId, taskRunId, reason, message) =>
          log.push({taskRunFailed: [taskId, taskRunId, reason, message]}),
      );
    });

    afterEach(() => {
      manager.delListener(scheduledTaskRunIdsListenerId);
      manager.delListener(runningTaskRunIdsListenerId);
      manager.delListener(taskRunListenerId);
      manager.delListener(taskRunFailedListenerId);
    });

    test('scheduled, unscheduled', async () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1')!;
      manager.delTaskRun(taskRunId!);

      manager.start();
      await pause(20);

      expect(log).toEqual([
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, false, 0]},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, undefined, 5]},
        {willTick: 1},
        {didTick: 1},
      ]);
    });

    test('normal run', async () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1')!;

      manager.start();
      await pause(30);

      expect(log).toEqual([
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, false, 0]},
        {willTick: 1},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {runningIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, true, 1]},
        {didTick: 1},
        {runningIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, undefined, 2]},
        {willTick: 2},
        {didTick: 2},
      ]);
    });

    test('three normal runs', async () => {
      manager.setTask('task1', task);
      const taskRunId3 = manager.scheduleTaskRun('task1', undefined, 30)!;
      const taskRunId2 = manager.scheduleTaskRun('task1', undefined, 15)!;
      const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 0)!;

      manager.start();
      await pause(50);

      expect(log).toEqual([
        {scheduledIds: [taskRunId3]},
        {changedIds: {[taskRunId3]: 1}},
        {taskRun: ['task1', taskRunId3, false, 0]},
        {scheduledIds: [taskRunId2, taskRunId3]},
        {changedIds: {[taskRunId2]: 1}},
        {taskRun: ['task1', taskRunId2, false, 0]},
        {scheduledIds: [taskRunId1, taskRunId2, taskRunId3]},
        {changedIds: {[taskRunId1]: 1}},
        {taskRun: ['task1', taskRunId1, false, 0]},
        {willTick: 1},
        {scheduledIds: [taskRunId2, taskRunId3]},
        {changedIds: {[taskRunId1]: -1}},
        {runningIds: [taskRunId1]},
        {changedIds: {[taskRunId1]: 1}},
        {taskRun: ['task1', taskRunId1, true, 1]},
        {didTick: 1},
        {runningIds: []},
        {changedIds: {[taskRunId1]: -1}},
        {taskRun: ['task1', taskRunId1, undefined, 2]},
        {willTick: 2},
        {scheduledIds: [taskRunId3]},
        {changedIds: {[taskRunId2]: -1}},
        {runningIds: [taskRunId2]},
        {changedIds: {[taskRunId2]: 1}},
        {taskRun: ['task1', taskRunId2, true, 1]},
        {didTick: 2},
        {runningIds: []},
        {changedIds: {[taskRunId2]: -1}},
        {taskRun: ['task1', taskRunId2, undefined, 2]},
        {willTick: 3},
        {scheduledIds: []},
        {changedIds: {[taskRunId3]: -1}},
        {runningIds: [taskRunId3]},
        {changedIds: {[taskRunId3]: 1}},
        {taskRun: ['task1', taskRunId3, true, 1]},
        {didTick: 3},
        {runningIds: []},
        {changedIds: {[taskRunId3]: -1}},
        {taskRun: ['task1', taskRunId3, undefined, 2]},
        {willTick: 4},
        {didTick: 4},
      ]);
    });

    test('expiring run', async () => {
      manager.setTask('task1', async () => await pause(50));
      const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
        maxDuration: 1,
      })!;

      manager.start();
      await pause(40);

      expect(log).toEqual([
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, false, 0]},
        {willTick: 1},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {runningIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, true, 1]},
        {didTick: 1},
        {willTick: 2},
        {runningIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, undefined, 3]},
        {taskRunFailed: ['task1', taskRunId, 3, '']},
        {didTick: 2},
        {willTick: 3},
        {didTick: 3},
      ]);
    });

    test('failing run', async () => {
      manager.setTask('task1', async () => {
        await pause(5);
        throw new Error('broken');
      });
      const taskRunId = manager.scheduleTaskRun('task1')!;

      manager.start();
      await pause(30);

      expect(log).toEqual([
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, false, 0]},
        {willTick: 1},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {runningIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, true, 1]},
        {didTick: 1},
        {runningIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, undefined, 4]},
        {taskRunFailed: ['task1', taskRunId, 4, 'broken']},
        {willTick: 2},
        {didTick: 2},
      ]);
    });

    test('retrying run', async () => {
      manager.setTask('task1', async () => await pause(50));
      const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
        maxDuration: 1,
        maxRetries: 1,
        retryDelay: 10,
      })!;

      manager.start();
      await pause(60);

      expect(log).toEqual([
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, false, 0]},
        {willTick: 1},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {runningIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, true, 1]},
        {didTick: 1},
        {willTick: 2},
        {scheduledIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {runningIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, false, 3]},
        {taskRunFailed: ['task1', taskRunId, 3, '']},
        {didTick: 2},
        {willTick: 3},
        {scheduledIds: []},
        {changedIds: {[taskRunId]: -1}},
        {runningIds: [taskRunId]},
        {changedIds: {[taskRunId]: 1}},
        {taskRun: ['task1', taskRunId, true, 1]},
        {didTick: 3},
        {willTick: 4},
        {runningIds: []},
        {changedIds: {[taskRunId]: -1}},
        {taskRun: ['task1', taskRunId, undefined, 3]},
        {taskRunFailed: ['task1', taskRunId, 3, '']},
        {didTick: 4},
        {willTick: 5},
        {didTick: 5},
      ]);
    });
  });

  test('failing runs, selective listeners', async () => {
    manager.setTask('task1', async () => {
      await pause(5);
      throw new Error('broken1');
    });
    manager.setTask('task2', async () => {
      await pause(5);
      throw new Error('broken2');
    });

    const taskRunListenerId1 = manager.addTaskRunListener(
      'task1',
      null,
      (_manager, taskId, taskRunId, running, reason) =>
        log.push({task1: [taskId, taskRunId, running, reason]}),
    );
    const taskRunFailedListenerId1 = manager.addTaskRunFailedListener(
      'task1',
      null,
      (_manager, taskId, taskRunId, reason, message) =>
        log.push({task1Failed: [taskId, taskRunId, reason, message]}),
    );

    const taskRunId1 = manager.scheduleTaskRun('task1')!;
    const taskRunId2 = manager.scheduleTaskRun('task2')!;
    manager.scheduleTaskRun('task2')!;

    const taskRunListenerId2 = manager.addTaskRunListener(
      null,
      taskRunId2,
      (_manager, taskId, taskRunId, running, reason) =>
        log.push({taskRun2: [taskId, taskRunId, running, reason]}),
    );
    const taskRunFailedListenerId2 = manager.addTaskRunFailedListener(
      null,
      taskRunId2,
      (_manager, taskId, taskRunId, reason, message) =>
        log.push({taskRun2Failed: [taskId, taskRunId, reason, message]}),
    );

    manager.start();
    await pause(30);

    expect(log).toEqual([
      {task1: ['task1', taskRunId1, false, 0]},
      {willTick: 1},
      {task1: ['task1', taskRunId1, true, 1]},
      {taskRun2: ['task2', taskRunId2, true, 1]},
      {didTick: 1},
      {task1: ['task1', taskRunId1, undefined, 4]},
      {task1Failed: ['task1', taskRunId1, 4, 'broken1']},
      {taskRun2: ['task2', taskRunId2, undefined, 4]},
      {taskRun2Failed: ['task2', taskRunId2, 4, 'broken2']},
      {willTick: 2},
      {didTick: 2},
    ]);

    manager.delListener(taskRunListenerId1);
    manager.delListener(taskRunFailedListenerId1);
    manager.delListener(taskRunListenerId2);
    manager.delListener(taskRunFailedListenerId2);
  });
});

test('fills listenerId pool', () => {
  const manager = createManager();
  for (let i = 0; i < 1100; i++) {
    manager.addWillTickListener(() => 0);
  }
  expect(manager.addWillTickListener(() => 0)).toEqual('1100');
  for (let i = 0; i < 1100; i++) {
    manager.delListener(i.toString());
  }
  expect(manager.addWillTickListener(() => 0)).toEqual('0');
  expect(manager.addWillTickListener(() => 0)).toEqual('1');
  for (let i = 0; i < 998; i++) {
    manager.addWillTickListener(() => 0);
  }
  expect(manager.addWillTickListener(() => 0)).toEqual('1101');

  manager.delListener('555');
  manager.delListener('666');
  expect(manager.addWillTickListener(() => 0)).toEqual('555');
  expect(manager.addWillTickListener(() => 0)).toEqual('666');
});
