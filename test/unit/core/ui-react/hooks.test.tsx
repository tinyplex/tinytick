import {render} from '@testing-library/react';
import React, {act, StrictMode} from 'react';
import {createManager, type Manager} from 'tinytick';
import {Provider, useCreateManager, useManager} from 'tinytick/ui-react';
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
