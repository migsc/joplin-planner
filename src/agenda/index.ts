import data, { Folder, Note } from "../data";
import * as current from "./current";
import models, { Project } from "./models";
import { Task } from "./models/projects/tasks";
import * as past from "./past";
import * as upcoming from "./upcoming";

let rootFolder: Folder,
  agenda: Agenda,
  lookup: AgendaLookup = {
    projects: {},
    tasks: {},
    folders: {},
  };

export async function loadAgenda(): Promise<Agenda> {
  console.debug("agenda:loadAgenda: Loading agenda...");
  rootFolder = await data.folders.getOrCreateByKey(
    "rootFolderID",
    initializeRootFolder
  );
  console.debug("agenda:loadAgenda: Loaded root folder: ", rootFolder);

  const [upcomingAgenda, currentAgenda, pastAgenda] = await Promise.all([
    upcoming.load(rootFolder),
    current.load(rootFolder),
    past.load(rootFolder),
  ]);

  agenda = {
    upcoming: upcomingAgenda,
    current: currentAgenda,
    past: pastAgenda,
  };

  // populateLookup();

  return agenda;
}

export async function loadCurrentProjects(): Promise<Project[]> {
  rootFolder = await data.folders.getOrCreateByKey(
    "rootFolderID",
    initializeRootFolder
  );

  const projectsFolder = await current.loadProjectsFolder(rootFolder);
  const projects = models.projects.parseAll(projectsFolder);

  return projects;
}

export function getAgenda() {
  return agenda;
}

export function setAgenda(newAgenda: Agenda) {
  agenda = newAgenda;
  // populateLookup();
}

type AgendaLookup = {
  projects: { [key: string]: Project };
  folders: { [key: string]: Folder };
  tasks: { [key: string]: Task };
};

export function getProjectByID(id: string): Project {
  return lookup.projects[id];
}

export function getTaskByID(id: string): Task {
  return lookup.tasks[id];
}

// creates a tree from the bottom up
export function createTreeFromProjectTasks(tasks: Task[]): ProjectTaskTree {
  const tree: ProjectTaskTree = {};
  for (const task of tasks) {
    tree[task.note.id] = {
      data: { type: "task", task },
      edges: new Set<string>(),
    };

    updateProjectTreeWith(tree, task.parent, [task.note.id]);
  }

  return tree;
}

function updateProjectTreeWith(
  tree: ProjectTaskTree,
  project: Project,
  edges: string[] = []
) {
  if (!project) return;

  if (!tree[project.folder.id]) {
    tree[project.folder.id] = {
      data: { type: "project", project },
      edges: new Set(edges),
    };
  }

  for (const edge of edges) {
    tree[project.folder.id].edges.add(edge);
  }

  updateProjectTreeWith(tree, project.parent, [project.folder.id]);
}

export type ProjectTaskNode =
  | { project: Project; type: "project" }
  | { task: Task; type: "task" };
export type ProjectTaskTree = Tree<ProjectTaskNode>;

type Tree<D> = {
  [id: string]: {
    data: D;
    edges: Set<string>;
  };
};

let mutations: AgendaMutation[] = [];

export function addMutation(params: AgendaMutation) {
  mutations.push(params);
}

const batchAmount = 10;

export async function persistMutations({
  reverse = false,
}: {
  reverse?: boolean;
}): Promise<void> {
  let requests = [],
    responses = [];

  if (reverse) {
    mutations.reverse();
  }

  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i];

    if (requests.length % batchAmount === 0) {
      responses = [...responses, ...(await Promise.all(requests))];
      requests = [];
    }

    let req;
    switch (mutation.type) {
      case "create":
        if (mutation.resource === "notes") {
          req = data[mutation.resource].create(mutation.data);
        } else {
          req = data[mutation.resource].create(mutation.data);
        }
        break;
      case "update":
        req = data[mutation.resource][mutation.type](
          mutation.data.id,
          mutation.data
        );
        break;
      case "delete":
        req = data[mutation.resource].delete(mutation.data.id);
        break;
      default:
        console.error(
          `agenda:persistMutations: Unsupported mutation type.`,
          mutation
        );
        throw new Error(`Unsupported mutation type.`);
    }

    requests.push(req);
  }

  responses = [...responses, ...(await Promise.all(requests))];
  console.log("agenda:persistMutations:responses: ", responses);
  const values = [];
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const mutation = mutations[i];

    if (mutation.type === "delete") {
      continue;
    }

    if (response?.id) {
      values.push({
        id: response.id,
        resource: mutation.resource,
        type: mutation.type,
      });
    }
  }

  mutations = [];
}

type CreateMutation<R, D> = {
  type: "create";
  resource: R;
  data: D;
};

type UpdateMutation<R, D> = {
  type: "update";
  resource: R;
  data: D;
};

type DeleteMutation<R, D> = {
  type: "delete";
  resource: R;
  data: D;
};

type AgendaMutation =
  | CreateMutation<"notes", Pick<Note, "parent_id" | "title" | "body">>
  | CreateMutation<"folders", Pick<Folder, "parent_id" | "title">>
  | UpdateMutation<"notes", Pick<Note, "id" | "title" | "body" | "tags">>
  | UpdateMutation<"folders", Pick<Folder, "id" | "title">>
  | DeleteMutation<"notes", Pick<Note, "id">>
  | DeleteMutation<"folder", Pick<Folder, "id">>;

export type Agenda = {
  upcoming: { folder: Folder; projects: { folder: Folder } };
  current: {
    folder: Folder;
    projects: { folder: Folder; noteIDs: Set<string> };
  };
  past: { folder: Folder; projects: { folder: Folder } };
};

function initializeRootFolder() {
  return { parent_id: "", title: "Plans" };
}
