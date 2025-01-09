import {type Manager, createManager} from 'tinytick';

let manager: Manager;
const task = (_arg: string) => {};

beforeEach(() => {
  manager = createManager();
});

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
    expect(manager.getTaskRunInfo(taskRunId!)).not.toBeUndefined();
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
