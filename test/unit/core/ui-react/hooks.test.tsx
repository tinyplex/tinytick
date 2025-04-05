import {render} from '@testing-library/react';
import React from 'react';
import {ManagerProvider} from 'tinytick/ui-react';

let didRender: jest.Mock;
beforeEach(() => {
  didRender = jest.fn((rendered) => rendered);
});

describe('Context Hooks', () => {
  test('useStore', () => {
    const Test = () => didRender(<>hi</>);

    const {container, unmount} = render(
      <ManagerProvider>
        <Test />
      </ManagerProvider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });
});
