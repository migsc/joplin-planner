import { Note } from "src/data";
import * as tagDicts from "./tag-dicts";
import { Project } from ".";

export function parse(note: Note, project: Project): Task {
  console.debug(`agenda:models:tasks:parse: Parsing task named "${note.title}" under project "${project.name}" with tags: `, note.tags)
  return {
    parent: project,
    name: note.title,
    note,
    taggedWith: tagDicts.create(note.tags),
  };
}

export type Task = {
  parent: Project;
  name: Note["title"];
  note: Note;
  taggedWith: tagDicts.TagDict;
};
