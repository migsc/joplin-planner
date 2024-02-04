import joplin from "api";
import { loadAgenda } from "./agenda";
import { command } from "./commands";

// #region main()
export default async function main() {
  console.debug(`${main.name}: Registering commands...`);
  await joplin.commands.register(command);
  console.debug(`${main.name}: Commands registered`);
  await loadAgenda().then((agenda) => {
    console.debug(`${main.name}: Agenda loaded`, agenda);
  });
}

joplin.workspace.onNoteChange(
  ({ id, event }: { id: string; event: ItemChangeEventType }) => {
    console.debug(
      "main:onNoteChange: Calling joplin.workspace.onNoteChange",
      id
    );

    console.debug("main:onNoteChange: Note change detected with id:", id);
    loadAgenda()
      .then((agenda) => {
        if (agenda.current.projects.noteIDs.has(id)) {
          return joplin.commands
            .execute("generateSchedule", agenda)
            .then(() => {
              console.debug("main:onNoteChange: Generated schedule.", id);
            });
        }

        return Promise.resolve();
      })
      .then(() => console.debug("main:onNoteChange: Done"));
  }
);
enum ItemChangeEventType {
  Create = 1,
  Update = 2,
  Delete = 3,
}
