AUBURN COVE — CUSTOM CALENDAR SETUP

Upload these files to the ROOT of your existing GitHub repository:
  index.html
  calendar.css
  calendar.js
  calendar-events.json

Upload this file into a scripts folder:
  scripts/sync_calendar.py

Upload this file into a .github/workflows folder:
  .github/workflows/update-calendar.yml

IMPORTANT: Keep your existing styles.css, script.js, image files, newsletters.json, and icon files.
The index.html in this package preserves Home, Calendar, Community Outreach, Newsletter,
Documents and Contact, including the Contact-only disclaimer and iPhone icon references.

1. In Google Calendar Settings > Settings for my calendars > [your Auburn Cove calendar]
   > Access permissions for events, turn on 'Make available to public' if not already enabled.
   All event titles, dates, locations and descriptions will be PUBLIC on your website.
   Do not add private information.

2. In GitHub repository Settings > Actions > General > Workflow permissions,
   select 'Read and write permissions' and Save. You may need to be repository admin.

3. In the GitHub Actions tab, choose 'Update public community calendar',
   click 'Run workflow'. When it succeeds, calendar-events.json will be populated.
   GitHub Actions will then check for changes about once an hour.
   GitHub scheduled workflows may be delayed and can be disabled after prolonged repo inactivity.

4. Open your website Calendar page. It will use the new calendar design with no Google footer.
   If the calendar stays empty, check the Actions run logs and Google public sharing setting.

Note: GitHub Pages must publish from the same branch/folder that contains these files.
If GitHub Pages uses a /docs folder, put website files there and adapt workflow paths.

No Google API key is needed. This uses the public iCalendar feed and GitHub Actions.
