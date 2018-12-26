import anyTest, {TestInterface} from 'ava';
import sinon from 'sinon';
import {Time} from '../src';
import {SandboxTest, useSandbox} from './helpers/sandbox';

interface Context extends SandboxTest {
  getTimezoneOffset: sinon.SinonStub;
}

const test = anyTest as TestInterface<Context>;

useSandbox(test);

test.beforeEach(t => {
  const {sandbox} = t.context;
  t.context.getTimezoneOffset = sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(0);
});

test.serial('a valid time can be parsed', t => {
  t.is(Time.parse('00:00').valueOf(), 0);
  t.is(Time.parse('00:00:00').valueOf(), 0);
  t.is(Time.parse('00:00:00.000').valueOf(), 0);
  t.is(Time.parse('12:34:56.789').valueOf(), new Date('1970-01-01T12:34:56.789Z').valueOf());
});

test.serial('parsed times are relative to the local timezone', t => {
  const {getTimezoneOffset} = t.context;
  const offset = 300; // 5 hours
  getTimezoneOffset.returns(offset);

  t.is(Time.parse('00:00').valueOf(), offset * 60 * 1000);
  t.is(Time.parse('12:34:56.789').valueOf(), new Date('1970-01-01T17:34:56.789Z').valueOf());
});

test.serial('parsing an invalid time fails', t => {
  t.throws(() => Time.parse('foo'), 'Invalid Date');
});

test.serial('getting a time for a date returns a Date', t => {
  const expectedDate = new Date('2018-12-25T12:00:00.000Z');
  const targetDate = new Date('2018-12-25');
  const time = Time.parse('12:00');
  t.deepEqual(time.forDate(targetDate), expectedDate);
});
