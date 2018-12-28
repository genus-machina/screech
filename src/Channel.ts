import assert from 'assert';
import {createSocket, RemoteInfo, Socket} from 'dgram';
import {EventEmitter} from 'events';
import {AddressInfo} from 'net';

export interface ChannelConfig {
  peers : Array<string>;
  port : number;
}

export class Channel extends EventEmitter {
  private config : ChannelConfig;
  private socket : Socket | null;

  constructor (config : ChannelConfig) {
    super();
    this.config = config;
    this.socket = null;
  }

  async close () : Promise<void> {
    return new Promise<void>(resolve => {
      assert.ok(this.socket, 'channel is not open');
      const socket = this.socket!;
      this.socket = null;
      socket.close(resolve);
    });
  }

  async open () : Promise<void> {
    assert.strictEqual(this.socket, null, 'channel is already open');

    this.socket = createSocket({
      type: 'udp4',
      reuseAddr: true
    });

    this.socket.on('message', (data, info) => this.receive(data, info));
    this.socket.on('error', (error) => this.emit('error', error));

    return new Promise<void>(resolve => {
      const socket = this.socket!;
      socket.bind(this.config.port, () => {
        const address = socket.address() as AddressInfo;
        this.config.port = address.port;
        resolve();
      });
    });
  }

  port () : number {
    return this.config.port;
  }

  private receive (data : Buffer, info : RemoteInfo) {
    let message;

    try {
      message = JSON.parse(data.toString('utf8'));
    } catch (error) {
      const parseError = new Error(`Failed to parse message: ${error.message}`);
      this.emit('error', parseError);
    }

    this.emit('message', message, info);
  }

  send (message : object) {
    assert.ok(this.socket, 'channel is not open');
    const payload = JSON.stringify(message);
    const socket = this.socket!;

    for (const peer of this.config.peers) {
      socket.send(payload, this.config.port, peer);
    }
  }
}
