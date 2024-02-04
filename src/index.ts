import joplin from "api";
import data from "./data";
import main from "./main";

joplin.plugins.register({
  onStart: async () => {
    try {
      console.debug("joplin.plugins.register:onStart: Plugin started!");
      await joplin.settings.registerSection(
        data.settings.sectionName,
        data.settings.section
      );

      await joplin.settings.registerSettings(data.settings.options);

      console.debug("joplin.plugins.register:onStart: Settings registered!");
      console.debug("joplin.plugins.register:onStart: Running main module...");
      await main();
    } catch (err) {
      console.error("joplin.plugins.register:onStart: Error in main module!");
      console.error(err);
    }
  },
});

