import {render} from '@testing-library/react';
import React, {act, StrictMode} from 'react';
import {ManagerProvider, useManager} from 'tinytick/ui-react';
import {pause} from '../../common.ts';

let didRender: jest.Mock;
beforeEach(() => {
  didRender = jest.fn((rendered) => rendered);
});

describe('Context Hooks', () => {
  describe('useManager', () => {
    test('basic', () => {
      const Test = () =>
        didRender(useManager()?.getManagerConfig(true).tickInterval);

      const {container, unmount} = render(
        <ManagerProvider>
          <Test />
        </ManagerProvider>,
      );
      expect(didRender).toHaveBeenCalledTimes(2);
      expect(container.textContent).toEqual('100');

      unmount();
    });

    test('started', async () => {
      let count = 0;
      const Test = () => {
        const manager = useManager();
        manager?.setTask('count', async () => count++);
        manager?.scheduleTaskRun('count', '', 0);
        return didRender(
          <>
            {manager?.getStatus()},{manager?.getScheduledTaskRunIds().length}
          </>,
        );
      };

      const {container, unmount} = render(
        <ManagerProvider>
          <Test />
        </ManagerProvider>,
      );
      expect(didRender).toHaveBeenCalledTimes(2);
      expect(container.textContent).toEqual('1,1');
      expect(count).toEqual(0);

      await act(async () => await pause(100));
      expect(count).toEqual(1);

      unmount();
    });

    test('stopped', async () => {
      let count = 0;
      const Test = () => {
        const manager = useManager();
        manager?.setTask('count', async () => count++);
        manager?.scheduleTaskRun('count', '', 0);
        return didRender(
          <>
            {manager?.getStatus()},{manager?.getScheduledTaskRunIds().length}
          </>,
        );
      };

      const {container, unmount} = render(
        <ManagerProvider started={false}>
          <Test />
        </ManagerProvider>,
      );
      expect(didRender).toHaveBeenCalledTimes(2);
      expect(container.textContent).toEqual('0,1');
      expect(count).toEqual(0);

      await act(async () => await pause(100));
      expect(count).toEqual(0);

      unmount();
    });

    test('strict mode', async () => {
      let count = 0;
      const Test = () => {
        const manager = useManager();
        manager?.setTask('count', async () => count++);
        manager?.scheduleTaskRun('count', '', 0);
        return didRender(manager?.getScheduledTaskRunIds().length);
      };

      const {container, unmount} = render(
        <StrictMode>
          <ManagerProvider>
            <Test />
          </ManagerProvider>
        </StrictMode>,
      );

      expect(didRender).toHaveBeenCalledTimes(4);
      expect(container.textContent).toEqual('2');
      expect(count).toEqual(0);

      await act(async () => await pause(100));
      expect(count).toEqual(2);

      unmount();
    });

    test('unmount', async () => {
      let count = 0;
      const Test = () => {
        const manager = useManager();
        manager?.setTask('count', async () => count++);
        manager?.scheduleTaskRun('count', '', 0);
        return didRender(manager?.getScheduledTaskRunIds().length);
      };

      const {container, unmount} = render(
        <ManagerProvider>
          <Test />
        </ManagerProvider>,
      );

      expect(didRender).toHaveBeenCalledTimes(2);
      expect(container.textContent).toEqual('1');
      expect(count).toEqual(0);

      unmount();
      await act(async () => await pause(100));
      expect(count).toEqual(0);
    });
  });
});
