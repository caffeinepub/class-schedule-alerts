# Class Schedule & Alert App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Weekly class schedule manager where users can add, edit, and delete classes
- Each class entry includes: name, day of week, start time, end time, location (optional), and notes (optional)
- In-browser alerts/notifications that fire before a class starts (configurable: 5, 10, 15, or 30 minutes prior)
- Today's schedule view: shows only today's upcoming classes sorted by time
- Full weekly schedule view: grid or list showing all classes across the week
- Browser Notification API integration to show system alerts when a class is coming up
- Persistent data stored in the backend canister

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Data type: Class { id, name, dayOfWeek (0-6), startTime (HH:MM), endTime (HH:MM), location, notes, alertMinutesBefore }
   - CRUD operations: addScheduleClass, updateScheduleClass, deleteScheduleClass, getScheduleClasses
   - No auth required (single-user app)

2. Frontend:
   - Dashboard page: shows today's classes with countdown timers and upcoming alerts
   - Schedule page: full weekly view (Mon–Sun) listing classes per day
   - Add/Edit modal: form to create or edit a class entry
   - Alert engine: useEffect timer that checks every minute if a class is starting soon and triggers browser Notification API
   - Request notification permission on first load
   - Visual alert banner in-app as fallback when browser notifications are blocked
