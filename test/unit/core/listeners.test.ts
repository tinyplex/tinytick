import {type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
let scheduledLog: (string[] | number)[];
let runningLog: (string[] | number)[];

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
  manager.addScheduledTaskRunIdsListener((manager) =>
    scheduledLog.push(manager.getScheduledTaskRunIds()),
  );
  manager.addRunningTaskRunIdsListener((manager) =>
    runningLog.push(manager.getRunningTaskRunIds()),
  );
});

afterEach(() => manager.stop());

describe('taskRunIdsListener', () => {
  test('normal run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([10, [taskRunId], [], 20, 30]);
    expect(runningLog).toEqual([10, [taskRunId], 20, 30, []]);
  });

  test('two normal runs', async () => {
    manager.setTask('task1', task);
    const taskRunId2 = manager.scheduleTaskRun('task1', undefined, 20);
    const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 0);

    manager.start();
    await pauseAndMark(10, 4);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId1, taskRunId2],
      [taskRunId2],
      20,
      [],
      30,
      40,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId1],
      20,
      [taskRunId1, taskRunId2],
      30,
      [taskRunId2],
      40,
      [],
    ]);
  });

  test('failing run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      maxDuration: 5,
    });

    manager.start();
    await pauseAndMark(10, 3);

    expect(scheduledLog).toEqual([10, [taskRunId], [], 20, 30]);
    expect(runningLog).toEqual([10, [taskRunId], 20, [], 30]);
  });

  test('retrying run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      maxDuration: 5,
      maxRetries: 1,
      retryDelay: 10,
    });

    manager.start();
    await pauseAndMark(10, 5);

    expect(scheduledLog).toEqual([
      10,
      [taskRunId],
      [],
      20,
      [taskRunId],
      30,
      [],
      40,
      50,
    ]);
    expect(runningLog).toEqual([
      10,
      [taskRunId],
      20,
      [],
      30,
      [taskRunId],
      40,
      [],
      50,
    ]);
  });
});
