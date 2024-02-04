# Joplin Planner

This plugin is still heavily in development. It's not very intuitive in its current state. Hopefully soon I'll release a version 1 that is more polished.

Currently the way this plugin works is that it generates the following folder structure in your folders root

- Plans
  - 1 - Upcoming
    - Projects
  - 2 - Current
    - Projects
  - 3 - Past
    - Projects

Note the numbers prefixed to those folders is to ensure that they are always displayed in that order via the sidebar.

The plugin observes for any note changes in the Current folder's Project folder and then populates the following

- A note titled "This Week" in the Current folder **only if** one doesn't exist already. This note is meant for the user to write to directly.
- A note title "Next Week" in the Upcoming and several others in the same folder for various date ranges in the near and far future. These notes are not meant for the user to write to directly as all of them are deleted and repopulated on Project note changes.

Notes you create in the Current folder's Projects folder can be tagged with the following:

- a frequency: daily, weekly, monthly, yearly
- a day of the week: monday, mon, tuesday, etc
- a month name: january, jan, february, etc
- or a date that is parseable by dayjs: january 1st 2025, 02/22/2024, etc.

When these notes are created and tagged, the notes in the Upcoming folder will be automatically recreated with embedded todo lists that represent your "tree" of tasks taken from projects/folders and tasks/notes scheduled for each day.

Right now that's it. It is recommended that each week you move the "This Week" note generated in the Current folder into the Past folder. Then make changes or force a change in the Current Projects folder to trigger the current and upcoming notes to be recreated. In the future this archiving process will be more automatic.

The Projects folder in the Past folder is also meant for archiving old projects. The Projects folder in the Upcoming folder is meant for creating and planning projects you might not want to take on yet. Neither of these folders are watched for changes and have todos generated off of them. Only the Current Projects folder is observed.
