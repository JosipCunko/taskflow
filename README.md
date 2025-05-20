# TaskFlow - task manager app

- App is mainly about user managing their tasks (daily, weekly, monthly) which will help them achieve their goals with discipline and control.

## Routes:

Dashboard
Tasks - task management
Profile - settings included

## Features:

1. Task Management
   Allow users to set preconditions: “Do X only after Y is done.”
   Auto-reschedule a missed task (Right now reschedule for the next day)
   Let user reschedule some task

2. Tags:
   Users will type in their tasks with tags (optional of course). Ex. morning routine, gym, personal, health, work, looksmaxxing...
   Custom labels for work/personal/health, with a color palette picker
   Special tag: focus, that will be displayed first and the most important task to complete that day.

3. Reminders, Snooze & Dismiss:
   Allow users to snooze reminders (e.g. “Remind me again in 30 minutes”)

4. Streaks & Progress Tracking:
   Reward users for completing tasks consistently—visualize productivity streaks.
   User will receive ranked with points called reward points. Each successfull task is rewarded with 10 points, and if not done it is -8 points.
   Formula for completed task is: (-2)*n + 10 , where n is the number of times task is delayed, 0 <= n <= 5
   Formula for not completed task is: (-2)*n - 8 , where n is the number of times task is delayed, 0 <= n <= 5
   Show the reward points in the dashboard and profile page.

5. Dashboard:
   Switch views: daily, weekly, monthly overviews with smooth transitions.
   Dashboard will display weekly/monthly reports (feature 6), upcoming tasks for today and tomorrow, missed and delayed tasks progress...

6. Weekly/Monthly Reports
   Charts of completed vs. planned tasks, delayed tasks, busiest days, time spent
   We will see what library to use (probably recharts)

## Additional information:

Users will be logged in with their firebase account (google provider).
Use custom colors
App will be in dark mode
Return a skeleton from a component while data is being fetched
