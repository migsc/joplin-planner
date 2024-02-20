import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isYesterday from "dayjs/plugin/isYesterday";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(isYesterday);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(updateLocale);

export function updateLocales(params: any) {
  for (const lang of navigator.languages) {
    dayjs.updateLocale(lang, params);
  }
}

export type Day = dayjs.Dayjs;

export function day(value?: string | number | dayjs.Dayjs | Date): Day {
  return dayjs(value);
}

export function getRelativeDay(d: Day): string {
  const date = d.startOf("day");

  if (date.isYesterday()) {
    return "Yesterday";
  } else if (date.isToday()) {
    return "Today";
  } else if (date.isTomorrow()) {
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
