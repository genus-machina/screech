import {TestInterface} from 'ava';
import {Device, DeviceConfig} from '../../../src';

type DeviceFactory = (config : DeviceConfig) => Device;
type DeviceTest = TestInterface<DeviceConfig>;

export function testDeviceInterface (test : DeviceTest, deviceFactory : DeviceFactory) : void {
  test.serial('is a Device', t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    t.true(device instanceof Device);
  });

  test.serial('has an ID', t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    t.truthy(device.id);
  });

  test.serial('has a name', t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    t.is(device.name, name);
  });

  test.serial('name can only include alpha numeric characters', t => {
    const {port} = t.context;
    t.throws(() => deviceFactory({name: 'test device', port}));
    t.throws(() => deviceFactory({name: 'te$t-device', port}));
    t.notThrows(() => deviceFactory({name: 'test-device', port}));
    t.notThrows(() => deviceFactory({name: 'test_device', port}));
  });

  test.serial('has a port', t => {
    const {name, port} = t.context;
    const device = deviceFactory({name, port});
    t.is(device.port, port);
  });
}
