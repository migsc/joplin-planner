import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

export type Day = dayjs.Dayjs;

export function day(value?: string | number | dayjs.Dayjs | Date): Day {
  return dayjs(value);
}

export function getRelativeDay(d: Day): string {
  const date = d.startOf("day");
  const today = day().startOf("day");
  const yesterday = today.subtract(1, "day");
  const tomorrow = today.add(1, "day");

  if (yesterday.diff(date, "day") === 0) {
    return "Yesterday";
  } else if (today.diff(date, "day") === 0) {
    return "Today";
  } else if (tomorrow.diff(date, "day") === 0) {
    return "Tomorrow";
  } else {
    return "";
  }
}

export type DayRange = {
  start: Day;
  end: Day;
  [Symbol.iterator](): {
    next(): {
      value: Day;
      done: boolean;
    };
  };
};

export function makeDayRange(start: Day, end: Day): DayRange {
  let currDay = start;

  return {
    start: start.startOf("day"),
    end: end.endOf("day"),
    [Symbol.iterator]() {
      return {
        next() {
          if (currDay.startOf("day").diff(end) >= 0) {
            return { value: undefined, done: true };
          }

          const value = currDay.clone();
          currDay = currDay.add(1, "day");
          return { value, done: false };
        },
      };
    },
  };
}
