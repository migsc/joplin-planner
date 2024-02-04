import { Day, getRelativeDay } from "../calendar";
import { Folder } from "../data";

export function initializeProjectsFolder(
  parentFolder: Folder
): () => Pick<Folder, "parent_id" | "title"> {
  return () => ({
    parent_id: parentFolder.id,
    title: "Projects",
  });
}
