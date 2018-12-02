import anyTest, {TestInterface} from 'ava';
import random from 'lodash/random';
import sinon from 'sinon';
import {OutputDevice, OutputDeviceConfig} from '../../src';
import {testDeviceInterface} from './helpers/DeviceSpec';
import {GpioTest, useGpio} from './helpers/gpio';

interface Context extends GpioTest {
  name : string;
  port : number;
}

const test = anyTest as TestInterface<Context>;

useGpio(test);

test.beforeEach(t => {
  t.context.name = 'test-device';
  t.context.port = random(1, 10);
});

testDeviceInterface(test, ({ name, port }) => new OutputDevice({name, port}));

test.serial('instantiating a device initializes the port', t => {
  const {GpioStub, name, port} = t.context;
  const device = new OutputDevice({name, port});
  t.truthy(device);

  const config = {activeLow: false};
  sinon.assert.calledOnce(GpioStub);
  sinon.assert.calledWithExactly(GpioStub, port, 'out', config);
});

test.serial('a device can be configured with inverted logic', t => {
  const {GpioStub, name, port} = t.context;
  const device = new OutputDevice({activeLow: true, name, port});
  t.truthy(device);

  const config = {activeLow: true};
  sinon.assert.calledOnce(GpioStub);
  sinon.assert.calledWithExactly(GpioStub, port, 'out', config);
});

test.serial('turning a device on writes to the port', async t => {
  const {name, port} = t.context;
  const device = new OutputDevice({name, port});
  await device.on();

  const gpioDevice = t.context.getDevice();
  const spy = gpioDevice.write as sinon.SinonSpy;
  sinon.assert.calledOnce(spy);
  sinon.assert.calledWithExactly(spy, 1, sinon.match.func);
});

test.serial('turning a device off writes to the port', async t => {
  const {name, port} = t.context;
  const device = new OutputDevice({name, port});
  await device.off();

  const gpioDevice = t.context.getDevice();
  const spy = gpioDevice.write as sinon.SinonSpy;
  sinon.assert.calledOnce(spy);
  sinon.assert.calledWithExactly(spy, 0, sinon.match.func);
});
