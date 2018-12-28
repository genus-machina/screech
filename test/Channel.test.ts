import anyTest, {TestInterface} from 'ava';
import {createSocket, Socket} from 'dgram';
import {Channel} from '../src';
import {useSandbox, SandboxTest} from './helpers/sandbox';

interface Context extends SandboxTest {
  left : Channel;
  right : Channel;
}

const test = anyTest as TestInterface<Context>;

useSandbox(test);

test.beforeEach(async t => {
  const peers = ['127.0.0.1'];
  const left = new Channel({peers, port: 0});
  await left.open();

  const right = new Channel({peers, port: left.port()});
  await right.open();

  t.context.left = left;
  t.context.right = right;
});

test.afterEach(async t => {
  const {left, right} = t.context;
  try {
    await left.close();
    await right.close();
  } catch (error) {
    // do nothing
  }
});

test('a channel can send/receive messages', async t => {
  const {left, right} = t.context;
  const message = {content: 'hello!'};

  const promise = new Promise<void>(resolve => {
    right.on('message', (received, info) => {
      const expectedInfo = {
        address: '127.0.0.1',
        family: 'IPv4',
        port: left.port(),
        size: JSON.stringify(message).length
      };

      t.deepEqual(received, message);
      t.deepEqual(info, expectedInfo);
      resolve();
    });
  });

  left.send(message);
  return promise;
});

test('when a malformed message is received an error is emitted', async t => {
  const {left, right} = t.context;
  const message = 'foo';

  await right.close();

  const promise = new Promise<void>(resolve => {
    left.on('error', error => {
      t.true(error instanceof Error);
      t.regex(error.message, /Failed to parse message/);
      resolve();
    });
  });

  const socket = createSocket('udp4');
  socket.send(message, left.port());
  return promise;
});

test.serial('socket errors are emitted on the channel', async t => {
  const {left, sandbox} = t.context;
  const failure = new Error('simulated failure');

  const promise = new Promise<void>(resolve => {
    left.on('error', error => {
      t.is(error, failure);
      resolve();
    });
  });

  sandbox.stub(Socket.prototype, 'send').callsFake(function (this : Socket) {
    this.emit('error', failure);
  });
  left.send({});
  return promise;
});
