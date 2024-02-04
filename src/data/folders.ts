import joplin from "api";
import { Page } from "./types";

export async function create(body: CreateParams): Promise<Folder> {
  return joplin.data.post(["folders"], null, body);
}

export async function get(id: string): Promise<Folder> {
  return joplin.data.get(["folders", id]);
}

export async function getAll(parentID?: string): Promise<Page<Folder>> {
  const response: Page<Folder> = await joplin.data.get(["folders"]);
  if (!parentID) return response;

  if (cache[parentID]) return cache[parentID];

  setCache(parentID, {
    ...response,
    items: response.items.filter((folder) => folder.parent_id === parentID),
  });

  return {
    // we spread here to clone the object in cache, rather than return a reference which will dissapear after it expires
    ...cache[parentID],
  };
}

function setCache(key: string, value: Page<Folder>) {
  cache[key] = value;
  setTimeout(() => {
    cache[key] = undefined;
  }, 1000);
}

const cache: { [key: string]: Page<Folder> } = {};

export type CreateParams = Omit<Folder, "id">;

export type Folder = {
  id: string;
  parent_id: string;
  title: string;
};
