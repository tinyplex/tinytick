import {type Manager, createManager} from 'tinytick';

let manager: Manager;
const task = () => {};

const pause = async (s = 0.05): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, s * 1000));

beforeEach(() => {
  manager = createManager();
});

afterEach(() => manager.stop());

describe('manager', () => {
  test('create', () => {
    expect(manager).not.toBeUndefined();
  });

  test('setManagerConfig', () => {
    manager.setManagerConfig({tickInterval: 5});
    expect(manager.getManagerConfig()).toEqual({tickInterval: 5});
  });

  test('setManagerConfig, invalid object', () => {
    // @ts-expect-error not an object
    manager.setManagerConfig([]);
    expect(manager.getManagerConfig()).toEqual({});
  });

  test('setManagerConfig, invalid property', () => {
    // @ts-expect-error property does not exist
    manager.setManagerConfig({invalid: 5});
    expect(manager.getManagerConfig()).toEqual({});
  });

  test('setManagerConfig, invalid tickInterval', () => {
    manager.setManagerConfig({tickInterval: -5});
    expect(manager.getManagerConfig()).toEqual({});
    // @ts-expect-error property is numeric
    manager.setManagerConfig({tickInterval: 'five'});
    expect(manager.getManagerConfig()).toEqual({});
  });

  test('getManagerConfig is immutable', () => {
    manager.setManagerConfig({tickInterval: 5});
    const config = manager.getManagerConfig();
    if (config) {
      // @ts-expect-error property is read-only
      config.tickInterval = 10;
    }
    expect(manager.getManagerConfig()).toEqual({tickInterval: 5});
  });

  test('fluent methods', () => {
    expect(manager.setManagerConfig({tickInterval: 5})).toBe(manager);
    expect(manager.setTask('task1', task)).toBe(manager);
    expect(manager.setTaskConfig('task1', {maxDuration: 5})).toBe(manager);
    expect(manager.delTask('task1')).toBe(manager);
    expect(manager.setCategoryConfig('category1', {maxDuration: 5})).toBe(
      manager,
    );
    expect(manager.delCategory('category1')).toBe(manager);
    expect(manager.unscheduleTaskRun('taskRun1')).toBe(manager);
    expect(manager.start()).toBe(manager);
    expect(manager.stop()).toBe(manager);
  });
});

describe('tasks & config', () => {
  test('setTask', () => {
    manager.setTask('task1', task);
    expect(manager.getTaskIds()).toEqual(['task1']);
  });

  test('setTask with config', () => {
    manager.setTask('task1', task, {maxDuration: 5});
    expect(manager.getTaskConfig('task1')).toEqual({maxDuration: 5});
  });

  test('setTaskConfig', () => {
    manager.setTask('task1', task);
    manager.setTaskConfig('task1', {maxDuration: 5, retryDelay: '1,2'});
    expect(manager.getTaskConfig('task1')).toEqual({
      maxDuration: 5,
      retryDelay: '1,2',
    });
  });

  test('getTaskConfig, no defaults', () => {
    manager.setTask('task1', task, {maxDuration: 5});
    expect(manager.getTaskConfig('task1')).toEqual({maxDuration: 5});
  });

  test('getTaskConfig, with defaults', () => {
    manager.setTask('task1', task, {maxDuration: 5});
    expect(manager.getTaskConfig('task1', true)).toEqual({
      maxDuration: 5,
      maxRetries: 2,
      retryDelay: 3,
    });
  });

  test('setTaskConfig, invalid object', () => {
    manager.setTask('task1', task);
    // @ts-expect-error not an object
    manager.setTaskConfig('task1', []);
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid property', () => {
    manager.setTask('task1', task);
    // @ts-expect-error property does not exist
    manager.setTaskConfig('task1', {invalid: 5});
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid categoryId', () => {
    manager.setTask('task1', task);
    // @ts-expect-error property should be string
    manager.setTaskConfig('task1', {categoryId: 1});
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid maxDuration', () => {
    manager.setTask('task1', task);
    manager.setTaskConfig('task1', {maxDuration: -5});
    expect(manager.getTaskConfig('task1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setTaskConfig('task1', {maxDuration: 'five'});
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid maxRetries', () => {
    manager.setTask('task1', task);
    manager.setTaskConfig('task1', {maxRetries: -5});
    expect(manager.getTaskConfig('task1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setTaskConfig('task1', {maxRetries: 'five'});
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid retryDelay', () => {
    manager.setTask('task1', task);
    manager.setTaskConfig('task1', {retryDelay: -5});
    expect(manager.getTaskConfig('task1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setTaskConfig('task1', {retryDelay: false});
    expect(manager.getTaskConfig('task1')).toEqual({});

    manager.setTaskConfig('task1', {retryDelay: ','});
    expect(manager.getTaskConfig('task1')).toEqual({});
    manager.setTaskConfig('task1', {retryDelay: '5,'});
    expect(manager.getTaskConfig('task1')).toEqual({});
    manager.setTaskConfig('task1', {retryDelay: ',5'});
    expect(manager.getTaskConfig('task1')).toEqual({});
    manager.setTaskConfig('task1', {retryDelay: ''});
    expect(manager.getTaskConfig('task1')).toEqual({});
    manager.setTaskConfig('task1', {retryDelay: 'a,5'});
    expect(manager.getTaskConfig('task1')).toEqual({});
  });

  test('setTaskConfig, invalid task', () => {
    manager.setTask('task1', task);
    manager.setTaskConfig('task2', {maxDuration: 5});
    expect(manager.getTaskIds()).toEqual(['task1']);
    expect(manager.getTaskConfig('task2')).toBeUndefined();
  });

  test('getTaskConfig is immutable', () => {
    manager.setTask('task1', task, {maxDuration: 5});
    const config = manager.getTaskConfig('task1');
    if (config) {
      // @ts-expect-error property is read-only
      config.maxDuration = 10;
    }
    expect(manager.getTaskConfig('task1')).toEqual({maxDuration: 5});
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

describe('categories & config', () => {
  test('setCategoryConfig', () => {
    manager.setCategoryConfig('category1', {maxDuration: 5});
    expect(manager.getCategoryIds()).toEqual(['category1']);
  });

  test('getCategoryConfig, no defaults', () => {
    manager.setCategoryConfig('category1', {maxDuration: 5});
    expect(manager.getCategoryConfig('category1')).toEqual({maxDuration: 5});
  });

  test('getCategoryConfig, with defaults', () => {
    manager.setCategoryConfig('category1', {maxDuration: 5});
    expect(manager.getCategoryConfig('category1', true)).toEqual({
      maxDuration: 5,
      maxRetries: 2,
      retryDelay: 3,
    });
  });

  test('getTaskConfig, with category defaults', () => {
    manager.setTask('task1', task, {categoryId: 'category1', maxRetries: 5});
    manager.setCategoryConfig('category1', {maxDuration: 5});
    expect(manager.getTaskConfig('task1', true)).toEqual({
      categoryId: 'category1',
      maxDuration: 5,
      maxRetries: 5,
      retryDelay: 3,
    });
  });

  test('setCategoryConfig, invalid object', () => {
    // @ts-expect-error not an object
    manager.setCategoryConfig('category1', []);
    expect(manager.getCategoryConfig('category1')).toBeUndefined();
  });

  test('setCategoryConfig, invalid property', () => {
    manager.setTask('task1', task);
    // @ts-expect-error property does not exist
    manager.setCategoryConfig('category1', {invalid: 5});
    expect(manager.getCategoryConfig('category1')).toEqual({});
  });

  test('setCategoryConfig, invalid maxDuration', () => {
    manager.setTask('task1', task);
    manager.setCategoryConfig('category1', {maxDuration: -5});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setCategoryConfig('category1', {maxDuration: 'five'});
    expect(manager.getCategoryConfig('category1')).toEqual({});
  });

  test('setCategoryConfig, invalid maxRetries', () => {
    manager.setTask('task1', task);
    manager.setCategoryConfig('category1', {maxRetries: -5});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setCategoryConfig('category1', {maxRetries: 'five'});
    expect(manager.getCategoryConfig('category1')).toEqual({});
  });

  test('setCategoryConfig, invalid retryDelay', () => {
    manager.setTask('task1', task);
    manager.setCategoryConfig('category1', {retryDelay: -5});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    // @ts-expect-error property is numeric
    manager.setCategoryConfig('category1', {retryDelay: false});
    expect(manager.getCategoryConfig('category1')).toEqual({});

    manager.setCategoryConfig('category1', {retryDelay: ','});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    manager.setCategoryConfig('category1', {retryDelay: '5,'});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    manager.setCategoryConfig('category1', {retryDelay: ',5'});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    manager.setCategoryConfig('category1', {retryDelay: ''});
    expect(manager.getCategoryConfig('category1')).toEqual({});
    manager.setCategoryConfig('category1', {retryDelay: 'a,5'});
    expect(manager.getCategoryConfig('category1')).toEqual({});
  });

  test('setCategoryConfig is immutable', () => {
    manager.setCategoryConfig('category1', {maxDuration: 5});
    const config = manager.getCategoryConfig('category1');
    if (config) {
      // @ts-expect-error property is read-only
      config.maxDuration = 10;
    }
    expect(manager.getCategoryConfig('category1')).toEqual({maxDuration: 5});
  });

  test('getCategoryIds', () => {
    expect(manager.getCategoryIds()).toEqual([]);
    manager.setCategoryConfig('category1', {maxDuration: 5});
    manager.setCategoryConfig('category2', {maxDuration: 5});
    expect(manager.getCategoryIds()).toEqual(['category1', 'category2']);
  });

  test('delCategory', () => {
    manager.setCategoryConfig('category1', {maxDuration: 5});
    manager.delCategory('category1');
    expect(manager.getCategoryIds()).toEqual([]);
  });
});

describe('task runs', () => {
  test('scheduleTaskRun', () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(taskRunId).not.toBeUndefined();
  });

  test('getTaskRunInfo', () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');
    const taskInfo = manager.getTaskRunInfo(taskRunId!);
    expect(taskInfo).not.toBeUndefined();
    expect(taskInfo).toEqual({taskId: 'task1'});
  });

  test('getTaskRunInfo, with arg', () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1', 'arg1');
    expect(manager.getTaskRunInfo(taskRunId!)).toEqual({
      taskId: 'task1',
      arg: 'arg1',
    });
  });

  test('getTaskRunInfo, invalid taskRunId', () => {
    manager.setTask('task1', task);
    manager.scheduleTaskRun('task1');
    expect(manager.getTaskRunInfo('')).toBeUndefined();
  });

  test('unscheduleTaskRun', () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');
    manager.unscheduleTaskRun(taskRunId!);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
  });

  test('unscheduleTaskRun, invalid taskRunId', () => {
    manager.setTask('task1', task);
    const taskRunId = manager.scheduleTaskRun('task1');
    manager.unscheduleTaskRun('');
    expect(manager.getTaskRunInfo(taskRunId!)).not.toBeUndefined();
  });
});

describe('ticks', () => {
  beforeEach(() => manager.setManagerConfig({tickInterval: 0.01}));

  test('start & stop', async () => {
    let ticks = 0;
    manager.setTask('task1', () => ticks++);
    expect(ticks).toBe(0);
    manager.scheduleTaskRun('task1');
    expect(ticks).toBe(0);
    manager.start();
    await pause(0.005);
    expect(ticks).toBe(0);
    await pause(0.005);
    expect(ticks).toBe(1);
    manager.stop();
    await pause(0.015);
    expect(ticks).toBe(1);
  });

  test('started timestamp', async () => {
    manager.setTask('task1', () => {});
    const taskRunId = manager.scheduleTaskRun('task1');
    expect(manager.getTaskRunInfo(taskRunId!)?.started).toBeUndefined();
    manager.start();
    await pause(0.01);
    expect(manager.getTaskRunInfo(taskRunId!)?.started).not.toBeUndefined();
    manager.stop();
  });

  test('ignore invalid scheduled task', async () => {
    manager.setTask('task1', () => {});
    const taskRunId = manager.scheduleTaskRun('task2');
    expect(manager.getTaskRunInfo(taskRunId!)).not.toBeUndefined();
    manager.start();
    await pause(0.01);
    expect(manager.getTaskRunInfo(taskRunId!)).toBeUndefined();
    manager.stop();
  });
});
