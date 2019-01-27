import anyTest, {TestInterface} from 'ava';
import random from 'lodash/random';
import sinon from 'sinon';
import {Lamp} from '../../src';
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

testOutputDeviceInterface(test, ({name, port}) => new Lamp({name, port}));

test.serial('instantiating a lamp initializes the port', t => {
  const {GpioStub, name, port} = t.context;
  const device = new Lamp({name, port});
  t.truthy(device);

  const config = {activeLow: true};
  sinon.assert.calledOnce(GpioStub);
  sinon.assert.calledWithExactly(GpioStub, port, 'high', config);
});
