import anyTest, {TestInterface} from 'ava';
import get from 'lodash/get';
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

function testOutputDeviceOperation ({action, method} : {action : string, method : string}) {
  test(`calling ${method} on a non-existant device fails`, async t => {
    const {manager} = t.context;
    const invoke = get(manager, method).bind(manager);
    await t.throwsAsync(invoke(uuid()), /no output device/i);
  });

  test(`${method} turns all devices by that name ${action}`, async t => {
    const {manager} = t.context;
    const device1 = createMockOutputDevice('duplicate');
    const device2 = createMockOutputDevice('unique');
    const device3 = createMockOutputDevice('duplicate');

    manager.addDevice(device1);
    manager.addDevice(device2);
    manager.addDevice(device3);

    const invoke = get(manager, method).bind(manager);
    await invoke('duplicate');

    sinon.assert.calledOnce(get(device1, action));
    sinon.assert.calledWithExactly(get(device1, action));
    sinon.assert.notCalled(get(device2, action));
    sinon.assert.calledOnce(get(device3, action));
    sinon.assert.calledWithExactly(get(device3, action));
  });
}

testOutputDeviceOperation({ action: 'on', method: 'activate' });
testOutputDeviceOperation({ action: 'off', method: 'deactivate' });

function testInputEventHandlers ({event} : {event : InputEvent}) {
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

test('output devices can have aliases', async t => {
  const {manager} = t.context;
  const device1 = createMockOutputDevice('one');
  const device2 = createMockOutputDevice('two');

  manager.addDevice(device1);
  manager.addDevice(device2);
  manager.createAlias('alias', device1.name);
  manager.createAlias('alias', device2.name);
  manager.activate('alias');

  sinon.assert.calledOnce(device1.on as sinon.SinonSpy);
  sinon.assert.calledOnce(device2.on as sinon.SinonSpy);
});
