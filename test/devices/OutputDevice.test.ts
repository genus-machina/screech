import anyTest, {TestInterface} from 'ava';
import random from 'lodash/random';
import sinon from 'sinon';
import {OutputDevice} from '../../src';
import {GpioTest, useGpio} from './helpers/gpio';
import {testOutputDeviceInterface} from './helpers/OutputDeviceSpec';

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

testOutputDeviceInterface(test, ({name, port}) => new OutputDevice({name, port}));

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
