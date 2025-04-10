import {type ChangedIds, type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
let scheduledLog: (string[] | ChangedIds | number)[];
let runningLog: (string[] | ChangedIds | number)[];

const task = async () => await pause(15);

const pauseAndMark = async (ms: number, times: number) => {
  for (let time = 1; time <= times; time++) {
    scheduledLog.push(ms * time);
    runningLog.push(ms * time);
    await pause(ms);
  }
};

beforeEach(() => {
  manager = createManager().setManagerConfig({tickInterval: 10});
  scheduledLog = [];
  runningLog = [];
  manager.addScheduledTaskRunIdsListener((manager, changedIds) =>
    scheduledLog.push(manager.getScheduledTaskRunIds(), changedIds),
  );
  manager.addRunningTaskRunIdsListener((manager, changedIds) =>
    runningLog.push(manager.getRunningTaskRunIds(), changedIds),
  );
});

afterEach(() => manager.stop());

describe('taskRunIds', () => {
  test('scheduled, unscheduled', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');
    manager.delTaskRun(taskRunId!);

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([10, 20, 30]);
    expect(runningLog).toEqual([10, 20, 30]);
  });

  test('normal run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1')!;

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      [],
      {[taskRunId]: -1},
      20,
      30,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      20,
      30,
      [],
      {[taskRunId]: -1},
    ]);
  });

  test('two normal runs', async () => {
    manager.setTask('task1', task);
    const taskRunId2 = manager.scheduleTaskRun('task1', undefined, 20)!;
    const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 0)!;

    manager.start();
    await pauseAndMark(10, 4);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId1, taskRunId2],
      {[taskRunId1]: 1, [taskRunId2]: 1},
      [taskRunId2],
      {[taskRunId1]: -1},
      20,
      [],
      {[taskRunId2]: -1},
      30,
      40,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId1],
      {[taskRunId1]: 1},
      20,
      [taskRunId1, taskRunId2],
      {[taskRunId2]: 1},
      30,
      [taskRunId2],
      {[taskRunId1]: -1},
      40,
      [],
      {[taskRunId2]: -1},
    ]);
  });

  test('expiring run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      maxDuration: 5,
    })!;

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      [],
      {[taskRunId]: -1},
      20,
      30,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      20,
      [],
      {[taskRunId]: -1},
      30,
    ]);
  });

  test('failing run', async () => {
    manager.setTask('task1', async () => {
      await pause(5);
      throw new Error('');
    });
    const taskRunId = manager.scheduleTaskRun('task1')!;

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      [],
      {[taskRunId]: -1},
      20,
      30,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      20,
      [],
      {[taskRunId]: -1},
      30,
    ]);
  });

  test('retrying run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      maxDuration: 5,
      maxRetries: 1,
      retryDelay: 10,
    })!;

    manager.start();
    await pauseAndMark(10, 5);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      [],
      {[taskRunId]: -1},
      20,
      [taskRunId],
      {[taskRunId]: 1},
      30,
      [],
      {[taskRunId]: -1},
      40,
      50,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId],
      {[taskRunId]: 1},
      20,
      [],
      {[taskRunId]: -1},
      30,
      [taskRunId],
      {[taskRunId]: 1},
      40,
      [],
      {[taskRunId]: -1},
      50,
    ]);
  });
});
