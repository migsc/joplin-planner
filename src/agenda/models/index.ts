import { isEmpty } from "lodash";
import { Day, DayRange, day } from "../../calendar";
import * as projects from "./projects";
import { Project } from "./projects";
import { DayOfWeek, Frequency } from "./projects/tag-dicts";
import { Task } from "./projects/tasks";
import { QUnitType } from "dayjs";
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

const dueDatePattern = /@due([^@\n]*)/g;

export function populateSchedule(
  project: Project,
  range: DayRange,
  schedule: ScheduleHash<Task[]>
): void {
  const currentDowNumber = range.start.day();

  console.debug("agenda:models:populateSchedule:enter", {
    project,
    range,
    schedule,
    currentDowNumber,
  });

  for (const task of project.tasks) {
    const scheduleOfTask: ScheduleHash<Task> = {};

    // console.debug(`agenda:models:populateSchedule`, schedule);
    // scheduleTaskByChosenDate(scheduleOfTask, task, range);
    // scheduleTaskByDayOfWeek(scheduleOfTask, task, range);
    // scheduleTaskByFrequency(scheduleOfTask, task, range);

    // Find matches in the note body for the due date pattern within the body of the note
    let match;
    const taskStartingDates = [];
    while ((match = dueDatePattern.exec(task.note.body)) !== null) {
      const matchText = match[1].trim();
      const parsedDay = day(matchText.trim());
      console.debug("agenda:models:populateSchedule:parsedDay", {
        match,
        matchText,
        parsedDay,
        "parsedDay.isValid()": parsedDay.isValid(),
        task,
      });
      if (!parsedDay.isValid()) {
        continue;
      }

      if (parsedDay.diff(range.start, "day") < 0) {
        continue;
      }

      if (parsedDay.diff(range.end, "day") > 0) {
        continue;
      }

      taskStartingDates.push(parsedDay);
      set(scheduleOfTask, parsedDay, task);
    }

    // Parse the day of week tags
    for (const dow of task.taggedWith.dayOfWeek) {
      const dowNumber = dayOfWeekNumbers[dow];
      const chosenDayOfWeek = range.start
        .day(dowNumber)
        .add(currentDowNumber > dowNumber ? 7 : 0, "days");

      if (chosenDayOfWeek.diff(range.end, "day") <= 0) {
        set(scheduleOfTask, chosenDayOfWeek, task);
        taskStartingDates.push(chosenDayOfWeek);
      }
    }

    // Parse frequency tags
    const freq = Array.from(task.taggedWith.frequency)?.[0];
    if (freq) {
      // Finally we handle frequency by iteratively incrementing the scheduled dates we already have
      // const startDates = Object.keys(scheduleOfTask).map((iso) => day(iso));
      if ("save money" === task.name) {
        console.debug("agenda:models:populateSchedule:save money", {
          task,
          freq,
          taskStartingDates,
          range,
          scheduleOfTask,
        });
      }

      if (freq === "monthly" && taskStartingDates.length === 0) {
        if (range.start.day() === 1) {
          taskStartingDates.push(range.start);
        } else {
          taskStartingDates.push(
            range.start.startOf("month").add(1, "month").startOf("month")
          );
        }
      }

      if (freq === "weekly" && taskStartingDates.length === 0) {
        if (range.start.startOf("week").diff(range.start, "day") === 0) {
          taskStartingDates.push(range.start);
        } else if (
          range.start.add(1, "week").startOf("week").diff(range.end, "day") <= 0
        ) {
          taskStartingDates.push(range.start.add(1, "week").startOf("week"));
        }
      }

      for (const date of taskStartingDates) {
        set(scheduleOfTask, date, task);
        let currentDate = date.startOf("day");

        while (currentDate.diff(range.end) <= 0) {
          const unit = freqUnitDict[freq] as QUnitType; // TODO we have to patch moment's QUnitType somehow to allow 'week'
          currentDate = currentDate.add(1, unit);
          set(scheduleOfTask, currentDate, task);
        }
      }
    }

    // ....
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
    populateSchedule(subProject, range, schedule);
  }
}

const freqUnitDict: { [key in Frequency]: QUnitType | "week" } = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

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
