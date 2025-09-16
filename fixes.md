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

# Other

When inputs are hovered on alraedy executed input submit, bg turns white
place theme in the user object in firestore

Feature usage analytics still only tracks dashboard views. I am not 100% sure, but it stays on 7 even when I switch through all routes.
