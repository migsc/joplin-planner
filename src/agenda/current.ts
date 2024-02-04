import data, { Folder } from "../data";
import { initializeProjectsFolder } from "./utils";

export async function load(rootFolder: Folder): Promise<{
  folder: Folder;
  projects: { folder: Folder; noteIDs: Set<string> };
}> {
  const currentAgendaFolder = await data.folders.getOrCreateByKey(
    "currentFolderID",
    () => ({
      parent_id: rootFolder.id,
      title: "2 - Current",
    }),
    {
      notes: true,
      // folders: true,
      // tags: true,
    }
  );

  const projectsFolder = await data.folders.getOrCreateByKey(
    "currentProjectsFolderID",
    initializeProjectsFolder(currentAgendaFolder),
    { folders: true, notes: true }
  );

  const ids = new Set<string>();
  function recordNoteIDs(folder: Folder) {
    if (folder?.notes?.length) {
      for (const note of folder.notes) {
        ids.add(note.id);
      }
    }

    if (folder?.folders?.length) {
      for (const subfolder of folder.folders) {
        recordNoteIDs(subfolder);
      }
    }
  }

  if (projectsFolder?.folders) {
    for (const folder of projectsFolder.folders) {
      recordNoteIDs(folder);
    }
  }

  return {
    folder: currentAgendaFolder,
    projects: {
      folder: projectsFolder,
      noteIDs: ids,
    },
  };
}

export async function loadProjectsFolder(
  rootFolder: Folder,
  folderParams = {
    notes: true,
    folders: true,
    tags: true,
  }
) {
  const currentAgendaFolder = await data.folders.getOrCreateByKey(
    "currentFolderID",
    () => ({
      parent_id: rootFolder.id,
      title: "2 - Current",
    })
  );

  console.debug(
    `agenda:projects:loadProjectsFolder: Loading current projects with params ${JSON.stringify(
      folderParams ?? {}
    )}`
  );
  const projectsFolder = await data.folders.getOrCreateByKey(
    "currentProjectsFolderID",
    initializeProjectsFolder(currentAgendaFolder),
    folderParams
  );

  return projectsFolder;
}
