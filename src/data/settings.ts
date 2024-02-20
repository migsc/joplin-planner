import joplin from "api";
import { SettingItemType, SettingItem } from "api/types";

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

export type SettingsKey = keyof typeof options;

export const sectionName = "agenda";

export const section = {
  label: "Planner",
  iconName: "fa fa-check",
  name: "Planner",
  description: "",
};

const rootFolderID: SettingItem = {
  label: "Root Level Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const upcomingFolderID: SettingItem = {
  label: "Upcoming Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const upcomingProjectsFolderID: SettingItem = {
  label: "Upcoming Projects Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const currentFolderID: SettingItem = {
  label: "Current Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const currentProjectsFolderID: SettingItem = {
  label: "Current Projects Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const pastFolderID: SettingItem = {
  label: "Past Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const pastProjectsFolderID: SettingItem = {
  label: "Past Projects Folder ID",
  description: "",
  value: "",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
};

const firstDayOfWeek: SettingItem = {
  isEnum: true,
  label: "First day of the week",
  description:
    "Choose the day which your weeks start on for planning purposes.",
  value: "Monday",
  type: SettingItemType.String,
  public: true,
  section: sectionName,
  options: {
    Sunday: "Sunday",
    Monday: "Monday",
  },
};

export const options = {
  rootFolderID,
  upcomingFolderID,
  upcomingProjectsFolderID,
  currentFolderID,
  currentProjectsFolderID,
  pastFolderID,
  pastProjectsFolderID,
  firstDayOfWeek,
};
