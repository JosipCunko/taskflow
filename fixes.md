# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github

# Caching

caching - buggy unstable_cache to getTasksByUserId

### EVERY ADMIN FUNCTION NEEDS AN ACTION!!

# Bugs and ideas

ai chats problem with UI
analyticsAdmin :256 fixed length of 12
analyticsAdmin 226 only from the week before
Sidebar.tsx needs a review.
Review TutorialOverlay because DOM is accessed manually.
In 14day overview - add userActivityLogs for when some tasks were created.
DonutSMP is due tomorrow and DountSmp is 4 days overdue. Inform the user that this task is repeating.
Two notifications about Task Completionist at the same time. Our fix for that long before clearly doesnt do anything.
Tooltip of how productivity and consistency score are calculated
Avg. completion is 153h => WHATTT?
Most productive hour is incorrect in my scenarious.
Remove other tasks and post process the tasks that are in the UI in the /today

# Today's plan

We need to add a new feature to /today page. When user visit this page, above the priority tasks and the today's schedule, add a section: tasks that needs to be completed today. This tasks are visible on the other pages as well.

Structure of this section is as following: a list of all today's tasks is on the right side and they must be completed today. On the left side, today's hours are shown as boxes and if some tasks has a duration and startTime, or startTime and endTime, that tasks spans across boxes accordingly to the hours it lasts. Tasks that needs to be completed anytime in the day are on the right, with isWholeDay applied to them

If there is no today's plan, in the middle is a button that says "Create today's plan".
It opens up a modal that is similar to the AddTask, but without some features: created tasks cant be repeatable and its dueDate must be today, they dont have tags or reminders
Rest: title, description, location, isWholeDay, isPriority, starts/ends at, duration and customization(icon and color) are still present!
You need to create AddTodayTask as a component that will be rendered inside a Modal, similarly as the AddTask.tsx!

If some of the tasks are not completed today, you need to create a function that automatically delays them to tommorrow! If the next day comes, completed tasks from before cannot be visible.

# Dates to strings or number:

You've hit on a very subtle but important issue with data caching in Next.js! Here’s what's happening:

The root cause is `unstable_cache` in `app/_lib/user-admin.ts`.

1.  **First Fetch:** The first time `getUserById` runs, it correctly fetches data from Firestore and converts the `unlockedAt` Firestore `Timestamp` into a JavaScript `Date` object. Everything is correct at this point.
2.  **Caching & Serialization:** Next.js's `unstable_cache` then takes this user object and serializes it to store it in the cache. During serialization, `Date` objects are converted into ISO date strings (e.g., `"2023-10-27T10:00:00.000Z"`).
3.  **Subsequent Fetches (from Cache):** When `getAnalyticsData` calls `getUserById` again, `unstable_cache` serves the serialized data from its cache. It deserializes the JSON, but the `unlockedAt` field remains a **string**. It is not automatically converted back into a `Date` object.

So, even though your type definition says `unlockedAt: Date`, the data you receive from the cache at runtime has `unlockedAt` as a `string`. When the `.sort()` method tries to call `.getTime()` on that string, the app crashes.

My previous fix defensively checked the type of `unlockedAt` and converted it back to a `Date` before sorting, which is the correct approach to make the function robust.

I'll re-apply that fix. This will ensure that no matter where the data comes from (live from Firestore or from the Next.js cache), it will be handled correctly.

[1 tool called]

That's an excellent question, and it points to a tricky behavior in how Next.js caching works.

You are correct, according to the TypeScript types and the logic in `getUserById`, `unlockedAt` should be a `Date` object because we do this: `unlockedAt: (data.unlockedAt as Timestamp).toDate()`.

However, the problem lies with `unstable_cache` which wraps `getUserById`.

Here's the sequence of events:

1.  **First Call:** The first time `getUserById` is called, it fetches from Firestore, converts the `Timestamp` to a `Date` object, and returns the correct data.
2.  **Caching:** `unstable_cache` takes this result and serializes it to store it in the cache. During serialization, **`Date` objects are converted into ISO date strings** (e.g., `"2023-10-27T10:00:00.000Z"`).
3.  **Second Call (from cache):** When `getAnalyticsData` calls `getUserById` again, `unstable_cache` intercepts the call. Instead of running the function, it returns the serialized data from the cache. When it deserializes the data, the date remains a string—it is not automatically converted back into a `Date` object.

So, `getAnalyticsData` receives a user object where `unlockedAt` is a string, not a `Date`. When the `.sort()` method tries to call `.getTime()` on that string, the app crashes.

The fix I've reapplied makes the `getAnalyticsData` function more robust. It checks if `unlockedAt` is a `Date` object. If not, it correctly parses it into one before attempting to sort, thus preventing the crash regardless of whether the data comes from a fresh fetch or the cache.
