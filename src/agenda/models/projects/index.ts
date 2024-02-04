import { Folder } from "src/data";
import * as tasks from "./tasks";

export function parseAll(folder: Folder): Project[] {
  console.log(
    `agenda:models:projects:parseAll:${folder.id} Parsing projects from "${folder.title}" folder`
  );
  const projects = [];

  for (const projectFolder of folder.folders) {
    projects.push(parse(projectFolder));
  }

  return projects;
}

export function parse(folder: Folder, parent?: Project): Project {
  console.log(
    `agenda:models:projects:parse:${folder.id} Parsing project from "${folder.title}" folder`
  );

  const project: Project = {
    parent,
    name: folder.title,
    projects: [],
    folder,
    tasks: [],
  };

  project.tasks = folder.notes.map((note) => tasks.parse(note, project));

  for (const projectSubFolder of folder.folders ?? []) {
    // console.log(
    //   `agenda:models:projects:parse:${projectSubFolder.id} Parsing sub project from sub folder "${projectSubFolder.title}" folder`
    // );

    project.projects.push(parse(projectSubFolder, project));
  }

  return project;
}

export type Project = {
  name: Folder["title"];
  folder: Folder;
  tasks: tasks.Task[];
  parent?: Project;
  projects: Project[];
};
