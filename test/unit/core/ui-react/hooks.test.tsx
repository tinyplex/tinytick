import {fireEvent, render} from '@testing-library/react';
import React, {act, StrictMode} from 'react';
import {createManager, type Id, type Manager} from 'tinytick';
import {
  Provider,
  useCreateManager,
  useManager,
  useRunningTaskRunIds,
  useScheduledTaskRunIds,
  useStartCallback,
  useStatus,
  useStopCallback,
  useTaskRunRunning,
} from 'tinytick/ui-react';
import {pause} from '../../common.ts';

let manager: Manager;
let didRender: jest.Mock;
beforeEach(() => {
  manager = createManager();
  didRender = jest.fn((rendered) => rendered);
});

test('useCreateManager', () => {
  const initManager = jest.fn((tickInterval) =>
    createManager().setManagerConfig({tickInterval}),
  );
  const Test = ({tickInterval}: {tickInterval: number}) => {
    const manager = useCreateManager(() => initManager(tickInterval));
    return didRender(
      <>
        {tickInterval},{manager.getManagerConfig(true).tickInterval}
      </>,
    );
  };

  const {container, rerender, unmount} = render(<Test tickInterval={200} />);
  expect(container.textContent).toEqual('200,200');

  rerender(<Test tickInterval={300} />);
  expect(container.textContent).toEqual('300,200');

  expect(didRender).toHaveBeenCalledTimes(2);
  expect(initManager).toHaveBeenCalledTimes(1);

  unmount();
});

describe('Context Hooks', () => {
  describe('useManager', () => {
    test('basic', () => {
      const Test = () =>
        didRender(useManager()?.getManagerConfig(true).tickInterval);

      const {container, unmount} = render(
        <Provider manager={manager}>
          <Test />
        </Provider>,
      );
      expect(didRender).toHaveBeenCalledTimes(1);
      expect(container.textContent).toEqual('100');

      unmount();
    });

    test('strict mode', async () => {
      let count = 0;
      const Test = () => {
        const manager = useManager()?.start();
        manager?.setTask('count', async () => count++);
        manager?.scheduleTaskRun('count', '', 0);
        return didRender(manager?.getScheduledTaskRunIds().length);
      };

      const {container, unmount} = render(
        <StrictMode>
          <Provider manager={manager}>
            <Test />
          </Provider>
        </StrictMode>,
      );

      expect(didRender).toHaveBeenCalledTimes(2);
      expect(container.textContent).toEqual('2');
      expect(count).toEqual(0);

      await act(() => pause(100));
      expect(count).toEqual(2);

      unmount();
    });
  });
});

describe('Read Hooks', () => {
  test('useStatus, no manager', () => {
    const Test = () => didRender(useStatus() ?? 'undefined');

    const {container, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('undefined');
    unmount();
  });

  test('useStatus', () => {
    const Test = () => didRender(useStatus());

    const {container, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    expect(container.textContent).toEqual('0');

    act(() => manager.start());
    expect(container.textContent).toEqual('1');

    act(() => manager.stop());
    expect(container.textContent).toEqual('2');

    act(() => manager.start());
    expect(container.textContent).toEqual('1');

    act(() => manager.stop(true));
    expect(container.textContent).toEqual('0');

    expect(didRender).toHaveBeenCalledTimes(5);
    unmount();
  });

  test('useScheduledTaskRunIds, no manager', () => {
    const Test = () => didRender(useScheduledTaskRunIds() ?? 'undefined');

    const {container, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('undefined');
    unmount();
  });

  test('useScheduledTaskRunIds', () => {
    const Test = () => didRender(useScheduledTaskRunIds()?.length);
    manager.setTask('ping', async () => await fetch('https://example.org'));

    const {container, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    expect(container.textContent).toEqual('0');

    act(() => manager.scheduleTaskRun('ping'));
    expect(container.textContent).toEqual('1');

    act(() => manager.scheduleTaskRun('ping'));
    expect(container.textContent).toEqual('2');

    expect(didRender).toHaveBeenCalledTimes(3);
    unmount();
  });

  test('useRunningTaskRunIds, no manager', () => {
    const Test = () => didRender(useRunningTaskRunIds() ?? 'undefined');

    const {container, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('undefined');
    unmount();
  });

  test('useRunningTaskRunIds', async () => {
    const Test = () => didRender(useRunningTaskRunIds()?.length);
    manager.setTask('task1', async () => await pause(200));

    const {container, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    expect(container.textContent).toEqual('0');

    act(() => {
      manager.start();
      manager.scheduleTaskRun('task1');
    });
    expect(container.textContent).toEqual('0');

    await act(async () => await pause(100));
    expect(container.textContent).toEqual('1');

    await act(async () => await pause(200));
    expect(container.textContent).toEqual('0');

    expect(didRender).toHaveBeenCalledTimes(3);
    unmount();
  });

  test('useTaskRunRunning, no manager', () => {
    const Test = () => didRender(useTaskRunRunning('') ?? 'undefined');

    const {container, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('undefined');
    unmount();
  });

  test('useTaskRunRunning', async () => {
    const Test = ({taskRunId}: {taskRunId: Id}) =>
      didRender(useTaskRunRunning(taskRunId) ? 'true' : 'false');
    manager.start();
    manager.setTask('task1', async () => await pause(50));
    const taskRunId = manager.scheduleTaskRun('task1')!;

    const {container, unmount} = render(
      <Provider manager={manager}>
        <Test taskRunId={taskRunId} />
      </Provider>,
    );

    expect(container.textContent).toEqual('false');

    await act(async () => await pause(100));
    expect(container.textContent).toEqual('true');

    await act(async () => await pause(100));
    expect(container.textContent).toEqual('false');

    expect(didRender).toHaveBeenCalledTimes(3);
    unmount();
  });
});

describe('Write Hooks', () => {
  test('useStartCallback', () => {
    const Test = () => {
      const handler = useStartCallback();
      return didRender(<button onClick={handler} />);
    };

    const {getByRole, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    expect(manager.getStatus()).toEqual(0);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(manager.getStatus()).toEqual(1);
    expect(didRender).toHaveBeenCalledTimes(1);
    unmount();
  });

  test('useStopCallback', () => {
    const Test = () => {
      const handler = useStopCallback();
      return didRender(<button onClick={handler} />);
    };

    const {getByRole, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    manager.start();
    expect(manager.getStatus()).toEqual(1);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(manager.getStatus()).toEqual(2);
    expect(didRender).toHaveBeenCalledTimes(1);
    unmount();
  });

  test('useStopCallback, force', () => {
    const Test = () => {
      const handler = useStopCallback(true);
      return didRender(<button onClick={handler} />);
    };

    const {getByRole, unmount} = render(
      <Provider manager={manager}>
        <Test />
      </Provider>,
    );

    manager.start();
    expect(manager.getStatus()).toEqual(1);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(manager.getStatus()).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(1);
    unmount();
  });
});
