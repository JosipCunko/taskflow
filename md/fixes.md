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

# Bugs and ideas to fix now

Error tracking task analytics: value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field delayCount). If you want to ignore undefined values, enable "ignoreUndefinedProperties"
at trackTaskAnalytics (analytics-admin.ts)
at deleteTaskAction (actions.ts)
await adminDb.collection("taskAnalytics").add(analyticsData)

# Later

task that are set as priority have bigger points reduction
math symbols smaller modal
failed to get ai response

# BUG_FIXES_SUMMARY

- anonymous data deletion
- autoDelayIncompleteTasks

# UPDATED

- repeating tasks
- location
- layout on mobile in every route
- tooltips

# Landing page

update photos and check @LANDING_PAGE_PHOTOS.md for help

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
