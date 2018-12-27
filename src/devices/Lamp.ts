import {DeviceConfig} from './Device';
import {OutputDevice, OutputDeviceConfig} from './OutputDevice';

export class Lamp extends OutputDevice {
  constructor (config : DeviceConfig) {
    const outputConfig : OutputDeviceConfig = config;
    outputConfig.activeLow = true;
    super(outputConfig);
  }
}
