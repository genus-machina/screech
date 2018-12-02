import assert from 'assert';
import SunCalc from 'suncalc';

const ONE_DAY = 24 * 60 * 60 * 1000;  // 24 hours

export enum DailyTime {
  Dawn = 'dawn',
  Dusk = 'dusk',
  Sunrise = 'sunrise',
  Sunset = 'sunset'
}

export interface SchedulerConfig {
  latitude : number;
  longitude : number;
}

export class Scheduler {
  private config : SchedulerConfig;

  constructor (config : SchedulerConfig) {
    this.config = config;
  }

  at (time : Date, handler : () => void) : void {
    const now = new Date();
    const delta = time.getTime() - now.getTime();
    assert(delta >= 0, 'time cannot be in the past');
    setTimeout(handler, delta);
  }

  everyDayAt (time : DailyTime, handler : () => void) : void {
    const wrappedHandler = () => {
      handler();
      this.everyDayAt(time, handler);
    };

    const nextInvocation = this.next(time);
    this.at(nextInvocation, wrappedHandler);
  }

  private getTime (date : Date, time : DailyTime) : Date {
    const times = SunCalc.getTimes(date, this.config.latitude, this.config.longitude);
    return times[time];
  }

  next (time : DailyTime) : Date {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + ONE_DAY);
    const nextTime = this.getTime(now, time);

    if (nextTime <= now) {
      return this.getTime(tomorrow, time);
    }

    return nextTime;
  }
}
