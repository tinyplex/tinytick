import {writeFileSync} from 'fs';
import {TestEnvironment} from 'jest-environment-jsdom';

export default class TinyTickEnvironment extends TestEnvironment {
  static tests = 0;
  static assertions = 0;

  async setup() {
    Object.assign(this.global, {
      Uint8Array,
      env: this.constructor,
    });
    await super.setup();
  }

  async teardown() {
    writeFileSync(
      './tmp/counts.json',
      JSON.stringify({
        tests: TinyTickEnvironment.tests,
        assertions: TinyTickEnvironment.assertions,
      }),
      'utf-8',
    );
    await super.teardown();
  }
}
