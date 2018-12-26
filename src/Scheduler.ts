import assert from 'assert';
import random from 'lodash/random';
import SunCalc from 'suncalc';
import {Time} from './Time';

const ONE_DAY = 24 * 60 * 60 * 1000;  // 24 hours

export enum NamedTime {
  Dawn = 'dawn',
  Dusk = 'dusk',
  Sunrise = 'sunrise',
  Sunset = 'sunset'
}

export type RecurringTime = NamedTime | Time;
export type ScheduledHandler = () => void;

export interface SchedulerConfig {
  latitude : number;
  longitude : number;
}

function isNamedTime (value : NamedTime | Time) : value is NamedTime {
  return typeof value === 'string';
}

export class Scheduler {
  static delayedHandler (maxDelay : number, handler : ScheduledHandler) : ScheduledHandler {
    return function () {
      const delay = random(0, maxDelay);
      setTimeout(handler, delay);
    };
  }

  private config : SchedulerConfig;

  constructor (config : SchedulerConfig) {
    this.config = config;
  }

  at (time : Date, handler : ScheduledHandler) : void {
    const now = new Date();
    const delta = time.getTime() - now.getTime();
    assert(delta >= 0, 'time cannot be in the past');
    setTimeout(handler, delta);
  }

  everyDayAt (time : RecurringTime, handler : ScheduledHandler) : void {
    const wrappedHandler = () => {
      handler();
      this.everyDayAt(time, handler);
    };

    const nextInvocation = this.next(time);
    this.at(nextInvocation, wrappedHandler);
  }

  private getNextExplicitTime (now : Date, tomorrow : Date, time : Time) : Date {
    const nextTime = time.forDate(now);

    if (nextTime <= now) {
      return time.forDate(tomorrow);
    }

    return nextTime;
  }

  private getTime (date : Date, time : NamedTime) : Date {
    const times = SunCalc.getTimes(date, this.config.latitude, this.config.longitude);
    return times[time];
  }

  private getNextNamedTime (now : Date, tomorrow : Date, time : NamedTime) : Date {
    const nextTime = this.getTime(now, time);

    if (nextTime <= now) {
      return this.getTime(tomorrow, time);
    }

    return nextTime;
  }

  next (time : RecurringTime) : Date {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + ONE_DAY);

    if (isNamedTime(time)) {
      return this.getNextNamedTime(now, tomorrow, time);
    }

    return this.getNextExplicitTime(now, tomorrow, time);
  }
}
