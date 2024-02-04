import data, { Folder } from "../data";
import { initializeProjectsFolder } from "./utils";

export async function load(
  rootFolder: Folder
): Promise<{ folder: Folder; projects: { folder: Folder } }> {
  console.debug(`agenda.upcoming.load: Initializing upcoming folder...`);
  const upcomingTasksFolder = await data.folders.getOrCreateByKey(
    "upcomingFolderID",
    () => ({
      parent_id: rootFolder.id,
      title: "1 - Upcoming",
    }),
    {
      notes: true,
      // folders: true,
      // tags: true,
    }
  );
  console.debug(
    `agenda.upcoming.load: Upcoming folder initialized`,
    upcomingTasksFolder
  );

  console.debug(
    `agenda.upcoming.load: Initializing upcoming projects folder...`
  );
  const projectsFolder = await data.folders.getOrCreateByKey(
    "upcomingProjectsFolderID",
    initializeProjectsFolder(upcomingTasksFolder),
    {
      // notes: true,
      // folders: true,
      // tags: true,
    }
  );

  return {
    folder: upcomingTasksFolder,
    projects: {
      folder: projectsFolder,
    },
  };
}
