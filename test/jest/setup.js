jest.retryTimes(0);

afterEach(
  () => (global.env.assertionCalls += expect.getState().assertionCalls),
);
