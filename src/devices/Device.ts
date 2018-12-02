import assert from 'assert';
import {v4 as uuid} from 'uuid';

const NAME_PATTERN : RegExp = /^[A-Za-z0-9-_]+$/;

export interface DeviceConfig {
  name : string;
  port : number;
}

export abstract class Device {
  public readonly id : string;
  public readonly name : string;
  public readonly port : number;

  constructor (options : DeviceConfig) {
    assert(NAME_PATTERN.test(options.name), 'name must be an alphanumeric string');
    this.id = uuid();
    Object.assign(this, options);
  }
}
