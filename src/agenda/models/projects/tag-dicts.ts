import { Tag } from "src/data";

export function create(tags: Tag[]): TagDict {
  let frequency = new Set<Frequency>();
  let dayOfWeek = new Set<DayOfWeek>();
  let monthName = new Set<MonthName>();
  let dayNumber = new Set<DayNumber>();
  let yearNumber = new Set<YearNumber>();

  console.debug(
    `agenda:models:projects:tag-dics:create:${JSON.stringify(
      tags.map((t) => t.title)
    )}`
  );
  for (const tag of tags) {
    if (frequency.size === 0) {
      frequency = parseTextualTag(tag.title, frequencyPatterns);
    }

    let foundTags = parseTextualTag(tag.title, dayOfWeekPatterns);
    if (foundTags.size > 0) {
      dayOfWeek = new Set([
        ...dayOfWeek,
        ...parseTextualTag(tag.title, dayOfWeekPatterns),
      ]);
    }

    foundTags = parseTextualTag(tag.title, monthNamePatterns);
    if (foundTags.size > 0) {
      monthName = new Set([
        ...monthName,
        ...parseTextualTag(tag.title, monthNamePatterns),
      ]);
    }

    // dayNumber = parseNumericalTag<DayNumber>(tag.title, dayNumberPattern);
    // console.debug(
    //   `agenda:models:projects:tag-dics:create:${tag.title}: Parsed dayNumber: `,
    //   dayNumber
    // );
    // if (dayNumber.size) continue;

    // yearNumber = parseNumericalTag<YearNumber>(tag.title, yearNumberPattern);
    // console.debug(
    //   `agenda:models:projects:tag-dics:create::${tag.title}: Parsed yearNumber: `,
    //   yearNumber
    // );
    // if (yearNumber.size) continue;
  }

  return {
    frequency,
    monthName,
    dayOfWeek,
    dayNumber,
    yearNumber,
  };
}

export type TagDict = {
  frequency: Set<Frequency>;
  monthName: Set<MonthName>;
  dayOfWeek: Set<DayOfWeek>;
  dayNumber: Set<DayNumber>;
  yearNumber: Set<YearNumber>;
};

export function parseTextualTag(text: string, patterns: TextPatterns) {
  const set = new Set<string>();

  for (const key in patterns) {
    if (patterns[key][text]) {
      set.add(key);
    }
  }

  return set as Set<keyof typeof patterns>;
}

type TextPatterns =
  | typeof frequencyPatterns
  | typeof dayOfWeekPatterns
  | typeof monthNamePatterns;

export const frequencyPatterns: {
  [key in Frequency]: { [key: string]: true };
} = {
  daily: { daily: true, day: true },
  weekly: { weekly: true, week: true }, // replace with actual values
  monthly: { monthly: true, month: true }, // replace with actual values
  quarterly: { quarterly: true, quarter: true }, // replace with actual values
  yearly: { yearly: true, year: true }, // replace with actual values
};

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export const dayOfWeekPatterns: {
  [key in DayOfWeek]: { [key: string]: true };
} = {
  monday: { mon: true, monday: true },
  tuesday: { tue: true, tuesday: true },
  wednesday: { wed: true, wednesday: true },
  thursday: { thu: true, thursday: true },
  friday: { fri: true, friday: true },
  saturday: { sat: true, saturday: true },
  sunday: { sun: true, sunday: true },
};

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const monthNamePatterns: { [key in MonthName]: { [key: string]: true } } = {
  january: { january: true, jan: true },
  february: { february: true, feb: true },
  march: { march: true, mar: true },
  april: { april: true, apr: true },
  may: { may: true },
  june: { june: true, jun: true },
  july: { july: true, jul: true },
  august: { august: true, aug: true },
  september: { september: true, sep: true },
  october: { october: true, oct: true },
  november: { november: true, nov: true },
  december: { december: true, dec: true },
};

export type MonthName =
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december";

export function parseNumericalTag<T>(text: string, pattern: NumericPattern) {
  const set = new Set<T>();

  let match = pattern.exec(text);
  if (!match) return set;

  const number = parseInt(match[1], 10);
  if (!isNaN(number)) {
    set.add(number as T);
  }

  return set as Set<T>;
}

type NumericPattern = typeof dayNumberPattern | typeof yearNumberPattern;

export type DayNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;

const dayNumberPattern = /(3[01]|[12][0-9]|[1-9])(st|nd|rd|th)?\b/g;

export type YearNumber = number;

const yearNumberPattern = /2\d{3}\b/g;
