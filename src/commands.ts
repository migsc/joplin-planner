import { isEmpty } from "lodash";
import {
  Agenda,
  ProjectTaskNode,
  ProjectTaskTree,
  addMutation,
  createTreeFromProjectTasks,
  loadCurrentProjects,
  persistMutations,
} from "./agenda";
import { Project, createSchedule } from "./agenda/models";
import { Frequency } from "./agenda/models/projects/tag-dicts";
import { Task } from "./agenda/models/projects/tasks";
import { Day, DayRange, day, makeDayRange } from "./calendar";
import { Note } from "./data";

export const command = {
  name: "generateSchedule",
  label: "Generate Schedule",
  iconName: "fa fa-calendar-week",
  execute,
};

async function execute(agenda: Agenda) {
  const projects = await loadCurrentProjects();

  console.log(`${command.name}: `, projects);
  let currDay = day().startOf("day"),
    cursor: Day;

  const thisWeekScheduleParams = {
    folderID: agenda.current.folder.id,
    projects,
    start: currDay.startOf("isoWeek"),
    end: (cursor = currDay.endOf("isoWeek")),
    renderTitle: (range: DayRange) =>
      `This Week (${range.start.format("MMM Do")} - ${range.end.format(
        "MMM Do"
      )})`,
  };
  if (agenda.current.folder.notes.length === 0) {
    addMutation({
      type: "create",
      resource: "notes",
      data: renderSchedule(thisWeekScheduleParams),
    });
  }

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("isoWeek")),
      renderTitle: (range: DayRange) =>
        `Next Week (${range.start.format("MMM Do")} - ${range.end.format(
          "MMM Do"
        )})`,
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("month")),
      renderTitle: (range: DayRange) =>
        `This Month (${range.start.format("MMM Do")} - ${range.end.format(
          "Do, YYYY"
        )})`,
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("month")),
      renderTitle: (range: DayRange) =>
        `Next Month (${range.start.format("MMM YYYY")})`,
      ...makeRenderersWithout(["daily"]),
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("quarter")),
      renderTitle: (range: DayRange) => {
        return `This Quarter (Q${Math.ceil(
          (range.start.month() + 1) / 3
        )} ${range.start.format("MMM")} - ${range.end.format("MMM YYYY")})`;
      },
      ...makeRenderersWithout(["daily", "weekly"]),
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("year")),
      renderTitle: (range: DayRange) => {
        return `This Year (${range.start.format("MMM")} - ${range.end.format(
          "MMM YYYY"
        )})`;
      },
      ...makeRenderersWithout(["daily", "weekly"]),
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").endOf("year")),
      renderTitle: (range: DayRange) => {
        return `Next Year (${range.start.format("YYYY")})`;
      },
      ...makeRenderersWithout(["daily", "weekly", "monthly"]),
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").add(3, "years").endOf("year")),
      renderTitle: (range: DayRange) => {
        return `Next 5 Years (${range.start.format(
          "YYYY"
        )} - ${range.end.format("YYYY")})`;
      },
      ...makeRenderersWithout(["daily", "weekly", "monthly", "yearly"]),
    }),
  });

  addMutation({
    type: "create",
    resource: "notes",
    data: renderSchedule({
      folderID: agenda.upcoming.folder.id,
      projects,
      start: cursor.add(1, "day"),
      end: (cursor = cursor.add(1, "day").add(4, "years").endOf("year")),
      renderTitle: (range: DayRange) => {
        return `Next 10 Years (${range.start.format(
          "YYYY"
        )} - ${range.end.format("YYYY")})`;
      },
      ...makeRenderersWithout(["daily", "weekly", "monthly", "yearly"]),
    }),
  });

  for (const note of agenda.upcoming.folder.notes) {
    addMutation({
      type: "delete",
      resource: "notes",
      data: { id: note.id },
    });
  }

  await persistMutations({
    reverse: true,
  });
}

type ScheduleRenderParams = {
  folderID: string;
  projects: Project[];
  start: Day;
  end: Day;
  renderTitle?: (range: DayRange) => string;
  renderSectionTitle?: (
    projectTree: ProjectTaskTree,
    day: Day,
    range: DayRange
  ) => string;
  renderContent?: (
    projectTree: ProjectTaskTree,
    project: Project,
    day: Day,
    range: DayRange
  ) => string;
};

function makeRenderersWithout(freqTags: Frequency[] = []) {
  function filterTree(tree: ProjectTaskTree) {
    return filterProjectTree(tree, (task) => {
      const { frequency } = task.taggedWith;

      return !freqTags.some((tag) => frequency.has(tag));
    });
  }

  return {
    renderSectionTitle(projectTree, day) {
      const filteredTree = filterTree(projectTree);

      if (isEmpty(filteredTree)) {
        return "";
      }

      return `\n## ${day.format("dddd")}, ${day.format("MMM Do YYYY")}\n`;
    },
    renderContent(projectTree, project) {
      const filteredTree = filterTree(projectTree);

      if (!filteredTree[project.folder.id]) return "";

      return renderProjectTasks({
        projectTree: filteredTree,
        project,
      });
    },
  };
}

function renderSchedule({
  folderID,
  projects,
  start,
  end,
  renderTitle = (range: DayRange) =>
    `Schedule for ${range.start.format("MM/DD/YYYY")} - ${range.end.format(
      "MM/DD/YYYY"
    )}`,
  renderSectionTitle = (
    projectTree: ProjectTaskTree,
    day: Day,
    dayRange: DayRange
  ) => `\n## ${day.format("dddd")}, ${day.format("MM/DD/YYYY")}\n`,
  renderContent = (projectTree, project, day, dayRange) =>
    renderProjectTasks({
      projectTree,
      project,
    }),
}: ScheduleRenderParams): Pick<Note, "parent_id" | "title" | "body"> {
  const range = makeDayRange(start, end);
  const schedule = createSchedule(projects, range);
  const note = {
    parent_id: folderID,
    title: renderTitle(range),
    body: "",
  };

  for (const aDay of range) {
    const scheduledTasks = schedule[aDay.format("YYYY-MM-DD")].data;
    const projectTree = createTreeFromProjectTasks(scheduledTasks);

    note.body += renderSectionTitle(projectTree, aDay, range);

    for (const project of projects) {
      if (!projectTree[project.folder.id]) {
        continue;
      }

      const node = projectTree[project.folder.id].data as {
        project: Project;
        type: "project";
      };

      /// otherwise we have a project with tasks scheduled for this day
      note.body += renderContent(projectTree, project, aDay, range);
    }
  }

  return note;
}

type ProjectRenderParams = {
  projectTree: ProjectTaskTree;
  project: Project;
  depth?: number;
  renderTaskGroup?: (depth: number, project: Project) => string;
  renderTask?: (depth: number, task: Task) => string;
};

function renderProjectTasks({
  projectTree,
  project,
  depth = 0,
  renderTaskGroup = (depth: number, project: Project) =>
    `${"\t".repeat(depth)}- [ ] [${
      project.name
    }](joplin://x-callback-url/openFolder?id=${project.folder.id})\n`,
  renderTask = (depth: number, task: Task) =>
    `${"\t".repeat(depth)}- [ ] [${
      task.name
    }](joplin://x-callback-url/openNote?id=${task.note.id})\n`,
}: ProjectRenderParams): string {
  let output = "";

  output += renderTaskGroup(depth, project);

  for (const edge of Array.from(projectTree[project.folder.id].edges)) {
    const node = projectTree[edge];
    if (node.data.type === "project") {
      output += renderProjectTasks({
        projectTree,
        project: node.data.project,
        depth: depth + 1,
      });
    } else if (node.data.type === "task") {
      output += renderTask(depth + 1, node.data.task);
    }
  }

  return output;
}

function filterProjectTree(
  projectTree: ProjectTaskTree,
  fn: (task: Task) => boolean
) {
  const filtered: ProjectTaskTree = {};

  for (const id in projectTree) {
    const node = projectTree[id];

    if (node.data.type === "task" && fn(node.data.task)) {
      filtered[id] = node;

      let childNode: ProjectTaskNode = node.data;
      let parent: Project = node.data.task.parent;

      while (parent) {
        const childId =
          childNode.type === "task"
            ? childNode.task.note.id
            : childNode.project.folder.id;

        if (!filtered[parent.folder.id]) {
          filtered[parent.folder.id] = {
            data: {
              type: "project",
              project: parent,
            },
            edges: new Set(),
          };
        }

        filtered[parent.folder.id].edges.add(childId);
        childNode = projectTree[parent.folder.id].data;
        parent = parent.parent;
      }
    }

    return filtered;
  }

  return filtered;
}
