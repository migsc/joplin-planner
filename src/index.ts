import joplin from "api";
import data from "./data";
import main from "./main";
import { updateLocales } from "./calendar/models/day";

joplin.plugins.register({
  onStart: async () => {
    try {
      console.debug("joplin.plugins.register:onStart: Plugin started!");
      await joplin.settings.registerSection(
        data.settings.sectionName,
        data.settings.section
      );

      await joplin.settings.registerSettings(data.settings.options);

      await handleSettingsUpdate();

      console.debug("joplin.plugins.register:onStart: Settings registered!");
      console.debug("joplin.plugins.register:onStart: Running main module...");
      await main();
    } catch (err) {
      console.error("joplin.plugins.register:onStart: Error in main module!");
      console.error(err);
    }
  },
});

joplin.settings.onChange(handleSettingsUpdate);

async function handleSettingsUpdate() {
  const firstDayOfWeek = await joplin.settings.value("firstDayOfWeek");

  if (firstDayOfWeek === "Sunday") {
    updateLocales({ weekStartsOn: 0 });
  } else if (firstDayOfWeek === "Monday") {
    updateLocales({ weekStartsOn: 1 });
  }
}
