import {type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;

const until = (test: () => boolean, min: number, max: number): Promise<void> =>
  new Promise<void>((resolve) => {
    const from = manager.getNow();
    const interval = setInterval(() => {
      if (test()) {
        clearInterval(interval);
        const time = manager.getNow() - from;
        expect(time).toBeGreaterThanOrEqual(min);
        expect(time).toBeLessThanOrEqual(max);
        resolve();
      }
    }, 5);
  });

beforeEach(() => {
  manager = createManager();
});

afterEach(() => manager.stop());

describe('ticks', () => {
  beforeEach(() => manager.setManagerConfig({tickInterval: 10}));

  test('start & stop', async () => {
    let ticks = 0;
    manager.setTask('task1', async () => ticks++);
    expect(ticks).toBe(0);
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(ticks).toBe(0);
    expect(manager.getStatus()).toEqual(0);
    manager.start();
    expect(manager.getStatus()).toEqual(1);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    expect(ticks).toBe(0);
    await pause(10);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(ticks).toBe(1);
    manager.stop();
    expect(manager.getStatus()).toEqual(2);
    await pause(10);
    expect(ticks).toBe(1);
    expect(manager.getStatus()).toEqual(0);
  });

  test('start & stop with outstanding schedule', async () => {
    let ticks = 0;
    manager.setTask('task1', async () => ticks++);
    expect(ticks).toBe(0);
    const taskRunId1 = manager.scheduleTaskRun('task1', '', 0);
    const taskRunId2 = manager.scheduleTaskRun('task1', '', 15);
    expect(ticks).toBe(0);
    expect(manager.getStatus()).toEqual(0);
    manager.start();
    expect(manager.getStatus()).toEqual(1);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId1, taskRunId2]);
    expect(ticks).toBe(0);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId2]);
    expect(ticks).toBe(1);
    manager.stop();
    expect(manager.getStatus()).toEqual(2);
    await pause(20);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(ticks).toBe(2);
    expect(manager.getStatus()).toEqual(0);
  });

  test('start & stop with outstanding schedule, forced', async () => {
    let ticks = 0;
    manager.setTask('task1', async () => ticks++);
    expect(ticks).toBe(0);
    const taskRunId1 = manager.scheduleTaskRun('task1', '', 0);
    const taskRunId2 = manager.scheduleTaskRun('task1', '', 15);
    expect(ticks).toBe(0);
    expect(manager.getStatus()).toEqual(0);
    manager.start();
    expect(manager.getStatus()).toEqual(1);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId1, taskRunId2]);
    expect(ticks).toBe(0);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId2]);
    expect(ticks).toBe(1);
    manager.stop(true);
    expect(manager.getStatus()).toEqual(0);
    await pause(20);
    expect(ticks).toBe(1);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId2]);
  });

  test('stop, fail new schedule', async () => {
    manager.setTask('task1', async () => {});
    const taskRunId1 = manager.scheduleTaskRun('task1', '', 10);
    expect(manager.getStatus()).toEqual(0);
    manager.start();
    expect(manager.getStatus()).toEqual(1);
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId1]);
    manager.stop();
    expect(manager.getStatus()).toEqual(2);
    const taskRunId2 = manager.scheduleTaskRun('task1', '', 20);
    expect(taskRunId2).toBeUndefined();
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId1]);
  });

  test('started once, succeeds', async () => {
    manager.setTask('task1', async () => await pause(25));
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    manager.start();
    await pause(5);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    manager.stop();
  });

  test('started once, succeeds, repeats', async () => {
    manager.setTask('task1', async () => await pause(25));
    const taskRunId = manager.scheduleTaskRun('task1', undefined, 0, {
      repeatDelay: 20,
    });
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    manager.start();
    await pause(5);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getScheduledTaskRunIds().length).toEqual(0);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getScheduledTaskRunIds().length).toEqual(0);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    expect(manager.getScheduledTaskRunIds().length).toEqual(1);
    expect(manager.getRunningTaskRunIds().length).toEqual(0);
    await pause(10);
    expect(manager.getScheduledTaskRunIds().length).toEqual(1);
    expect(manager.getRunningTaskRunIds().length).toEqual(0);
    await pause(20);
    expect(manager.getScheduledTaskRunIds().length).toEqual(0);
    expect(manager.getRunningTaskRunIds().length).toEqual(1);
    await pause(30);
    expect(manager.getScheduledTaskRunIds().length).toEqual(1);
    expect(manager.getRunningTaskRunIds().length).toEqual(0);
    manager.stop();
  });

  describe('await completion', () => {
    test('succeeds', async () => {
      let ticks = 0;
      let ran = 0;
      manager.setTask('task1', async () => {
        await pause(25);
        ran++;
      });
      manager.addWillTickListener(() => ticks++);
      const taskRunId = manager.scheduleTaskRun('task1')!;
      manager.start();
      await manager.untilTaskRunDone(taskRunId);
      expect(ran).toEqual(1);
      expect(ticks).toEqual(3);
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      manager.stop();
    });

    test('fails', async () => {
      let ticks = 0;
      let ran = 0;
      manager.setTask('task1', async () => {
        await pause(25);
        ran++;
        throw new Error('test');
      });
      manager.addWillTickListener(() => ticks++);
      const taskRunId = manager.scheduleTaskRun('task1')!;
      manager.start();
      await manager.untilTaskRunDone(taskRunId);
      expect(ran).toEqual(1);
      expect(ticks).toEqual(3);
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      manager.stop();
    });

    test('retries', async () => {
      let ticks = 0;
      let ran = 0;
      manager.setTask(
        'task1',
        async () => {
          await pause(25);
          ran++;
          throw new Error('test');
        },
        '',
        {maxRetries: 3, retryDelay: 10},
      );
      manager.addWillTickListener(() => ticks++);
      const taskRunId = manager.scheduleTaskRun('task1')!;
      manager.start();
      await manager.untilTaskRunDone(taskRunId);
      expect(ran).toEqual(4);
      expect(ticks).toEqual(15);
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      manager.stop();
    });

    test('deleted', async () => {
      let ticks = 0;
      let ran = 0;
      manager.setTask('taskToDel', async () => ran++, '');
      manager.addWillTickListener(() => ticks++);
      const taskRunId = manager.scheduleTaskRun('taskToDel', '', 1000)!;
      manager.start();
      setTimeout(() => manager.delTaskRun(taskRunId), 30);
      await manager.untilTaskRunDone(taskRunId);
      expect(ran).toEqual(0);
      expect(ticks).toEqual(2);
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      manager.stop();
    });
  });

  test('cancelled, signal', async () => {
    let aborted = false;
    manager.setTask('task1', async (_, signal) => {
      signal.addEventListener('abort', () => (aborted = true));
      await pause(25);
    });
    const taskRunId = manager.scheduleTaskRun('task1')!;
    manager.start();
    await pause(15);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(aborted).toEqual(false);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    manager.delTaskRun(taskRunId);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    expect(aborted).toEqual(true);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    manager.stop();
  });

  test('over runs, no retry', async () => {
    manager.setTask('task1', async () => await pause(100));
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 1,
      maxRetries: 0,
    });
    manager.start();
    await pause(15);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toBeUndefined();
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    manager.stop();
  });

  test('over runs, one retry', async () => {
    let taskStarts = 0;
    manager.setTask('task1', async () => {
      taskStarts++;
      await pause(1000);
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 1,
      maxRetries: 1,
      retryDelay: 10,
    });
    manager.start();
    await until(() => taskStarts == 1, 0, 20);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(0);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    expect(manager.getRunningTaskRunIds()).toEqual([]);

    await until(() => taskStarts == 2, 0, 20);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toBeUndefined();
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    manager.stop();
  });

  test('over runs, complex retries 1', async () => {
    let taskStarts = 0;
    manager.setTask('task1', async () => {
      taskStarts++;
      await pause(200);
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 1,
      maxRetries: 2,
      retryDelay: '50,100,150',
    });
    manager.start();
    await until(() => taskStarts == 1, 0, 20);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(0);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await until(() => taskStarts == 2, 40, 60);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(2);

    await until(() => taskStarts == 3, 90, 110);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(2);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    manager.stop();
  });

  test('over runs, complex retries 2', async () => {
    let taskStarts = 0;
    manager.setTask('task1', async () => {
      taskStarts++;
      await pause(200);
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 1,
      maxRetries: 4,
      retryDelay: '50,100,50',
    });
    manager.start();
    await until(() => taskStarts == 1, 0, 20);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(0);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await until(() => taskStarts == 2, 40, 60);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(2);

    await until(() => taskStarts == 3, 90, 110);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(2);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(3);

    await until(() => taskStarts == 4, 40, 60);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(3);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(4);

    await until(() => taskStarts == 5, 40, 60);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(4);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    manager.stop();
  });

  test('over runs, signal', async () => {
    let aborted = false;
    manager.setTask('task1', async (_, signal) => {
      signal.addEventListener('abort', () => (aborted = true));
      await pause(100);
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 15,
      maxRetries: 0,
    });
    manager.start();
    await pause(15);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(aborted).toEqual(false);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(aborted).toEqual(false);
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    expect(aborted).toEqual(true);
    manager.stop();
  });

  test('throws exception', async () => {
    manager.setTask('task1', async () => {
      await pause(10);
      throw new Error('test');
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxRetries: 0,
    });
    manager.start();
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(0);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    manager.stop();
  });

  test('throws exception, retry', async () => {
    manager.setTask('task1', async () => {
      await pause(10);
      throw new Error('test');
    });
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxRetries: 1,
      retryDelay: 10,
    });
    manager.start();
    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(0);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(false);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toEqual(true);
    expect(manager.getTaskRunInfo(taskRunId!)?.retry).toEqual(1);

    await pause(10);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    manager.stop();
  });

  test('ignore invalid scheduled task', async () => {
    manager.setTask('task1', async () => {});
    const taskRunId = manager.scheduleTaskRun('task2');
    expect(manager.getTaskRunInfo(taskRunId!)).not.toEqual({});
    manager.start();
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    await pause(15);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    manager.stop();
  });

  test('run once', async () => {
    let ticks = 0;
    manager.setTask('task1', async () => ticks++);
    manager.scheduleTaskRun('task1');
    manager.start();
    await pause(15);
    expect(ticks).toBe(1);
    await pause(10);
    expect(ticks).toBe(1);
    manager.stop();
  });

  test('run in right order', async () => {
    manager.setManagerConfig({tickInterval: 50});
    const runs: string[] = [];
    manager.setTask('task1', async () => {
      runs.push('task1');
      await pause(200);
    });
    manager.setTask('task2', async () => {
      runs.push('task2');
      await pause(200);
    });
    manager.setTask('task3', async () => {
      runs.push('task3');
      await pause(200);
    });
    manager.setTask('task4', async () => {
      runs.push('task4');
      await pause(200);
    });
    const taskRunId2 = manager.scheduleTaskRun('task2', undefined, 75);
    const taskRunId4 = manager.scheduleTaskRun('task4', undefined, 175);
    const taskRunId3 = manager.scheduleTaskRun('task3', undefined, 125);
    const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 25);
    manager.start();
    await pause(25);
    expect(manager.getScheduledTaskRunIds()).toEqual([
      taskRunId1,
      taskRunId2,
      taskRunId3,
      taskRunId4,
    ]);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    await pause(50);
    expect(manager.getScheduledTaskRunIds()).toEqual([
      taskRunId2,
      taskRunId3,
      taskRunId4,
    ]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId1]);
    await pause(50);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId3, taskRunId4]);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId1, taskRunId2]);
    await pause(50);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId4]);
    expect(manager.getRunningTaskRunIds()).toEqual([
      taskRunId1,
      taskRunId2,
      taskRunId3,
    ]);
    await pause(50);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(manager.getRunningTaskRunIds()).toEqual([
      taskRunId1,
      taskRunId2,
      taskRunId3,
      taskRunId4,
    ]);
    expect(runs).toEqual(['task1', 'task2', 'task3', 'task4']);
    await pause(50);
    expect(manager.getRunningTaskRunIds()).toEqual([
      taskRunId2,
      taskRunId3,
      taskRunId4,
    ]);
    await pause(50);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId3, taskRunId4]);
    await pause(50);
    expect(manager.getRunningTaskRunIds()).toEqual([taskRunId4]);
    await pause(50);
    expect(manager.getRunningTaskRunIds()).toEqual([]);
    manager.stop();
  });
});
