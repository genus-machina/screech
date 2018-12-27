import {TestInterface} from 'ava';
import sinon from 'sinon';
import {DeviceConfig, OutputDevice} from '../../../src';
import {testDeviceInterface} from './DeviceSpec';
import {GpioTest} from './gpio';

interface Context extends GpioTest {
  name : string;
  port : number;
}

type DeviceFactory = (config : DeviceConfig) => OutputDevice;
type DeviceTest = TestInterface<Context>;

export function testOutputDeviceInterface (test : DeviceTest, deviceFactory : DeviceFactory) : void {
  testDeviceInterface(test, deviceFactory);

  test.serial('turning a device on writes to the port', async t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    await device.on();

    const gpioDevice = t.context.getDevice();
    const spy = gpioDevice.write as sinon.SinonSpy;
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithExactly(spy, 1, sinon.match.func);
  });

  test.serial('turning a device off writes to the port', async t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    await device.off();

    const gpioDevice = t.context.getDevice();
    const spy = gpioDevice.write as sinon.SinonSpy;
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithExactly(spy, 0, sinon.match.func);
  });
};
