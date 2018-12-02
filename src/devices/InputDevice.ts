import {EventEmitter} from 'events';
import {Gpio} from 'onoff';
import {Device, DeviceConfig} from './Device';

export type InterruptValue = 0 | 1;
export type InterruptHandler = () => void;

export enum InputEvent {
  Activation = 'activation',
  Deactivation = 'deactivation'
}

export class InputDevice extends Device {
  private device : Gpio;
  private handlers : EventEmitter;

  constructor (options : DeviceConfig) {
    const {port} = options;
    super(options);
    this.device = new Gpio(port, 'in');
    this.device.watch(this.handleInterrupt.bind(this));
    this.handlers = new EventEmitter();
  }

  public on (event : InputEvent, handler : InterruptHandler) : void {
    this.handlers.on(event, handler);
  }

  private handleInterrupt (value : InterruptValue) : void {
    const event = value === 1 ? InputEvent.Activation : InputEvent.Deactivation;
    this.handlers.emit(event);
  }
}
