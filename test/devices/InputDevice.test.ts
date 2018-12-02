import anyTest, {TestInterface} from 'ava';
import sinon from 'sinon';
import {DeviceConfig, InputDevice, InputEvent} from '../../src';
import {testDeviceInterface} from './helpers/DeviceSpec';
import {GpioTest, useGpio} from './helpers/gpio';

interface Context extends GpioTest {
  name : string;
  port : number;
}

const test = anyTest as TestInterface<Context>;

function createInputDevice (config : DeviceConfig) : InputDevice {
  return new InputDevice(config);
}

useGpio(test);
testDeviceInterface(test, ({name, port}) => new InputDevice({name, port}));

test.serial('instantiating a device initializes the port', t => {
  const {GpioStub, port} = t.context;
  createInputDevice(t.context);
  sinon.assert.calledOnce(GpioStub);
  sinon.assert.calledWithExactly(GpioStub, port, 'in');
});

test.serial('instantiating a device sets up an interrupt handler', t => {
  createInputDevice(t.context);

  const gpioDevice = t.context.getDevice();
  const spy = gpioDevice.watch as sinon.SinonSpy;
  sinon.assert.calledOnce(spy);
  sinon.assert.calledWithExactly(spy, sinon.match.func);
});

test.serial('when a device is activated the activation handlers are invoked', t => {
  const device = createInputDevice(t.context);

  const activation1 = sinon.spy();
  const activation2 = sinon.spy();
  const deactivation = sinon.spy();
  device.on(InputEvent.Activation, activation1);
  device.on(InputEvent.Activation, activation2);
  device.on(InputEvent.Deactivation, deactivation);

  const handler = t.context.getInterruptHandler();
  handler(1);

  sinon.assert.calledOnce(activation1);
  sinon.assert.calledWithExactly(activation1);
  sinon.assert.calledOnce(activation2);
  sinon.assert.calledWithExactly(activation2);
  sinon.assert.notCalled(deactivation);
});

test.serial('when a device is deactivated the deactivation handlers are invoked', t => {
  const device = createInputDevice(t.context);

  const activation = sinon.spy();
  const deactivation1 = sinon.spy();
  const deactivation2 = sinon.spy();
  device.on(InputEvent.Activation, activation);
  device.on(InputEvent.Deactivation, deactivation1);
  device.on(InputEvent.Deactivation, deactivation2);

  const handler = t.context.getInterruptHandler();
  handler(0);

  sinon.assert.notCalled(activation);
  sinon.assert.calledOnce(deactivation1);
  sinon.assert.calledWithExactly(deactivation1);
  sinon.assert.calledOnce(deactivation2);
  sinon.assert.calledWithExactly(deactivation2);
});
