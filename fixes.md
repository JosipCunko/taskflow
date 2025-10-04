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

⚠ Unsupported metadata viewport is configured in metadata export in /.well-known/appspecific/com.chrome.devtools.json. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport

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

🧠 Why it happens

This “quota exceeded” error happens when:

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

I want PWA and a manifest file
deployment error with ai/aiId page
ai chats problem with UI
analyticsAdmin 226 only from the week before
Sidebar.tsx needs a review.
Review TutorialOverlay because DOM is accessed manually.
In 14day overview - add userActivityLogs for when some tasks were created.
DonutSMP is due tomorrow and DountSmp is 4 days overdue. Inform the user that this task is repeating.
Two notifications about Task Completionist at the same time. Our fix for that long before clearly doesnt do anything.
Tooltip of how productivity and consistency score are calculated
Avg. completion is 153h => WHATTT? task.completionTime might be incorrectly calculated on repeatingTasks
Most productive hour is incorrect in my scenarious.
Remove other tasks and post process the tasks that are in the UI in the /today
When I delete autoDelayIncompleteTodayTasks from actions.ts, and remove its usage in /today page, I get an unusual error.
In the /profile route, add "Contact us" that sends a mail to ultrabrzitranzijent@gmail.com
In the readme file, Service Worker API is mentioned as a Native browser API for offline functionality.

# Dates to UNIX timestamp (number):

You've hit on a very subtle but important issue with data caching in Next.js! Here’s what's happening:

The root cause is `unstable_cache` in `app/_lib/user-admin.ts`.

1.  **First Fetch:** The first time `getUserById` runs, it correctly fetches data from Firestore and converts the `unlockedAt` Firestore `Timestamp` into a JavaScript `Date` object. Everything is correct at this point.
2.  **Caching & Serialization:** Next.js's `unstable_cache` then takes this user object and serializes it to store it in the cache. During serialization, `Date` objects are converted into ISO date strings (e.g., `"2023-10-27T10:00:00.000Z"`).
3.  **Subsequent Fetches (from Cache):** When `getAnalyticsData` calls `getUserById` again, `unstable_cache` serves the serialized data from its cache. It deserializes the JSON, but the `unlockedAt` field remains a **string**. It is not automatically converted back into a `Date` object.

So, even though your type definition says `unlockedAt: Date`, the data you receive from the cache at runtime has `unlockedAt` as a `string`. When the `.sort()` method tries to call `.getTime()` on that string, the app crashes.
