#!/usr/bin/env python3
"""Sync public Auburn Cove Google Calendar ICS to static JSON for GitHub Pages."""
import json
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
from icalendar import Calendar
import recurring_ical_events

CALENDAR_ID = "74c142f73e9909af8416ff737143a297e93274ef63663ada218fd8126dd4a911@group.calendar.google.com"
ICS_URL = "https://calendar.google.com/calendar/ical/" + CALENDAR_ID + "/public/basic.ics"
LOCAL = ZoneInfo("America/New_York")

def local_date(value):
    if isinstance(value, datetime):
        return value.astimezone(LOCAL).date() if value.tzinfo else value.date()
    return value

def display_time(value):
    if isinstance(value, datetime):
        d = value.astimezone(LOCAL) if value.tzinfo else value.replace(tzinfo=LOCAL)
        return d.strftime("%-I:%M %p")
    return None

def main():
    response = requests.get(ICS_URL, timeout=35, headers={"User-Agent":"AuburnCoveCalendar/1.0"})
    response.raise_for_status()
    if "BEGIN:VCALENDAR" not in response.text:
        raise RuntimeError("Google Calendar did not return a public ICS feed. Enable public sharing.")
    calendar = Calendar.from_ical(response.content)
    now = datetime.now(LOCAL)
    start = datetime(now.year - 1, 1, 1, tzinfo=LOCAL)
    end = datetime(now.year + 2, 1, 1, tzinfo=LOCAL)
    result = []
    for event in recurring_ical_events.of(calendar).between(start, end):
        if str(event.get("STATUS","")).upper() == "CANCELLED": continue
        startval = event.decoded("DTSTART")
        endval = event.decoded("DTEND") if event.get("DTEND") else startval
        d = local_date(startval)
        # ICS all-day DTEND is exclusive. Keep multi-day events on all visible days.
        if isinstance(startval, date) and not isinstance(startval, datetime):
            last = endval - timedelta(days=1) if endval > startval else startval
        else:
            last = local_date(endval - timedelta(microseconds=1)) if endval > startval else d
        title = str(event.get("SUMMARY", "Community event"))
        location = str(event.get("LOCATION", "")).strip()
        description = str(event.get("DESCRIPTION", "")).strip()
        when = d.strftime("%b %-d, %Y")
        clock = display_time(startval)
        if clock: when += " · " + clock
        result.append({
            "date": d.isoformat(), "endDate":last.isoformat(),
            "title":title[:180], "displayDate":when,
            "location":location[:200], "description":description[:700]
        })
    result.sort(key=lambda e:(e["date"],e["title"]))
    Path("calendar-events.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print(f"Saved {len(result)} calendar events")

if __name__ == "__main__": main()
