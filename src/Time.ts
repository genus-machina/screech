const ONE_DAY = 24 * 60 * 60 * 1000;

export class Time {
  static parse (time : string) : Time {
    const rawDate = new Date(`1970-01-01T${time}Z`);

    if (isNaN(rawDate.valueOf())) {
      throw new Error('Invalid Date');
    }

    const localizedDate = new Date(rawDate.valueOf() + rawDate.getTimezoneOffset() * 60 * 1000);
    return new Time(localizedDate);
  }

  private date : Date

  private constructor (date : Date) {
    this.date = date;
  }

  forDate (date : Date) : Date {
    const time = Math.floor(date.valueOf() / ONE_DAY) * ONE_DAY + this.valueOf();
    return new Date(time);
  }

  valueOf () : number {
    return this.date.valueOf();
  }
}
