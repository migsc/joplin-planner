import joplin from "api";
import { Page } from "./types";

export async function getAll(noteID?: string): Promise<Page<Tag>> {
  if (noteID) return joplin.data.get(["notes", noteID, "tags"], { fields });

  return joplin.data.get(["tags"], { fields });
}

const fields = "id,parent_id,title";

export type Tag = {
  id: string;
  parent_id: string;
  title: string;
};
