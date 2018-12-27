import random from 'lodash/random';
import sinon from 'sinon';
import {v4 as uuid} from 'uuid';
import {Device, InputDevice, InputEvent, InterruptHandler, OutputDevice} from '../../src';

function initializeMockDevice (device : any, name : string) {
  device.id = uuid();
  device.name = name;
  device.port = random(1, 10);
  return device;
}

export function createGenericDevice (name : string) : Device {
  const device = sinon.createStubInstance(Device);
  return initializeMockDevice(device, name);
}

export function createMockInputDevice (name : string) : InputDevice {
  const device = sinon.createStubInstance(InputDevice);
  return initializeMockDevice(device, name);
}

export function createMockOutputDevice (name : string) : OutputDevice {
  const device = sinon.createStubInstance(OutputDevice);
  device.off.resolves();
  device.on.resolves();
  return initializeMockDevice(device, name);
}

export function getInputEventHandler (device : InputDevice, event : InputEvent) : InterruptHandler {
  const addHandlerStub = device.on as sinon.SinonStub;
  const eventHandlerStub = addHandlerStub.withArgs(event, sinon.match.func);
  sinon.assert.calledOnce(eventHandlerStub);
  return eventHandlerStub.firstCall.lastArg;
}
