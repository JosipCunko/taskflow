# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github

# Caching

caching - buggy unstable_cache to getTasksByUserId

# Firebase

convert all dates to ISO strings

# Achivements

Error adding achievement streak_milestone_3 to user xCnbztrkjDb8RqWcWHIbhCq3BDP2: Error: Attempted to call trackAchievementUnlocked() from the server but trackAchievementUnlocked is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.
at <unknown> (app_lib\analytics.ts\proxy.mjs:8:23)
at addAchievementToUser (app_lib\achievements.ts:62:29)
at async checkAndAwardAchievements (app_lib\achievements.ts:102:10)
at async Object.jwt (app_lib\auth.ts:645:14)
at async HealthPage (app\webapp\health\page.tsx:13:18)
6 | );
7 | export const trackAchievementUnlocked = registerClientReference(

> 8 | function() { throw new Error("Attempted to call trackAchievementUnlocked() from the server but trackAchievementUnlocked is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."); },
> GET /webapp/health 200 in 4434ms

Users can accidentally create two tasks by clicking on teh Add task button fast twice. We should use a transition and disable the button
Weekly groth button rework => both logic and display. Show no data if no data. Show each week section only if points exist in that week. Max are four weeks.

Response from the model:
Let me show you all your pending tasks so we can identify what might need priority attention:<｜ tool▁calls▁begin ｜><｜ tool▁call▁begin ｜>show_tasks<｜ tool▁sep ｜>{"status": "pending"}<｜ tool▁call▁end ｜><｜ tool▁calls▁end ｜>

EVERY ADMIN FUNCTION NEEDS ANA ACTION!!

ai chats
