import {TestEnvironment} from 'jest-environment-jsdom';

export default class extends TestEnvironment {
  static assertionCalls = 0;
  async setup() {
    Object.assign(this.global, {
      Uint8Array,
      env: this.constructor,
    });
    await super.setup();
  }
}
