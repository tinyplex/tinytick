import {type Manager, createManager} from 'tinytick';

let manager: Manager;
const task = async () => {};

const pause = async (ms = 5): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  manager = createManager();
});

afterEach(() => manager.stop());

describe('manager', () => {
  test('create', () => {
    expect(manager).not.toBeUndefined();
  });

  describe('setManagerConfig', () => {
    test('basic', () => {
      manager.setManagerConfig({tickInterval: 500});
      expect(manager.getManagerConfig()).toEqual({tickInterval: 500});
    });

    test('invalid object', () => {
      // @ts-expect-error not an object
      manager.setManagerConfig([]);
      expect(manager.getManagerConfig()).toEqual({});
    });

    test('invalid property', () => {
      // @ts-expect-error property does not exist
      manager.setManagerConfig({invalid: 5});
      expect(manager.getManagerConfig()).toEqual({});
    });

    test('invalid tickInterval', () => {
      manager.setManagerConfig({tickInterval: -5});
      expect(manager.getManagerConfig()).toEqual({});
      // @ts-expect-error property is numeric
      manager.setManagerConfig({tickInterval: 'five'});
      expect(manager.getManagerConfig()).toEqual({});
    });
  });

  describe('getManagerConfig', () => {
    test('immutable', () => {
      manager.setManagerConfig({tickInterval: 500});
      const config = manager.getManagerConfig();
      if (config) {
        // @ts-expect-error property is read-only
        config.tickInterval = 10;
      }
      expect(manager.getManagerConfig()).toEqual({tickInterval: 500});
    });
  });

  test('fluent methods', () => {
    expect(manager.setManagerConfig({tickInterval: 500})).toBe(manager);
    expect(manager.setCategory('', {maxDuration: 5000})).toBe(manager);
    expect(manager.delCategory('')).toBe(manager);
    expect(manager.setTask('', task, '', {maxDuration: 5000})).toBe(manager);
    expect(manager.delTask('')).toBe(manager);
    expect(manager.delTaskRun('')).toBe(manager);
    expect(manager.start()).toBe(manager);
    expect(manager.stop()).toBe(manager);
  });
});

describe('category', () => {
  describe('setCategory', () => {
    test('basic', () => {
      manager.setCategory('category1', {maxDuration: 5000});
      expect(manager.getCategoryIds()).toEqual(['category1']);
    });

    test('invalid object', () => {
      // @ts-expect-error not an object
      manager.setCategory('category1', []);
      expect(manager.getCategoryConfig('category1')).toEqual({});
    });

    test('invalid property', () => {
      // @ts-expect-error property does not exist
      manager.setCategory('category1', {invalid: 5000});
      expect(manager.getCategoryConfig('category1')).toEqual({});
    });

    test('invalid maxDuration', () => {
      manager.setCategory('category1', {maxDuration: -5000});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setCategory('category1', {maxDuration: 'five'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
    });

    test('invalid maxRetries', () => {
      manager.setCategory('category1', {maxRetries: -5000});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setCategory('category1', {maxRetries: 'five'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
    });

    test('invalid retryDelay', () => {
      manager.setCategory('category1', {retryDelay: -5000});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setCategory('category1', {retryDelay: false});
      expect(manager.getCategoryConfig('category1')).toEqual({});

      manager.setCategory('category1', {retryDelay: ','});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      manager.setCategory('category1', {retryDelay: '5,'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      manager.setCategory('category1', {retryDelay: ',5'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      manager.setCategory('category1', {retryDelay: ''});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      manager.setCategory('category1', {retryDelay: 'a,5'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
      manager.setCategory('category1', {retryDelay: '5.5.5'});
      expect(manager.getCategoryConfig('category1')).toEqual({});
    });
  });

  describe('getCategoryConfig', () => {
    test('no defaults', () => {
      manager.setCategory('category1', {maxDuration: 5000});
      expect(manager.getCategoryConfig('category1')).toEqual({
        maxDuration: 5000,
      });
    });

    test('with defaults', () => {
      manager.setCategory('category1', {maxDuration: 5000});
      expect(manager.getCategoryConfig('category1', true)).toEqual({
        maxDuration: 5000,
        maxRetries: 2,
        retryDelay: 3000,
      });
    });

    test('invalid category', () => {
      expect(manager.getCategoryConfig('category1')).toBeUndefined();
    });

    test('immutable', () => {
      manager.setCategory('category1', {maxDuration: 5000});
      const config = manager.getCategoryConfig('category1');
      if (config) {
        // @ts-expect-error property is read-only
        config.maxDuration = 10000;
      }
      expect(manager.getCategoryConfig('category1')).toEqual({
        maxDuration: 5000,
      });
    });
  });

  test('getCategoryIds', () => {
    expect(manager.getCategoryIds()).toEqual([]);
    manager.setCategory('category1', {maxDuration: 5000});
    manager.setCategory('category2', {maxDuration: 5000});
    expect(manager.getCategoryIds()).toEqual(['category1', 'category2']);
  });

  test('delCategory', () => {
    manager.setCategory('category1', {maxDuration: 5000});
    manager.delCategory('category1');
    expect(manager.getCategoryIds()).toEqual([]);
  });
});

describe('task', () => {
  describe('setTask', () => {
    test('basic', () => {
      manager.setTask('task1', task);
      expect(manager.getTaskIds()).toEqual(['task1']);
    });

    test('with config', () => {
      manager.setTask('task1', task, undefined, {maxDuration: 5000});
      expect(manager.getTaskConfig('task1')).toEqual({maxDuration: 5000});
    });

    test('invalid object', () => {
      manager.setTask('task1', task);
      // @ts-expect-error not an object
      manager.setTask('task1', []);
      expect(manager.getTaskConfig('task1')).toEqual({});
    });

    test('invalid property', () => {
      // @ts-expect-error property does not exist
      manager.setTask('task1', task, undefined, {invalid: 5000});
      expect(manager.getTaskConfig('task1')).toEqual({});
    });

    test('invalid maxDuration', () => {
      manager.setTask('task1', task, undefined, {maxDuration: -5000});
      expect(manager.getTaskConfig('task1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setTask('task1', task, undefined, {maxDuration: 'five'});
      expect(manager.getTaskConfig('task1')).toEqual({});
    });

    test('invalid maxRetries', () => {
      manager.setTask('task1', task, undefined, {maxRetries: -5000});
      expect(manager.getTaskConfig('task1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setTask('task1', task, undefined, {maxRetries: 'five'});
      expect(manager.getTaskConfig('task1')).toEqual({});
    });

    test('invalid retryDelay', () => {
      manager.setTask('task1', task, undefined, {retryDelay: -5000});
      expect(manager.getTaskConfig('task1')).toEqual({});
      // @ts-expect-error property is numeric
      manager.setTask('task1', task, undefined, {retryDelay: false});
      expect(manager.getTaskConfig('task1')).toEqual({});

      manager.setTask('task1', task, undefined, {retryDelay: ','});
      expect(manager.getTaskConfig('task1')).toEqual({});
      manager.setTask('task1', task, undefined, {retryDelay: '5,'});
      expect(manager.getTaskConfig('task1')).toEqual({});
      manager.setTask('task1', task, undefined, {retryDelay: ',5'});
      expect(manager.getTaskConfig('task1')).toEqual({});
      manager.setTask('task1', task, undefined, {retryDelay: ''});
      expect(manager.getTaskConfig('task1')).toEqual({});
      manager.setTask('task1', task, undefined, {retryDelay: 'a,5'});
      expect(manager.getTaskConfig('task1')).toEqual({});
      manager.setTask('task1', task, undefined, {retryDelay: '5.5.5'});
      expect(manager.getTaskConfig('task1')).toEqual({});
    });
  });

  describe('getTaskConfig', () => {
    test('with defaults', () => {
      manager.setTask('task1', task, undefined, {maxDuration: 5000});
      expect(manager.getTaskConfig('task1', true)).toEqual({
        maxDuration: 5000,
        maxRetries: 2,
        retryDelay: 3000,
      });
    });

    test('with category defaults', () => {
      manager.setTask('task1', task, 'category1', {maxRetries: 5});
      manager.setCategory('category1', {maxDuration: 5000});
      expect(manager.getTaskConfig('task1', true)).toEqual({
        maxDuration: 5000,
        maxRetries: 5,
        retryDelay: 3000,
      });
    });

    test('invalid task', () => {
      expect(manager.getTaskConfig('task2')).toBeUndefined();
    });

    test('immutable', () => {
      manager.setTask('task1', task, undefined, {maxDuration: 5000});
      const config = manager.getTaskConfig('task1');
      // @ts-expect-error property is read-only
      config.maxDuration = 10000;
      expect(manager.getTaskConfig('task1')).toEqual({maxDuration: 5000});
    });
  });

  test('getTaskIds', () => {
    expect(manager.getTaskIds()).toEqual([]);
    manager.setTask('task1', task);
    manager.setTask('task2', task);
    expect(manager.getTaskIds()).toEqual(['task1', 'task2']);
  });

  test('delTask', () => {
    manager.setTask('task1', task);
    manager.delTask('task1');
    expect(manager.getTaskIds()).toEqual([]);
  });
});

describe('taskRun', () => {
  describe('scheduleTaskRun', () => {
    test('basic', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1');
      expect(taskRunId).toBeDefined();
    });

    test('invalid object', () => {
      manager.setTask('task1', task);
      // @ts-expect-error not an object
      const taskRunId = manager.scheduleTaskRun('task1', undefined, []);
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
    });

    test('invalid property', () => {
      manager.setTask('task1', task);
      // @ts-expect-error property does not exist
      const taskRunId = manager.scheduleTaskRun('task1', undefined, {
        invalid: 5000,
      });
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
    });

    test('invalid maxDuration', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxDuration: -5000,
      });
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
      const taskRunId2 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          // @ts-expect-error property is numeric
          maxDuration: 'five',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId2)).toEqual({});
    });

    test('invalid maxRetries', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxRetries: -5000,
      });
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
      const taskRunId2 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          // @ts-expect-error property is numeric
          maxRetries: 'five',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId2)).toEqual({});
    });

    test('invalid retryDelay', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        retryDelay: -5000,
      });
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
      const taskRunId2 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          // @ts-expect-error property is numeric
          retryDelay: false,
        },
      );
      expect(manager.getTaskRunConfig(taskRunId2)).toEqual({});

      const taskRunId3 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: ',',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId3)).toEqual({});
      const taskRunId4 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: '5,',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId4)).toEqual({});
      const taskRunId5 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: ',5',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId5)).toEqual({});
      const taskRunId6 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: '',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId6)).toEqual({});
      const taskRunId7 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: 'a,5',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId7)).toEqual({});
      const taskRunId8 = manager.scheduleTaskRun(
        'task1',
        undefined,
        undefined,
        {
          retryDelay: '5.5.5',
        },
      );
      expect(manager.getTaskRunConfig(taskRunId8)).toEqual({});
    });
  });

  describe('getTaskRunConfig', () => {
    test('no defaults', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxDuration: 5000,
      });
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({maxDuration: 5000});
    });

    test('with defaults', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxDuration: 5000,
      });
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 5000,
        maxRetries: 2,
        retryDelay: 3000,
      });
    });

    test('with task defaults', () => {
      manager.setTask('task1', task, undefined, {maxRetries: 5});
      const taskRunId = manager.scheduleTaskRun('task1');
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 1000,
        maxRetries: 5,
        retryDelay: 3000,
      });
    });

    test('with category defaults', () => {
      manager.setTask('task1', task, 'category1');
      manager.setCategory('category1', {retryDelay: 5000});
      const taskRunId = manager.scheduleTaskRun('task1');
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 1000,
        maxRetries: 2,
        retryDelay: 5000,
      });
    });

    test('with task & category defaults', () => {
      manager.setTask('task1', task, 'category1', {maxRetries: 5});
      manager.setCategory('category1', {retryDelay: 5000});
      const taskRunId = manager.scheduleTaskRun('task1');
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 1000,
        maxRetries: 5,
        retryDelay: 5000,
      });
    });

    test('with config, task & category defaults', () => {
      manager.setTask('task1', task, 'category1', {maxRetries: 5});
      manager.setCategory('category1', {retryDelay: 5000});
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxDuration: 5000,
      });
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 5000,
        maxRetries: 5,
        retryDelay: 5000,
      });
    });

    test('invalid task', () => {
      const taskRunId = manager.scheduleTaskRun('');
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({});
    });

    test('invalid task with defaults', () => {
      const taskRunId = manager.scheduleTaskRun('');
      expect(manager.getTaskRunConfig(taskRunId, true)).toEqual({
        maxDuration: 1000,
        maxRetries: 2,
        retryDelay: 3000,
      });
    });

    test('invalid taskRun', () => {
      expect(manager.getTaskRunConfig('')).toBeUndefined();
    });

    test('immutable', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
        maxDuration: 5000,
      });
      const config = manager.getTaskRunConfig(taskRunId);
      // @ts-expect-error property is read-only
      config.maxDuration = 10000;
      expect(manager.getTaskRunConfig(taskRunId)).toEqual({maxDuration: 5000});
    });
  });

  describe('getTaskRunInfo', () => {
    test('basic', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1');
      const startAfter = manager.getNow();
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
    });

    test('relative and absolute times', () => {
      manager.setTask('task1', task);
      manager.setTask('task2', task);
      const now = manager.getNow();
      const taskRunId2 = manager.scheduleTaskRun('task2', undefined, now + 10);
      const taskRunId1 = manager.scheduleTaskRun('task1', undefined, 5);
      expect(manager.getTaskRunInfo(taskRunId1)).toEqual({
        taskId: 'task1',
        startAfter: now + 5,
      });
      expect(manager.getTaskRunInfo(taskRunId2)).toEqual({
        taskId: 'task2',
        startAfter: now + 10,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([
        taskRunId1,
        taskRunId2,
      ]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
    });

    test('with arg', () => {
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1', 'arg1');
      const startAfter = manager.getNow();
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        arg: 'arg1',
        taskId: 'task1',
        startAfter,
      });
    });

    test('running', async () => {
      manager.setManagerConfig({tickInterval: 1});
      manager.setTask('task1', async () => await pause(2));
      const taskRunId = manager.scheduleTaskRun('task1');
      const startAfter = manager.getNow();
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      manager.start();
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
      expect(manager.getRunningTaskRunIds()).toEqual([]);
      await pause(1);
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
        running: true,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      expect(manager.getRunningTaskRunIds()).toEqual([taskRunId]);
    });
  });

  describe('delTaskRun', () => {
    test('before run', async () => {
      manager.setManagerConfig({tickInterval: 10});
      manager.setTask('task1', task);
      const taskRunId = manager.scheduleTaskRun('task1');
      const startAfter = manager.getNow();
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
      manager.delTaskRun(taskRunId);
      expect(manager.getTaskRunInfo(taskRunId)).toBeUndefined();
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      manager.start();
      await pause(15);
    });

    test('during run', async () => {
      manager.setManagerConfig({tickInterval: 10});
      manager.setTask('task1', async () => await pause(20));
      const taskRunId = manager.scheduleTaskRun('task1');
      const startAfter = manager.getNow();
      manager.start();
      await pause(5);
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
      });
      expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
      await pause(10);
      expect(manager.getTaskRunInfo(taskRunId)).toEqual({
        taskId: 'task1',
        startAfter,
        running: true,
      });
      manager.delTaskRun(taskRunId);
      expect(manager.getTaskRunInfo(taskRunId)).toBeUndefined();
      expect(manager.getScheduledTaskRunIds()).toEqual([]);
      await pause(10);
    });
  });
});

describe('ticks', () => {
  beforeEach(() => manager.setManagerConfig({tickInterval: 10}));

  test('start & stop', async () => {
    let ticks = 0;
    manager.setTask('task1', async () => ticks++);
    expect(ticks).toBe(0);
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(ticks).toBe(0);
    manager.start();
    await pause(5);
    expect(manager.getScheduledTaskRunIds()).toEqual([taskRunId]);
    expect(ticks).toBe(0);
    await pause(10);
    expect(manager.getScheduledTaskRunIds()).toEqual([]);
    expect(ticks).toBe(1);
    manager.stop();
    await pause(10);
    expect(ticks).toBe(1);
  });

  test('started once, then ends', async () => {
    manager.setTask('task1', async () => await pause(25));
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toBeUndefined();
    manager.start();
    await pause(5);
    expect(manager.getTaskRunInfo(taskRunId!)?.running).toBeUndefined();
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

  test('over runs', async () => {
    manager.setTask('task1', async () => await pause(25));
    const taskRunId = manager.scheduleTaskRun('task1', undefined, undefined, {
      maxDuration: 15,
    });
    manager.start();
    await pause(15);
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
