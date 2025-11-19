# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github, I'll need a step-by-step guide how to protect the branch and optimize indexes
My main branch isnt protected, also in Firebase console I got an warning about optimizing indexes.

# actions.js

- Is it a problem if every admin function needs a server action to be called from the client, also some of them are called from an api?

# Youtube summarizer

- Needs review:

YoutubeBackgroundProcessor
route.ts /create-tasks
route.ts /process

The plan is this: I want to fetch the videos that were newly created by accounts I am subscribed to. The max is last 7 days
I dont have the API key from youtube, so I dont know how to get it, how and from where do I get it?

# Review

- offline support - works but still needs review
- admin.ts newly implementation of firestore not being initialized during built time
- sw.js
- do we actually update the version of PWA: @PWAInstall ln:42
- how do I test the push notifs?
- anonymous data deletion
- autoDelayIncompleteTasks
- better system prompt inside utils for openrouter

# AI Feature

its glitchy, maybe its problem with caching, it shows and then delets chats, every time I refresh the page in a hope the messages stay in the chat.

# Task filtering

- when I add any filter in Advanced Repeating Task Filter, it showed regular tasks that was completed, including all of the corresponding repeating tassk

icon filtering doesnt work. When I search for the tasks which have icon with a person, none show but it exists. It may be the problem with comparing icon names/labels

# Inbox

- double the notification: "Potjera" is due today (Repeating Task) of MEDIUM priority. Cannot happen.
  When I click on the notification (to read it), the Unread state doesnt change, it stays on 2, but when I click on it, it says "No unread notifications"

# Inbox

- double the notification: "Potjera" is due today (Repeating Task) of MEDIUM priority. Cannot happen.
  When I click on the notification (to read it), the Unread state doesnt change, it stays on 2, but when I click on it, it says "No unread notifications"

- when I return to the inbox page several times, messages are still seen as not read. Same as on the tasks page. When I return to the /tasks after being on the /inbox page, my repeating tasks dont have their updated fields. May be the problem with caching not sure
- when I return to the inbox page several times, messages are still seen as not read. Same as on the tasks page. When I return to the /tasks after being on the /inbox page, my repeating tasks dont have their updated fields. May be the problem with caching not sure

# Tasks on Dashboard (/webapp)

### Test Scenario 1: Repeating Task Completion

1. Create a repeating task (e.g., "5 times per week")
2. Complete 1 instance today
3. Check dashboard:
   - ✅ Completed count should increase by 1
   - ✅ Pending count should decrease by 1
   - ✅ Available points should decrease by task points

### Test Scenario 2: Mixed Tasks

1. Have both regular and repeating tasks due today
2. Complete some of each type
3. Verify:
   - ✅ Pending count reflects both types of incomplete tasks
   - ✅ Completed count reflects both types of completed tasks
   - ✅ Available points shows sum of all incomplete tasks

### Test Scenario 3: Points Accuracy

1. Create repeating task (starts at 10 points)
2. Complete it several times
3. Verify:
   - ✅ Points increase to max 10 (for interval tasks)
   - ✅ Available points match the current task points value

# Vercel env

- check CRON_SECRET and other vars
