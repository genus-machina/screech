import anyTest, {TestInterface} from 'ava';
import {NamedTime, Scheduler, SchedulerConfig, Time} from '../src';
import SunCalc from 'suncalc';
import sinon from 'sinon';
import {useSandbox} from './helpers/sandbox';

interface Context {
  config : SchedulerConfig;
  sandbox : sinon.SinonSandbox;
  scheduler : Scheduler;
};

const test  = anyTest as TestInterface<Context>;

useSandbox(test);

test.beforeEach(t => {
  const config = {
    latitude: 0,
    longitude: 0
  };

  t.context.config = config;
  t.context.scheduler = new Scheduler(config);
});

test.serial('#at schedules an action at the specified time', t => {
  const {sandbox, scheduler} = t.context;
  const clock = sandbox.useFakeTimers(0);
  const delta = 100;
  const stub = sandbox.stub();
  const time = new Date(delta);

  scheduler.at(time, stub);
  sinon.assert.notCalled(stub);

  clock.tick(delta);
  sinon.assert.calledOnce(stub);
  sinon.assert.calledWithExactly(stub);
});

test.serial('#at fails if the time is in the past', t => {
  const {sandbox, scheduler} = t.context;
  sandbox.useFakeTimers(0);

  const stub = sandbox.stub();
  const time = new Date(-1);
  t.throws(() => scheduler.at(time, stub), /in the past/);
  sinon.assert.notCalled(stub);
});

test.serial('#next returns the next occurence of the named time', t => {
  const {config, sandbox, scheduler} = t.context;

  const getTimes = sandbox.spy(SunCalc, 'getTimes');
  const now = new Date('2018-12-25T12:00:00Z');
  sandbox.useFakeTimers(now.getTime());

  const dawn = scheduler.next(NamedTime.Dawn);
  const dusk = scheduler.next(NamedTime.Dusk);
  const sunrise = scheduler.next(NamedTime.Sunrise);
  const sunset = scheduler.next(NamedTime.Sunset);

  t.true(dawn > now);
  t.true(dawn > dusk);
  t.true(dawn < sunrise);

  t.true(dusk > now);
  t.true(dusk > sunset);
  t.true(dusk < dawn);

  t.true(sunrise > now);
  t.true(sunrise > dawn);

  t.true(sunset > now);
  t.true(sunset < dusk);
  t.true(sunset < dawn);

  sinon.assert.called(getTimes);
  sinon.assert.alwaysCalledWithExactly(getTimes, sinon.match.date, config.latitude, config.longitude);
});

test.serial('#next returns the next occurrence of a specific time', t => {
  const {sandbox, scheduler} = t.context;
  // Simulate UTC timezone
  sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(0);

  const now = new Date('2018-12-25T12:00:00Z');
  const tomorrow = new Date('2018-12-26T00:00:00Z');
  sandbox.useFakeTimers(now.getTime());

  const morning = scheduler.next(Time.parse('07:00'));
  const night = scheduler.next(Time.parse('19:00'));

  t.true(morning > now);
  t.true(morning > tomorrow);

  t.true(night > now);
  t.true(night < tomorrow);
});

test.serial('#everyDayAt schedules a daily action at the specified time', t => {
  const {sandbox, scheduler} = t.context;
  const delta = 12 * 60 * 60 * 1000;  // 12 hours
  const now = new Date('2018-12-25T12:00:00Z');
  const clock = sandbox.useFakeTimers(now.getTime());
  const stub = sandbox.stub();

  scheduler.everyDayAt(NamedTime.Sunrise, stub);
  sinon.assert.notCalled(stub);

  for (let i = 1; i < 10; i++) {
    clock.tick(delta);
    sinon.assert.callCount(stub, Math.floor(i / 2));
  }
});

test.serial('#randomlyDelay creates a handler with a random delay', t => {
  const {sandbox} = t.context;
  const clock = sandbox.useFakeTimers(0);
  const maxDelay = 100000;
  const stub = sandbox.stub();

  const handler = Scheduler.delayedHandler(maxDelay, stub);
  handler();
  sinon.assert.notCalled(stub);

  clock.next();

  const first = Date.now();
  sinon.assert.calledOnce(stub);
  sinon.assert.calledWithExactly(stub);
  t.true(first >= 0 && first <= maxDelay);

  handler();
  sinon.assert.calledOnce(stub);

  clock.next();

  const second = Date.now();
  const delta = second - first;
  sinon.assert.calledTwice(stub);
  t.true(delta >= 0 && delta <= maxDelay);
  t.not(delta, first);
});
