import {type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
let log: {[key: string]: any}[];
let tickListenerId1: string;
let tickListenerId2: string;

const task = async () => await pause(5);

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
  beforeEach(() => {
    manager.addScheduledTaskRunIdsListener((manager, changedIds) =>
      log.push({scheduledIds: manager.getScheduledTaskRunIds()}, {changedIds}),
    );
    manager.addRunningTaskRunIdsListener((manager, changedIds) =>
      log.push({runningIds: manager.getRunningTaskRunIds()}, {changedIds}),
    );
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
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
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
      {willTick: 1},
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
      {runningIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {didTick: 1},
      {runningIds: []},
      {changedIds: {[taskRunId]: -1}},
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
      {scheduledIds: [taskRunId2, taskRunId3]},
      {changedIds: {[taskRunId2]: 1}},
      {scheduledIds: [taskRunId1, taskRunId2, taskRunId3]},
      {changedIds: {[taskRunId1]: 1}},
      {willTick: 1},
      {scheduledIds: [taskRunId2, taskRunId3]},
      {changedIds: {[taskRunId1]: -1}},
      {runningIds: [taskRunId1]},
      {changedIds: {[taskRunId1]: 1}},
      {didTick: 1},
      {runningIds: []},
      {changedIds: {[taskRunId1]: -1}},
      {willTick: 2},
      {scheduledIds: [taskRunId3]},
      {changedIds: {[taskRunId2]: -1}},
      {runningIds: [taskRunId2]},
      {changedIds: {[taskRunId2]: 1}},
      {didTick: 2},
      {runningIds: []},
      {changedIds: {[taskRunId2]: -1}},
      {willTick: 3},
      {scheduledIds: []},
      {changedIds: {[taskRunId3]: -1}},
      {runningIds: [taskRunId3]},
      {changedIds: {[taskRunId3]: 1}},
      {didTick: 3},
      {runningIds: []},
      {changedIds: {[taskRunId3]: -1}},
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
      {willTick: 1},
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
      {runningIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {didTick: 1},
      {willTick: 2},
      {runningIds: []},
      {changedIds: {[taskRunId]: -1}},
      {didTick: 2},
      {willTick: 3},
      {didTick: 3},
    ]);
  });

  test('failing run', async () => {
    manager.setTask('task1', async () => {
      await pause(5);
      throw new Error('');
    });
    const taskRunId = manager.scheduleTaskRun('task1')!;

    manager.start();
    await pause(30);

    expect(log).toEqual([
      {scheduledIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {willTick: 1},
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
      {runningIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {didTick: 1},
      {runningIds: []},
      {changedIds: {[taskRunId]: -1}},
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
      {willTick: 1},
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
      {runningIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {didTick: 1},
      {willTick: 2},
      {scheduledIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {runningIds: []},
      {changedIds: {[taskRunId]: -1}},
      {didTick: 2},
      {willTick: 3},
      {scheduledIds: []},
      {changedIds: {[taskRunId]: -1}},
      {runningIds: [taskRunId]},
      {changedIds: {[taskRunId]: 1}},
      {didTick: 3},
      {willTick: 4},
      {runningIds: []},
      {changedIds: {[taskRunId]: -1}},
      {didTick: 4},
      {willTick: 5},
      {didTick: 5},
    ]);
  });
});
