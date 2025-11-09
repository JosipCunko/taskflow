# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github

# EVERY ADMIN FUNCTION NEEDS AN ACTION!!

# Youtube summarizer

YoutubeBackgroundProcessor
route.ts /create-tasks
route.ts /process

# Review

offline support - works but still needs review
vercel.json and anonymous clean up

# Bugs and ideas

Error tracking task analytics: value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field delayCount). If you want to ignore undefined values, enable "ignoreUndefinedProperties"
at trackTaskAnalytics (analytics-admin.ts)
at deleteTaskAction (actions.ts)
await adminDb.collection("taskAnalytics").add(analyticsData)

# Later

task that are set as priority have bigger points reduction
Repeating task are updated when clicked on Add prioirity to one task

# BUG_FIXES_SUMMARY

- anonymous data deletion
- autoDelayIncompleteTasks

# UPDATED

- added h-screen to every page

# Landing page

update photos and check @LANDING_PAGE_PHOTOS.md for help

# openrouter

openRouter API error: {"error":{"message":"No endpoints found that support tool use. To learn more about provider routing, visit: https://openrouter.ai/docs/provider-routing","code":404}}

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
