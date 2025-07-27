# Fixes and bugs

Read the docs about indexes in firebase console and protecting the master branch in github

caching - buggy unstable_cache to getTasksByUserId

Tasks points are not reset on daily interval tasks

pageViews are not correctly updated. Page views can be a total of 7 (dashboard, calendar, tasks, today, inbox, profile and notes), but it updates on every session update. It will be a good analytics data if the user sees what pages it visits in each session. Field in fact is stored in SessionData type.

title and decription fields are reset when I go to the TaskCustomization

fcmTokenUpdateAt not update every days

its not last 30 days in pagesvisited showcase

on task creation, it says 2 pts available today

if mpst productive hour doesnt exist, dont show 12am

risk is not being correctly calculated. I've created a task that neends 5 times per week to fully complete, and today is sunday.

5 times a week 14:00 - 17:00 starting Tomorrow => Available on sunday, due date

Repeating tasks (4 of them: Ab workout, Programming, Cardio, Hit calves) done updating for user: xCnbztrkjDb8RqWcWHIbhCq3BDP2.
they are timesPerWeek tasks that are scheduled for the next week. Today is sunday and I sheduled it to start tommorow.
