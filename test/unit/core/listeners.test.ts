import {type ChangedIds, type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
let scheduledLog: (string[] | ChangedIds | number)[];
let runningLog: (string[] | ChangedIds | number)[];
let log: (string[] | ChangedIds | number)[];

const task = async () => await pause(5);

const pauseAndMark = async (ms: number) => {
  const start = manager.getNow();
  let running = true;
  let next = 0;
  while (running) {
    const elapsed = manager.getNow() - start;
    if (elapsed >= next) {
      scheduledLog.push(next);
      runningLog.push(next);
      log.push(next);
      next += 10;
    }
    if (elapsed >= ms) {
      running = false;
    }
    await pause(1);
  }
};

beforeEach(() => {
  manager = createManager().setManagerConfig({tickInterval: 20});
  scheduledLog = [];
  runningLog = [];
  log = [];
});

afterEach(() => {
  manager.stop();
});

describe.only('taskRunIds', () => {
  beforeEach(() => {
    manager.addScheduledTaskRunIdsListener((manager, changedIds) =>
      scheduledLog.push(manager.getScheduledTaskRunIds(), changedIds),
    );
    manager.addRunningTaskRunIdsListener((manager, changedIds) =>
      runningLog.push(manager.getRunningTaskRunIds(), changedIds),
    );
  });

  test('scheduled, unscheduled', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1')!;
    manager.delTaskRun(taskRunId!);

    manager.start();
    await pauseAndMark(20);

    expect(scheduledLog).toEqual([
      [taskRunId],
      {[taskRunId]: 1},
      [],
      {[taskRunId]: -1},
      0,
      10,
      20,
    ]);
    expect(runningLog).toEqual([0, 10, 20]);
  });

  test('normal run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1')!;

    manager.start();
    await pauseAndMark(50);

    expect(scheduledLog).toEqual([
      [taskRunId],
      {[taskRunId]: 1},
      0,
      10,
      [],
      {[taskRunId]: -1},
      20,
      30,
      40,
      50,
    ]);
    expect(runningLog).toEqual([
      0,
      10,
      [taskRunId],
      {[taskRunId]: 1},
      20,
      [],
      {[taskRunId]: -1},
      30,
      40,
      50,
    ]);
  });

  test('three normal runs', async () => {
    manager.setTask('task1', task);
    const taskRunId3 = manager.scheduleTaskRun('task1', undefined, 40)!;
    const taskRunId2 = manager.scheduleTaskRun('task1', undefined, 30)!;
    const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 0)!;

    manager.start();
    await pauseAndMark(40);

    expect(scheduledLog).toEqual([
      [taskRunId3],
      {[taskRunId3]: 1},
      [taskRunId2, taskRunId3],
      {[taskRunId2]: 1},
      [taskRunId1, taskRunId2, taskRunId3],
      {[taskRunId1]: 1},
      0,
      10,
      [taskRunId2, taskRunId3],
      {[taskRunId1]: -1},
      20,
      30,
      40,
      [],
      {[taskRunId2]: -1, [taskRunId3]: -1},
    ]);
    expect(runningLog).toEqual([
      0,
      10,
      [taskRunId1],
      {[taskRunId1]: 1},
      20,
      [taskRunId1, taskRunId2, taskRunId3],
      {[taskRunId2]: 1, [taskRunId3]: 1},
      30,
      [taskRunId2, taskRunId3],
      {[taskRunId1]: -1},
      40,
      [taskRunId3],
      {[taskRunId2]: -1},
      [],
      {[taskRunId3]: -1},
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
      [taskRunId],
      {[taskRunId]: 1},
      10,
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
      [taskRunId],
      {[taskRunId]: 1},
      10,
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
      [taskRunId],
      {[taskRunId]: 1},
      10,
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

describe('taskRun', () => {
  beforeEach(() => {
    manager.addTaskRunListener(null, (manager, taskRunId, reason) =>
      log.push([taskRunId, reason]),
    );
  });

  test('scheduled, unscheduled', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1')!;
    manager.delTaskRun(taskRunId!);

    manager.start();
    await pauseAndMark(10, 3);

    expect(log).toEqual([[taskRunId, '0 1'], [taskRunId, '0 -1'], 10, 20, 30]);
  });

  test('normal run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1')!;

    manager.start();
    await pauseAndMark(10, 3);

    expect(log).toEqual([
      [taskRunId, '0 1'],
      10,
      [taskRunId, '1 1'],
      20,
      30,
      [taskRunId, '1 -1'],
    ]);
  });

  test('three normal runs', async () => {
    manager.setTask('task1', task);
    const taskRunId3 = manager.scheduleTaskRun('task1', undefined, 20)!;
    const taskRunId2 = manager.scheduleTaskRun('task1', undefined, 15)!;
    const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 0)!;

    manager.start();
    await pauseAndMark(10, 4);

    expect(log).toEqual([
      [taskRunId3, '0 1'],
      [taskRunId2, '0 1'],
      [taskRunId1, '0 1'],
      10,
      [taskRunId1, '1 1'],
      20,
      [taskRunId2, '1 1'],
      [taskRunId3, '1 1'],
      30,
      [taskRunId1, '1 -1'],
      40,
      [taskRunId2, '1 -1'],
      [taskRunId3, '1 -1'],
    ]);
  });

  test('expiring run', async () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      maxDuration: 5,
    })!;

    manager.start();
    await pauseAndMark(10, 3);

    expect(log).toEqual([
      [taskRunId, '0 1'],
      10,
      [taskRunId, '1 1'],
      20,
      [taskRunId, '1 -1'],
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

    expect(log).toEqual([
      [taskRunId, '0 1'],
      10,
      [taskRunId, '1 1'],
      [taskRunId, '1 -1'],
      20,
      30,
    ]);
  });

  // test('retrying run', async () => {
  //   manager.setTask('task1', task);
  //   const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
  //     maxDuration: 5,
  //     maxRetries: 1,
  //     retryDelay: 10,
  //   })!;

  //   manager.start();
  //   await pauseAndMark(10, 5);

  //   expect(scheduledLog).toEqual([
  //     [taskRunId],
  //     {[taskRunId]: 1},
  //     10,
  //     [],
  //     {[taskRunId]: -1},
  //     20,
  //     [taskRunId],
  //     {[taskRunId]: 1},
  //     30,
  //     [],
  //     {[taskRunId]: -1},
  //     40,
  //     50,
  //   ]);
  //   expect(runningLog).toEqual([
  //     10,
  //     [taskRunId],
  //     {[taskRunId]: 1},
  //     20,
  //     [],
  //     {[taskRunId]: -1},
  //     30,
  //     [taskRunId],
  //     {[taskRunId]: 1},
  //     40,
  //     [],
  //     {[taskRunId]: -1},
  //     50,
  //   ]);
  // });
});
