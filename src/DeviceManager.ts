import assert from 'assert';
import {Device} from './devices/Device';
import {EventEmitter} from 'events';
import {InputDevice, InputEvent} from './devices/InputDevice';
import {OutputDevice} from './devices/OutputDevice';

type EventHandler = (device : InputDevice) => void;

export {InputEvent} from './devices/InputDevice';

export class DeviceManager {
  private handlers : EventEmitter;
  private outputs : Map<string, Set<OutputDevice>>;

  constructor () {
    this.handlers = new EventEmitter();
    this.outputs = new Map<string, Set<OutputDevice>>();
  }

  public async activate (name : string) : Promise<void> {
    const devices = this.getOutputDevices(name);
    await Promise.all(Array.from(devices, device => device.on()));
  }

  public addDevice (device : Device) : void {
    if (device instanceof InputDevice) {
      this.addInputDevice(device);
    } else if (device instanceof OutputDevice) {
      this.addOutputDevice(device);
    } else {
      throw new Error(`Device '${device.name}' is not a recognized device type`);
    }
  }

  public createAlias (alias : string, name : string) : void {
    const sources = this.getOutputDevices(name);
    const targets = this.outputs.get(alias) || new Set<OutputDevice>();

    for (const device of sources) {
      targets.add(device);
    }

    this.outputs.set(alias, targets);
  }

  public async deactivate (name : string) : Promise<void> {
    const devices = this.getOutputDevices(name);
    await Promise.all(Array.from(devices, device => device.off()));
  }

  public on (event : InputEvent, handler : EventHandler) : void {
    this.handlers.on(event, handler);
  }

  private addInputDevice (device : InputDevice) : void {
    device.on(InputEvent.Activation, this.handleActivation.bind(this, device));
    device.on(InputEvent.Deactivation, this.handleDeactivation.bind(this, device));
  }

  private addOutputDevice (device : OutputDevice) : void {
    const devices = this.outputs.get(device.name) || new Set<OutputDevice>();
    devices.add(device);
    this.outputs.set(device.name, devices);
  }

  private getOutputDevices (name : string) : Set<OutputDevice> {
    const devices = this.outputs.get(name);
    assert(devices && devices.size, `No output device with name ${name}`);
    return devices!;
  }

  private handleActivation (device : InputDevice) : void {
    this.handlers.emit(InputEvent.Activation, device);
  }

  private handleDeactivation (device : InputDevice) : void {
    this.handlers.emit(InputEvent.Deactivation, device);
  }
}
