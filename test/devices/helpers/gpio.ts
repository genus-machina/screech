import assert from 'assert';
import {TestInterface} from 'ava';
import onoff from 'onoff';
import sinon from 'sinon';
import {InterruptValue}  from '../../../src';
import {SandboxTest, useSandbox} from '../../helpers/sandbox';

type InterruptHandler = (value : InterruptValue) => void;

export interface GpioTest extends SandboxTest {
  getDevice : () => onoff.Gpio;
  getInterruptHandler : () => InterruptHandler;
  GpioStub: sinon.SinonStub;
}

export function useGpio (test : TestInterface<GpioTest>) {
  useSandbox(test);

  test.beforeEach(t => {
    const {Gpio} = onoff;
    const {sandbox} = t.context;

    const GpioStub = sandbox.stub(onoff, 'Gpio').callsFake(() => {
      const gpio = sinon.createStubInstance(Gpio);
      gpio.write.yields(null);
      return gpio;
    });

    t.context.GpioStub = GpioStub;

    t.context.getDevice = function getDevice () : onoff.Gpio {
      assert(GpioStub.callCount === 1, `Could not get device. Constructor called ${GpioStub.callCount} times`);
      return GpioStub.returnValues[0];
    };

    t.context.getInterruptHandler = function getInterruptHandler () : InterruptHandler {
      const device = t.context.getDevice();
      const watch = device.watch as sinon.SinonSpy;
      return watch.args[0][0];
    };
  });
}
