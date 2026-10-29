AUBURN COVE PUBLIC WEBSITE UPDATE

Upload these files to the ROOT of your existing GitHub Pages repository (not a subfolder):
index.html, styles.css, script.js, newsletters.json, entrance-sign.jpg, community-aerial.jpg

Do not delete your existing portal files unless you want to retire that separate system. This update removes all portal links from the public website.

CALENDAR: Events update automatically from the supplied Google Calendar. In Google Calendar settings for this specific calendar, under Access permissions for events, enable Make available to public if you want everyone to see it. Public calendars expose event details; do not publish private information.

NEWSLETTERS: To add a newsletter, upload a PDF to a public newsletters/ folder in the repository, then edit newsletters.json to add entries, e.g.:
[
  {"title":"November 2026 Community Newsletter", "date":"November 2026", "summary":"Neighborhood news and upcoming activities.", "url":"newsletters/november-2026.pdf"}
]
Only post information appropriate for a public website. This is a separate newsletter workflow; the calendar requires no GitHub edits.
