import {TestInterface} from 'ava';
import sinon from 'sinon';

export interface SandboxTest {
  sandbox : sinon.SinonSandbox;
}

export function useSandbox (test : TestInterface<SandboxTest>) {
  test.beforeEach(t => {
    if (!t.context.sandbox) {
      t.context.sandbox = sinon.createSandbox();
    }
  });

  test.afterEach.always(t => {
    t.context.sandbox.restore();
  });
}
