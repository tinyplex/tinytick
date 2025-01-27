export const pause = async (ms = 5): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
