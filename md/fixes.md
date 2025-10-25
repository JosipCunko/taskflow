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
nextauth url in env file is still localhost: // env.local NEXTAUTH_URL=http://localhost:3000 # For development - is that a problem?
Nextjs middleware could be useful - you can just create a file
Tooltip of how productivity and consistency score are calculated needs to be shown in the dashboard page for better UX
manual location typing
math symbols smaller modal

# Landing page

update photos and check @LANDING_PAGE_PHOTOS.md for help
