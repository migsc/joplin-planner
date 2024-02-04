import { isEmpty } from "lodash";
import { Day, DayRange, day } from "../../calendar";
import * as projects from "./projects";
import { Project } from "./projects";
import { DayOfWeek } from "./projects/tag-dicts";
import { Task } from "./projects/tasks";
export { Project } from "./projects";

export function createSchedule(
  projects: Project[],
  range: DayRange
): ScheduleHash<Task[]> {
  const schedule = {};

  for (const project of projects) {
    populateSchedule(project, range, schedule);
  }

  console.debug(
    `agenda:models:generateSchedule: Schedule populated with all projects.`,
    schedule
  );

  return schedule;
}

export function populateSchedule(
  project: Project,
  range: DayRange,
  schedule: ScheduleHash<Task[]>
): void {
  for (const task of project.tasks) {
    const scheduleOfTask: ScheduleHash<Task> = {};

    console.debug(`agenda:models:populateSchedule`, schedule);
    scheduleTaskByChosenDate(scheduleOfTask, task, range);
    scheduleTaskByDayOfWeek(scheduleOfTask, task, range);
    scheduleTaskByFrequency(scheduleOfTask, task, range);

    for (const key in scheduleOfTask) {
      if (schedule[key]) {
        schedule[key].data.push(scheduleOfTask[key].data);
      } else {
        schedule[key] = {
          ...scheduleOfTask[key],
          data: [scheduleOfTask[key].data],
        };
      }
    }
  }

  for (const subProject of project.projects) {
    console.debug(
      `agenda:models:populateSchedule:${
        subProject.name
      }: Populating schedule with sub project tasks and date range from ${range.start.format(
        "MM/DD/YYYY"
      )} to ${range.end.format("MM/DD/YYYY")}...`
    );
    populateSchedule(subProject, range, schedule);
  }
}

export function scheduleTaskByChosenDate(
  scheduledDates: ScheduleHash<Task>,
  task: Task,
  range: DayRange
): ScheduleHash<Task> {
  task.note;

  for (const tag of task.note.tags) {
    const parsedDay = day(tag.title);
    if (!parsedDay.isValid()) continue;
    let chosenDate = parsedDay.startOf("day");

    // If we've already passed the chosen date, we'll schedule it for next year
    if (chosenDate && chosenDate.diff(range.start, "day") <= 0) {
      chosenDate = chosenDate.add(1, "year");
    }

    // Finally, we'll check if that date is within our date limit and then add the task to the schedule
    if (chosenDate && chosenDate.diff(range.end, "day") <= 0) {
      set(scheduledDates, chosenDate, task);
    }
  }

  return scheduledDates;
}

export function scheduleTaskByDayOfWeek(
  scheduledDates: ScheduleHash<Task>,
  task: Task,
  range: DayRange
): ScheduleHash<Task> {
  const { dayOfWeek } = task.taggedWith;

  if (!dayOfWeek.size) {
    return;
  }
  const currentDowNumber = range.start.day();

  for (const dow of dayOfWeek) {
    const dowNumber = dayOfWeekNumbers[dow];
    let chosenDayOfWeek: Day;

    if (currentDowNumber <= dowNumber) {
      chosenDayOfWeek = range.start.day(dowNumber);
    } else if (currentDowNumber > dowNumber) {
      chosenDayOfWeek = range.start.day(dowNumber).add(7, "days");
    }

    if (chosenDayOfWeek.diff(range.end, "day") <= 0) {
      console.debug(
        "agenda:models:scheduleTaskByDayOfWeek: Setting scheduled date for task: ",
        {
          task,
          chosenDayOfWeek,
        }
      );
      set(scheduledDates, chosenDayOfWeek, task);
    }
  }

  return scheduledDates;
}

export function scheduleTaskByFrequency(
  scheduledDates: ScheduleHash<Task>,
  task: Task,
  range: DayRange
): ScheduleHash<Task> {
  // We choose only the first frequency tag
  const freq = Array.from(task.taggedWith.frequency)?.[0];

  if (!freq) return scheduledDates;

  // If we haven't yet scheduled this task but we still have a frequency tag, then we'll use the created
  // date of the note to schedule the task
  if (isEmpty(scheduledDates)) {
    const createdDate = day(task.note.created_time);
    if (createdDate.diff(range.end, "day") <= 0) {
      set(scheduledDates, createdDate, task);
    }
  }

  // Finally we handle frequency by iteratively incrementing the scheduled dates we already have
  const startDates = Object.keys(scheduledDates).map((iso) => day(iso));
  for (const date of startDates) {
    let currentDate = date.startOf("day");

    switch (freq) {
      case "daily":
        while (currentDate.diff(range.end) <= 0) {
          currentDate = currentDate.add(1, "day");
          set(scheduledDates, currentDate, task);
        }
        break;
      case "weekly":
        while (currentDate.diff(range.end) <= 0) {
          currentDate = currentDate.add(7, "days");
          set(scheduledDates, currentDate, task);
        }
        break;
      case "monthly":
        while (currentDate.diff(range.end) <= 0) {
          currentDate = currentDate.add(1, "month");
          set(scheduledDates, currentDate, task);
        }
        break;
      case "yearly":
        while (currentDate.diff(range.end) <= 0) {
          currentDate = currentDate.add(1, "year");
          set(scheduledDates, currentDate, task);
        }
        break;
    }
  }

  return scheduledDates;
}

function set(scheduledDates: ScheduleHash<Task>, day: Day, task: Task): void {
  const key = day.format("YYYY-MM-DD");
  scheduledDates[key] = { data: task, day };
}

type ScheduleHash<D> = { [isoKey: string]: { data: D; day: Day } };

export default { projects };

const dayOfWeekNumbers: { [K in DayOfWeek]: number } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
