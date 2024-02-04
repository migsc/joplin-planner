import { Folder } from "src/data/folders";
import data from "../data";
import { initializeProjectsFolder } from "./utils";

export async function load(
  rootFolder: Folder
): Promise<{ folder: Folder; projects: { folder: Folder } }> {
  const pastAgendaFolder = await data.folders.getOrCreateByKey(
    "pastFolderID",
    () => ({
      parent_id: rootFolder.id,
      title: "3 - Past",
    })
    // {
    //   notes: true,
    //   folders: true,
    //   tags: true,
    // }
  );

  const projectsFolder = await data.folders.getOrCreateByKey(
    "pastProjectsFolderID",
    initializeProjectsFolder(pastAgendaFolder),
    {
      notes: true,
      folders: true,
      tags: true,
    }
  );

  return {
    folder: pastAgendaFolder,
    projects: {
      folder: projectsFolder,
    },
  };
}
