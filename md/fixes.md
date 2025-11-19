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
- vercel.json and anonymous clean up
- added h-screen to every page
- admin.ts newly implementation of firestore not being initialized during built time
- AI Streaming route
- sw.js
- do we actually update the version of PWA: @PWAInstall ln:42

# Bugs

### Repeating task - FIXED

- When I first login for the day and go to the /webapp, I can see that none of my repeating tasks are updated that needs to be updated. But when I update for example prioritize one task (Add prioirity), all of the repeating tasks that needed to be updated, got updated at the same time. To sum up, repeating tasks are updated when user performs an action on some existing repeating tasks. This may be the cause of our newly implemented caching, because the we cache almost everything (examine again our "smart" caching system), and the cache isnt evaluated in the updateUserRepeatingTasks function in @auth.ts , and when we call the server action to update task, cache gets revalidated (I think).

### Very very bad Caching - FIXED

Here is the situation: Today is Monday, my last login was on saturday, so the new week came and all of my daysOfWeek and timesPerWeek tasks need to be reseted. When I first login to the /webapp/tasks page, none of the repeating tasks are reseted. But, when I create some new task or update one, all of them get updated.
THAT'S NOT ALL. Every time when I go back to the /tasks page, I get cached tasks that are not updated, same situation when I first login to the app. Then I refreshed the page and updated(reseted) tasks were shown.

Same as on the /profile page, my reward points still says 104, even after I completed two tasks in the meantime

# Anonymous mode and autoDelay

- anonymous data deletion still needs to be completed:

1. Add `CRON_SECRET` to environment variables (generate a random secret string). How do I generate it?
2. For Vercel deployments, the cron will run automatically - what do I do about that?
3. For other deployments, set up an external cron service to call the endpoint with the bearer token. I use only vercel, so I think this is safe to ignore

- autoDelayIncompleteTasks: needs to be called only once a day, a quick performance fix, add that to the /today page where we call it (I think its the only place we call that function)

# openrouter

openRouter API error: {"error":{"message":"No endpoints found that support tool use. To learn more about provider routing, visit: https://openrouter.ai/docs/provider-routing","code":404}}

- What does this error mean?

# push notifications

Push notifs stopped working, and thats for a while.
When I click on enable notifs in the dashboard, I get this toast message: "Notification permission denied" and this logs in my browser console:
Requesting notification permission...
1684-90a89c32b51c03f8.js:1 Service Worker registration failed: TypeError: Failed to register a ServiceWorker for scope ('https://optaskflow.vercel.app/') with script ('https://optaskflow.vercel.app/firebase-messaging-sw.js'): A bad HTTP response code (404) was received when fetching the script.
1684-90a89c32b51c03f8.js:1 Error getting FCM token: TypeError: Failed to register a ServiceWorker for scope ('https://optaskflow.vercel.app/') with script ('https://optaskflow.vercel.app/firebase-messaging-sw.js'): A bad HTTP response code (404) was received when fetching the script.
Permission granted, token received: false

After that, the component that is in charge of push notifs UI displays this: Notifications Blocked.
Retry button only refreshes the page, is that really useful?

# Weird popup

- says: "New version available! Reload to update?"
  Is this coming from the PWA? Probably. It happens very often, because every weak I release a new commit, that also changes the project version in package.json

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

# Deleted next-sitemap.config.js

/\*_ @type {import('next-sitemap').IConfig} _/
module.exports = {
siteUrl: "https://optaskflow.vercel.app",
generateRobotsTxt: true, // (optional) automatically creates robots.txt
exclude: ["/api/*", "/webapp/*"],
};

# Vercel env

- check CRON_SECRET and other vars

# DEPLOYNET

fatal: unable to access 'https://github.com/JosipCunko/taskflow.git/': The requested URL returned error: 500
Automatic deployments from GitHub are temporarily unavailable. You can manually create a new deployment.
