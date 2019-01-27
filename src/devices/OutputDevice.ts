import {Gpio} from 'onoff';
import {promisify} from 'util';
import {Device, DeviceConfig} from './Device';

export interface OutputDeviceConfig extends DeviceConfig {
  activeLow? : boolean;
}

export class OutputDevice extends Device {
  private write : (value : number) => Promise<void>;

  constructor (options : OutputDeviceConfig) {
    const {activeLow = false, port} = options;
    super(options);

    // Initialize the output in the off state
    const direction = activeLow ? 'high' : 'low';
    const device = new Gpio(port, direction, {activeLow});
    this.write = promisify(device.write.bind(device));
  }

  public async off () : Promise<void> {
    return this.write(0);
  }

  public async on () : Promise<void> {
    return this.write(1);
  }
}
