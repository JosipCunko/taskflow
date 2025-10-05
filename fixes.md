# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github

# Caching

caching - buggy unstable_cache to getTasksByUserId - removed
We need to cache server calls as much as possible

# EVERY ADMIN FUNCTION NEEDS AN ACTION!!

# Youtube summarizer

YoutubeBackgroundProcessor
route.ts /create-tasks
route.ts /process

# PWA

In /public :
manifest.json
browserconfig
icons
nextconfig
/offline/page.tsx
layout.tsx
/components/PWAInstall

# Auto delay feature

If user specifies that this task should delay automatically for the next day if it was missed, then the function is called to do that. Right now, we dont have that property in Task from types.ts and we cant select it in AddTask.tsx or AddTodayTask.tsx

# Quota limit and Firebase Blaze plan

You’re querying Firestore too frequently, e.g. repeatedly calling .get() inside loops or API requests.
You’re using an admin SDK without caching, so every request refetches everything.
Your app is in a free Firebase tier (Spark plan), which has strict daily limits.

🔧 How to fix it
✅ 1. Check your Firestore usage

Go to your Firebase Console:

Firestore Database → Usage → “Read / Write / Delete” tabs

See if you’re hitting your daily limit.

✅ 2. Optimize your reads

Avoid running the same query repeatedly. Cache results if possible.

Don’t use .get() in frequent API routes without batching or limits.

If you only need document counts, use an aggregator document instead of fetching entire collections.

✅ 3. Add limits

For example:

const sessionsSnapshot = await adminDb
.collection("sessions")
.where("userId", "==", session.user.id)
.where("sessionStart", ">=", thirtyDaysAgo)
.orderBy("sessionStart", "desc")
.limit(100)
.get();

# Bugs and ideas

- Bugs
  In 14day overview - add userActivityLogs for when some tasks were created.
  Tooltip of how productivity and consistency score are calculated
  Avg. completion is 153h => WHATTT? task.completionTime might be incorrectly calculated on repeatingTasks
  Most productive hour is incorrect in my scenarious.
  When I delete autoDelayIncompleteTodayTasks from actions.ts, and remove its usage in /today page, I get an unusual error.
  In the readme file, Service Worker API is mentioned as a Native browser API for offline functionality.
  Update version in package.json
  Dont record any session while in dev mode!!! - saves reades and writes (quota)
  Each existing Loading Skeleton needs a review because some's page structures have changed
  ModelDropdown is not used
  Sidebar cannot be opened in the /ai
  Icon on desktop app not working - create sizes for the icons: https://www.pwabuilder.com/imageGenerator
  robots.txt file
