import {type Manager, createManager} from 'tinytick';
import {pause} from '../common.ts';

let manager: Manager;
const task = async () => {};

beforeEach(() => {
  manager = createManager().setManagerConfig({tickInterval: 10});
});

afterEach(() => manager.stop());

describe('taskRunIdsListener', () => {
  test('normal run', async () => {
    manager.setTask('task1', task);
    const scheduledLog: string[][] = [];
    manager.addScheduledTaskRunIdsListener((manager) =>
      scheduledLog.push(manager.getScheduledTaskRunIds()),
    );

    const taskRunId = manager.scheduleTaskRun('task1');
    expect(scheduledLog).toEqual([[taskRunId]]);

    manager.start();
    await pause(10);

    expect(scheduledLog).toEqual([[taskRunId], []]);
  });
});
