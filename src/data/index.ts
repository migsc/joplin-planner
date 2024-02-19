import * as folders from "./folders";
import * as notes from "./notes";
import * as tags from "./tags";
import * as settings from "./settings";
import * as sync from "./sync";
import { Page } from "./types";

const folderBySettings = {
  async getOrCreateByKey(
    settingsKey: settings.SettingsKey,
    bodyCallback: () => folders.CreateParams,
    opts?: { notes?: boolean; folders?: boolean; tags?: boolean }
  ): Promise<Folder> {
    try {
      console.log(
        `data.folders.getOrCreateByKey:${settingsKey} Attempting to query folder for key with opts ${JSON.stringify(
          opts ?? {}
        )}`
      );
      const folderData = await this.getByKey(settingsKey, opts);
      console.log(
        `data.folders.getOrCreateByKey:${settingsKey} Got folder data with:`,
        folderData
      );
      return folderData;
    } catch (err) {
      console.error(`data.folders.getOrCreateByKey:${settingsKey}`, err);
      if ((err.message as string).toLowerCase().includes("not found")) {
        const payload = bodyCallback();
        console.log(
          `data.folders.getOrCreateByKey:${settingsKey} Folder not found. Attempting to create it with payload:`,
          payload
        );
        const folderData = await folders.create(payload);
        console.log(
          `data.folders.getOrCreateByKey:${settingsKey} Updating setting value with folder ID: `,
          folderData.id
        );
        await settings.update(settingsKey, folderData.id);
        return folderData;
      } else {
        console.error(
          `data.folders.getOrCreateByKey:${settingsKey} Don't know how to handle this error`
        );
      }
    }
  },
  async getByKey(
    settingsKey: settings.SettingsKey,
    opts?: { notes?: boolean; folders?: boolean; tags?: boolean }
  ): Promise<Folder> {
    console.log(
      `data.folders.getByKey:${settingsKey} Query the settings key to get its value...`
    );
    const id = await settings.get(settingsKey);
    if (!id) {
      throw new Error(
        `data.folders.getByKey:${settingsKey} Not found. No value exists for settings key`
      );
    }
    console.log(`data.folders.getByKey:${settingsKey} Found value: ${id}`);

    console.log(
      `data.folders.getByKey:${settingsKey} Attempting to query folder by id: ${id}`
    );
    const folderData = await foldersWithNotes.get(id, opts);
    console.log(
      `data.folders.getByKey:${settingsKey} Found folder data with:`,
      folderData
    );

    return folderData;
  },
};

const foldersWithNotes = {
  async get(
    folderID: string,
    opts?: { folders?: boolean; notes?: boolean; tags?: boolean }
  ): Promise<Folder> {
    let folderData;
    // try {
    folderData = await folders.get(folderID);
    console.log(`data.folders.get:${folderID} Got result:`, folderData);
    // } catch (err) {
    //   console.error(`foldersWithNotes.get:${folderID} Error getting folder:`, err);
    // }
    if (!opts?.folders && !opts?.notes) return folderData;

    let subfoldersData: Page<Folder>;
    if (opts?.folders) {
      subfoldersData = await foldersWithNotes.getAll(folderData.id, opts);
    }

    let notesData: Page<Note>;
    if (opts?.notes) {
      notesData = await notesWithTags.getAll(folderData.id, opts);
    }

    return {
      ...folderData,
      folders: subfoldersData?.items,
      notes: notesData?.items,
    };
  },
  async getAll(
    parentID?: string,
    opts?: { folders?: boolean; notes?: boolean; tags?: boolean }
  ): Promise<Page<Folder>> {
    const folderData = await folders.getAll(parentID);

    const subfolderRequests: Array<Promise<Page<Folder>>> = [];
    if (opts?.folders) {
      for (const folder of folderData.items) {
        subfolderRequests.push(foldersWithNotes.getAll(folder.id, opts));
      }
    }

    const noteRequests: Array<Promise<Page<Note>>> = [];
    if (opts?.notes) {
      for (const folder of folderData.items) {
        noteRequests.push(notesWithTags.getAll(folder.id, opts));
      }
    }

    const [subfoldersData, notesData] = await Promise.all([
      Promise.all(subfolderRequests),
      Promise.all(noteRequests),
    ]);

    return {
      ...folderData,
      items: folderData.items.map((folder, index) => ({
        ...folder,
        folders: subfolderRequests.length
          ? subfoldersData[index].items
          : undefined,
        notes: noteRequests.length ? notesData[index].items : undefined,
      })),
    };
  },
};

export type Folder = folders.Folder & {
  folders?: Array<Folder>;
  notes?: Array<Note>;
};

const noteBySettings = {
  async getOrCreateByKey(
    settingsKey: settings.SettingsKey,
    bodyCallback: () => notes.CreateParams,
    opts?: { tags?: boolean }
  ): Promise<Note> {
    try {
      const noteData = await noteBySettings.getByKey(settingsKey, opts);
      return noteData;
    } catch (err) {
      const payload = bodyCallback();
      console.log(
        `data.notes.getByKey:${settingsKey}: Note not found. Attempting to create it with payload:`,
        payload
      );
      const noteData = await notes.create(payload);
      console.log(
        `data.notes.getByKey:${settingsKey}: Updating settings value with note ID: `,
        noteData.id
      );
      await settings.update(settingsKey, noteData.id);
      return noteData;
    }
  },
  async getByKey(
    settingsKey: settings.SettingsKey,
    opts?: { tags?: boolean }
  ): Promise<Note> {
    console.log(
      `data.notes.getByKey: Quering id value with settings key: ${settingsKey}`
    );
    const id = await settings.get(settingsKey);
    console.log(`data.notes.getByKey:${id} Attempting to query note`);
    const noteData = await notesWithTags.get(id, opts);
    console.log(`data.notes.getByKey:${id} Found note with:`, {
      settingsKey,
      id,
    });
    return noteData;
  },
};

const notesWithTags = {
  async get(noteID: string, opts?: { tags?: boolean }): Promise<Note> {
    const noteData = await notes.get(noteID);
    if (!opts?.tags) return noteData;

    const tagsData = await tags.getAll(noteID);
    return {
      ...noteData,
      tags: tagsData.items,
    };
  },
  async getAll(
    folderID: string,
    opts?: { tags?: boolean }
  ): Promise<Page<Note>> {
    console.log(
      `data.notes.getAll:${folderID} Querying notes in folder with options ${JSON.stringify(
        opts ?? {}
      )}`
    );
    const notesData = await notes.getAll(folderID);
    console.log(
      `data.notes.getAll:${folderID} Founds notes in folder with options ${JSON.stringify(
        opts ?? {}
      )}`
    );

    if (!opts?.tags) return notesData;

    const tagRequests: Array<Promise<Page<tags.Tag>>> = [];
    for (const note of notesData.items) {
      tagRequests.push(tags.getAll(note.id));
    }
    const tagsData = await Promise.all(tagRequests);

    return {
      ...notesData,
      items: notesData.items.map((note, index) => ({
        ...note,
        tags: tagsData[index].items,
      })),
    };
  },
};

export type Note = notes.Note & { tags?: Array<tags.Tag> };

export type Tag = tags.Tag;

export default {
  folders: {
    ...folders,
    ...foldersWithNotes,
    ...folderBySettings,
  },
  tags,
  notes: {
    ...notes,
    _delete: undefined,
    delete: notes._delete,
    ...notesWithTags,
    ...noteBySettings,
  },
  settings,
  sync,
};
