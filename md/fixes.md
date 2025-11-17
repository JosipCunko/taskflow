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

# Bugs

### Undefined properties in Firestore

- Error tracking task analytics: value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field delayCount). If you want to ignore undefined values, enable "ignoreUndefinedProperties"
  at trackTaskAnalytics (analytics-admin.ts)
  at deleteTaskAction (actions.ts)
  await adminDb.collection("taskAnalytics").add(analyticsData)

- We cannot call .ignoreUndefinedProperties because the Firestore has been already set up.

### Repeating task

- When I first login for the day and go to the /webapp, I can see that none of my repeating tasks are updated that needs to be updated. But when I update for example prioritize one task (Add prioirity), all of the repeating tasks that needed to be updated, got updated at the same time. To sum up, repeating tasks are updated when user performs an action on some existing repeating tasks. This may be the cause of our newly implemented caching, because the we cache almost everything (examine again our "smart" caching system), and the cache isnt evaluated in the updateUserRepeatingTasks function in @auth.ts , and when we call the server action to update task, cache gets revalidated (I think).
  Can you check

### Very very bad Caching

Here is the situation: Today is Monday, my last login was on saturday, so the new week came and all of my daysOfWeek and timesPerWeek tasks need to be reseted. When I first login to the /webapp/tasks page, none of the repeating tasks are reseted. But, when I create some new task or update one, all of them get updated.
THAT'S NOT ALL. Every time when I go back to the /tasks page, I get cached tasks that are not updated, same situation when I first login to the app. Then I refreshed the page and updated(reseted) tasks were shown.

Same as on the /profile page, my reward points still says 104, even after I completed two tasks in the meantime

### page layout

For example in the /tasks page, I cannot click "Delete Task" on the last task because the overflow is hidden and I cant scroll more to fit the whole task, so its bottom fifth (1/5) is cropped.

# BUG_FIXES_SUMMARY

- anonymous data deletion:

1. Add `CRON_SECRET` to environment variables (generate a random secret string). How do I generate it?
2. For Vercel deployments, the cron will run automatically
3. For other deployments, set up an external cron service to call the endpoint with the bearer token

- autoDelayIncompleteTasks: needs to be called only once a day, a quick performance fix, add that to the /today page where we call it (I think its the only place we call that function)

# openrouter

openRouter API error: {"error":{"message":"No endpoints found that support tool use. To learn more about provider routing, visit: https://openrouter.ai/docs/provider-routing","code":404}}

- What does this error mean?

# push notifications

Service Worker registered successfully: https://optaskflow.vercel.app/
9610-6979c9a806cc80d9.js:1 Starting analytics data fetch for user: xCnbztrkjDb8RqWcWHIbhCq3BDP2
9610-6979c9a806cc80d9.js:1 Calling analytics API...
page-53b2a06c30499402.js:1 Requesting notification permission...
hook.js:608 Service Worker registration failed: TypeError: Failed to register a ServiceWorker for scope ('https://optaskflow.vercel.app/') with script ('https://optaskflow.vercel.app/firebase-messaging-sw.js'): A bad HTTP response code (404) was received when fetching the script.
overrideMethod @ hook.js:608Understand this error
hook.js:608 Error getting FCM token: TypeError: Failed to register a ServiceWorker for scope ('https://optaskflow.vercel.app/') with script ('https://optaskflow.vercel.app/firebase-messaging-sw.js'): A bad HTTP response code (404) was received when fetching the script.
overrideMethod @ hook.js:608Understand this error
page-53b2a06c30499402.js:1 Permission granted, token received: false

# Vercel

- I got an warning after fixing the deployment issue that was present before (its fixed) and after adding some new enviromental variables:

This key, which is prefixed with NEXT*PUBLIC* and includes the term KEY, might expose sensitive information to the browser. Verify it is safe to share publicly.

Solutions:
Option A: Change to Daily Schedule (Stay on Hobby)
Update your vercel.json:
{ "crons": [ { "path": "/api/admin/cleanup-anonymous", "schedule": "0 2 * * *" } ]}
This means: Run once daily at 2:00 AM UTC
Option B: Upgrade to Pro Plan
40 cron jobs allowed
Unlimited execution frequency
Costs $20/month per user

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
