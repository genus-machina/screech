import anyTest, {TestInterface} from 'ava';
import sinon from 'sinon';
import {v4 as uuid} from 'uuid';
import {createGenericDevice, createMockInputDevice, createMockOutputDevice, getInputEventHandler} from './helpers/devices';
import {DeviceManager, InputEvent} from '../src';

interface Context {
  manager : DeviceManager;
};

const test = anyTest as TestInterface<Context>;

test.beforeEach(t => {
  t.context.manager = new DeviceManager();
});

test('only input and output devices can be added to a manager', t => {
  const {manager} = t.context;
  const generic = createGenericDevice('generic');
  const input = createMockInputDevice('input');
  const output = createMockOutputDevice('output');
  t.throws(() => manager.addDevice(generic), /not a recognized device type/);
  t.notThrows(() => manager.addDevice(input));
  t.notThrows(() => manager.addDevice(output));
});

function testOutputDeviceOperation ({ action, method }) {
  test(`calling ${method} on a non-existant device fails`, async t => {
    const {manager} = t.context;
    await t.throwsAsync(manager[method](uuid()), /no output device/i);
  });

  test(`${method} turns all devices by that name ${action}`, async t => {
    const {manager} = t.context;
    const device1 = createMockOutputDevice('duplicate');
    const device2 = createMockOutputDevice('unique');
    const device3 = createMockOutputDevice('duplicate');

    manager.addDevice(device1);
    manager.addDevice(device2);
    manager.addDevice(device3);
    await manager[method]('duplicate');

    sinon.assert.calledOnce(device1[action]);
    sinon.assert.calledWithExactly(device1[action]);
    sinon.assert.notCalled(device2[action]);
    sinon.assert.calledOnce(device3[action]);
    sinon.assert.calledWithExactly(device3[action]);
  });
}

testOutputDeviceOperation({ action: 'on', method: 'activate' });
testOutputDeviceOperation({ action: 'off', method: 'deactivate' });

function testInputEventHandlers ({ event }) {
  test(`${event} events are forwarded from input devices`, async t => {
    const {manager} = t.context;
    const device = createMockInputDevice('input');
    manager.addDevice(device);

    const simulateEvent = getInputEventHandler(device, event);
    const handler = sinon.stub();
    manager.on(event, handler);

    simulateEvent();
    sinon.assert.calledOnce(handler);
    sinon.assert.calledWithExactly(handler, device);
  });
}

testInputEventHandlers({event: InputEvent.Activation});
testInputEventHandlers({event: InputEvent.Deactivation});
