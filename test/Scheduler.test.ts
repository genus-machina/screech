import anyTest, {TestInterface} from 'ava';
import {DailyTime, Scheduler, SchedulerConfig} from '../src';
import SunCalc from 'suncalc';
import sinon from 'sinon';
import {useSandbox} from './helpers/sandbox';

const ONE_DAY = 24 * 60 * 60 * 1000;

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

  const now = new Date('2018-12-25T12:00:00Z');
  const clock = sandbox.useFakeTimers(now.getTime());
  const getTimes = sandbox.spy(SunCalc, 'getTimes');

  const dawn = scheduler.next(DailyTime.Dawn);
  const dusk = scheduler.next(DailyTime.Dusk);
  const sunrise = scheduler.next(DailyTime.Sunrise);
  const sunset = scheduler.next(DailyTime.Sunset);

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

test.serial('#everyDayAt schedules a daily action at the named time', t => {
  const {sandbox, scheduler} = t.context;
  const delta = 12 * 60 * 60 * 1000;  // 12 hours
  const now = new Date('2018-12-25T12:00:00Z');
  const clock = sandbox.useFakeTimers(now.getTime());
  const stub = sandbox.stub();

  scheduler.everyDayAt(DailyTime.Sunrise, stub);
  sinon.assert.notCalled(stub);

  for (let i = 1; i < 10; i++) {
    clock.tick(delta);
    sinon.assert.callCount(stub, Math.floor(i / 2));
  }
});
