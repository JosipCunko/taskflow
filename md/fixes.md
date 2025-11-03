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
