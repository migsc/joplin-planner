import joplin from "api";
import { SettingItemType } from "api/types";

export async function get<V = string>(key: SettingsKey): Promise<V> {
  // if (lookup[key]) return lookup[key];
  return joplin.settings.value(key);
}

export async function update<V = string>(
  key: SettingsKey,
  value: V
): Promise<void> {
  await joplin.settings.setValue(key, value);
  // lookup[key] = await joplin.settings.value(key);
}

joplin.settings.onChange(async (event) => {
  for (const key of event.keys) {
    console.info("joplin.settings.onChange: Value changed for key: " + key);
    // lookup[key] = await joplin.settings.value(key);
  }
});

// export const lookup: { [key: string]: any } = {};

export type SettingsKey = keyof typeof options;

export const sectionName = "agenda";

export const section = {
  label: "Planner",
  iconName: "fa fa-check",
  name: "Planner",
  description: "",
};

export const options = {
  rootFolderID: {
    label: "Root Level Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  // Upcoming
  upcomingFolderID: {
    label: "Upcoming Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  upcomingProjectsFolderID: {
    label: "Upcoming Projects Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  // Current
  currentFolderID: {
    label: "Current Folder ID",
    description: "",
    value: "pluginsagendacurrentfolder",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  currentProjectsFolderID: {
    label: "Current Projects Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  // Past
  pastFolderID: {
    label: "Past Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
  pastProjectsFolderID: {
    label: "Past Projects Folder ID",
    description: "",
    value: "",
    type: SettingItemType.String,
    public: true,
    section: sectionName,
  },
};
