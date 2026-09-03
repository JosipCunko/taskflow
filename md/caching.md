# Cache Quick Reference Guide

## Why the workflow changed (the task-cache failure)

The original plan was: cache task lists forever in Next’s Data Cache (`unstable_cache` + `CacheDuration.TASKS = undefined`) and bust them with `revalidateTag` / `revalidatePath` on every mutation. That is still the right pattern for **user, notes, fitness, health, analytics**. It is **not** the right pattern for tasks.

We had to change the task workflow because the UI stayed stale even when Firestore was correct. Symptoms:

- Log: `6 repeating tasks updated for user: …` — Firestore wrote, the UI did not.
- Add a task on another device, reload the phone — the new task only appeared after clicking Refresh on `/tasks`.
- Refresh on `/tasks` did not update the dashboard.
- The Refresh button should not have existed if invalidation actually worked.

### What was going wrong

**Task lists were cached forever.** `getTasksByUserId` used Next’s Data Cache with no TTL. A repeating-task reset (or a write from another device) updated Firestore, but the next page render still returned the cached list.

**Daily resets could not bust that cache.** Repeating-task updates run inside the NextAuth JWT callback (during render). `revalidateTag` there crashes with `used revalidateTag during render`, so it had been commented out. The write happened; the UI never learned about it. On top of that, the JWT used to **read** cached tasks *before* writing the resets, then generate notifications from that stale snapshot.

**The dashboard was never invalidated.** Task mutations called `revalidatePath("/webapp", "layout")` and `/webapp/tasks`, but not the dashboard page itself (`/webapp`). Refreshing `/tasks` updated that page; navigating home reused the old dashboard payload. `revalidatePath("/webapp")` was even commented out.

**The service worker cached App Router data.** Client navigations (`_rsc` / `RSC` headers) were cache-first, and `/webapp` HTML was precached. A phone refresh could show yesterday’s HTML/RSC even when the server was fine. That’s why the in-app Refresh button “worked” (it was a POST server action) and a normal refresh often didn’t.

**Same-request reads after writes stayed stale.** `revalidateTag` does not affect the current request’s Data Cache. JWT reset → page `getTasksByUserId` still hit the old entry. Today-page auto-delay → `getTasksByUserId` in the same render still hit the old entry.

### What we changed

- **Do not put task lists in the Next.js Data Cache.** `getTasksByUserId` always reads Firestore. Do not wrap it in `React.cache()` either: today-page auto-delay (and similar writes) can happen in the same request after the layout has already read tasks, and React cache cannot be invalidated mid-request.
- **Repeating-task resets run before any task read**, then `scheduleTaskRevalidation()` uses `after()` so invalidation does not run during render.
- **One helper, `revalidateTaskData`**, invalidates tags plus every task surface: layout, dashboard (`/webapp`), tasks, today, calendar, completed, inbox.
- **Service worker** no longer precaches `/webapp` pages or caches RSC payloads. Only hashed static assets are cache-first.
- **No Refresh button.** Coming back to the app after 5+ seconds in the background triggers a silent `router.refresh()` (`RefreshOnFocus`) so the other-device case works without a button.
- **`export const dynamic = "force-dynamic"`** on the webapp layout and task-related pages so the Full Route Cache is not in the way.

Task **tags** (`CacheTags.tasks()`, `userTasks`, `task`) still exist and are still invalidated. They do not cache the list anymore; they help Next mark related UI stale after mutations.

---

## Adding caching to a new function

Use this for data that is **not** the live task list (user profile, notes, fitness, health, analytics).

### Step 1: Create the internal (uncached) function

```typescript
// app/_lib/your-file.ts
async function getDataInternal(id: string) {
  const data = await adminDb.collection("data").doc(id).get();
  return data.data();
}
```

### Step 2: Wrap with unstable_cache

```typescript
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDuration } from "@/app/_utils/serverCache";

export async function getData(id: string) {
  const cachedGetData = unstable_cache(
    getDataInternal,
    [`data-${id}`], // Unique cache key
    {
      tags: [CacheTags.data(id)], // Tags for invalidation
      revalidate: CacheDuration.YOUR_DURATION,
    },
  );

  return cachedGetData(id);
}
```

### Step 3: Add invalidation to mutations

```typescript
// In your action file
export async function updateDataAction(id: string, updates: Partial<Data>) {
  // ... update database

  revalidateTag(CacheTags.data(id));
  revalidatePath("/your-route");
}
```

**Tasks are the exception:** do not wrap `getTasksByUserId` in `unstable_cache`. After a task mutation, call `revalidateTaskData(userId)` (or `scheduleTaskRevalidation` if you are inside render / the JWT callback).

---

## Common cache tags

```typescript
// User
CacheTags.user(userId); // Single user
CacheTags.users(); // All users

// Tasks (invalidation only — lists are not Data-Cached)
CacheTags.task(taskId); // Single task
CacheTags.userTasks(userId); // User's tasks
CacheTags.tasks(); // All tasks

// Notes
CacheTags.userNotes(userId); // User's notes
CacheTags.notes(); // All notes

// Health
CacheTags.userHealth(userId); // User's health data

// Fitness
CacheTags.userFitness(userId); // User's fitness data

// Notifications
CacheTags.userNotifications(userId); // User's notifications

// Analytics
CacheTags.userAnalytics(userId); // User's analytics

// Achievements
CacheTags.userAchievements(userId); // User's achievements

// Activity
CacheTags.userActivity(userId); // User's activity log
```

---

## Cache duration constants

```typescript
CacheDuration.USER_DATA; // 300 sec (5 min)
CacheDuration.TASKS; // undefined — tasks are not Data-Cached (see above)
CacheDuration.ANALYTICS; // 600 sec (10 min)
CacheDuration.NOTIFICATIONS; // undefined (tag-based only)
CacheDuration.NOTES; // 300 sec (5 min)
CacheDuration.ACHIEVEMENTS; // 300 sec (5 min)
CacheDuration.FITNESS_HEALTH; // 180 sec (3 min)
```

---

## Invalidation patterns

### Pattern 1: Single entity update

```typescript
// User updates their profile
revalidateTag(CacheTags.user(userId));
revalidateTag(CacheTags.users());
revalidatePath("/webapp/profile");
```

### Pattern 2: Task mutation (always use the helper)

Do **not** hand-roll a subset of task paths. Missing `/webapp` is how the dashboard stayed stale.

```typescript
import { revalidateTaskData } from "@/app/_utils/serverCache";

// Create / complete / delay / delete / toggle, from a server action:
revalidateTaskData(userId, {
  taskId, // optional
  includeUser: true, // when streak / points / completed count changed
  includeActivity: true, // when activity log changed
});
```

That helper invalidates:

- tags: `tasks`, `tasks:user:{userId}`, optional `task:{id}`, `user:{id}`, `activity:{id}`
- `revalidatePath("/webapp", "layout")` (sidebar / search)
- pages: `/webapp`, `/webapp/tasks`, `/webapp/today`, `/webapp/calendar`, `/webapp/completed`, `/webapp/inbox`

### Pattern 3: Task invalidation during render (JWT, today-page auto-delay)

`revalidateTag` / `revalidatePath` throw `used revalidateTag during render`. Schedule work after the response:

```typescript
import { scheduleTaskRevalidation } from "@/app/_utils/serverCache";

scheduleTaskRevalidation(userId, { includeUser: true });
```

### Pattern 4: Creating / updating notes, fitness, health

```typescript
revalidateTag(CacheTags.userNotes(userId));
revalidateTag(CacheTags.notes());
revalidatePath("/webapp/notes");
revalidatePath("/webapp");
```

---

## When to use which duration

### Do not Data-Cache (`getTasksByUserId` style) when:

- Data changes from **user actions, other devices, and background jobs** (repeating-task resets in JWT)
- You cannot call `revalidateTag` from the place that writes (auth callback / render)
- Stale data would look like a product bug (task list, dashboard, today)

### Use `undefined` (tag-based only) when:

- Data must be accurate after mutations **and** every write path can call `revalidateTag` (notifications)
- Slight staleness until the next mutation is worse than an extra read

### Use `300` (5 minutes) when:

- Data rarely changes (user profile, notes)
- You want a safety net for missed invalidations
- Slight staleness is acceptable

### Use `600` (10 minutes) when:

- Data is analytical/statistical
- Real-time accuracy isn’t critical
- High read frequency justifies longer caching

### Use `180` (3 minutes) when:

- Data changes moderately (health logs, fitness sessions)
- Some staleness is okay but not too much

---

## Testing

### 1. Verify a cached function is working

```typescript
export async function getData(id: string) {
  console.log("[Cache] Fetching data for", id);
  const cachedGetData = unstable_cache(getDataInternal, [`data-${id}`], {
    tags: [CacheTags.data(id)],
  });
  return cachedGetData(id);
}

// First call: logs
// Second call: should NOT log (cached)
```

Task list fetches **should** hit Firestore every time. If they don’t, something wrapped them in `unstable_cache` again.

### 2. Verify task invalidation

```
1. Create / complete a task on /tasks
2. Navigate to dashboard, today, calendar — all should show the change without a Refresh button
3. On another device (or another browser), wait ~5s in the background or reload — the change should appear
```

### 3. Verify repeating-task resets

```
1. Wait for a new day (or lastLoginAt older than 5 minutes)
2. Load any /webapp page
3. Server log: "Repeating tasks (N of them: …) done updating for user: …"
4. The same response’s UI must already show the new statuses / due dates — not only after a second navigation
```

---

## Common mistakes

### Forgetting to invalidate (cached domains)

```typescript
// WRONG
export async function updateNote(id: string) {
  await db.update(id);
  // Missing: revalidateTag(CacheTags.userNotes(userId));
}
```

### Hand-rolling task paths instead of the helper

```typescript
// WRONG — dashboard and calendar stay stale (this is the old bug)
revalidateTag(CacheTags.tasks());
revalidatePath("/webapp/tasks");
revalidatePath("/webapp", "layout");

// RIGHT
revalidateTaskData(userId, { taskId });
```

### Calling `revalidateTag` during render

```typescript
// WRONG — JWT callback / RSC render: "used revalidateTag during render"
revalidateTag(CacheTags.tasks());

// RIGHT
scheduleTaskRevalidation(userId);
```

### Caching task lists again

```typescript
// WRONG — this is the architecture we had to abandon
export const getTasksByUserId = unstable_cache(getTasksByUserIdInternal, ...);

// RIGHT — always read Firestore
export const getTasksByUserId = async (userId: string | undefined) => {
  return getTasksByUserIdInternal(userId);
};
```

### Wrapping task lists in `React.cache()`

Layout reads tasks, then the today page auto-delays, then the page reads tasks again. React cache would serve the pre-delay list for the rest of the request.

### Cache key not unique enough

```typescript
// WRONG - all users share same cache
const cached = unstable_cache(fn, ["user"], { ... });

// RIGHT - each user has own cache
const cached = unstable_cache(fn, [`user-${userId}`], { ... });
```

### Service worker cache-first for RSC / HTML

Do not intercept requests with `RSC: 1`, `_rsc`, or `text/x-component`. Do not precache `/webapp` HTML. Cache-first is only for `/_next/static/` and hashed assets.

---

## Checklist for a new cached function

- [ ] Confirm this is **not** a live task list (if it is, skip `unstable_cache`)
- [ ] Internal uncached function created
- [ ] Wrapped with `unstable_cache`
- [ ] Unique cache key provided
- [ ] Appropriate cache tags added
- [ ] Cache duration set (or undefined for tag-based)
- [ ] All mutations invalidate the cache
- [ ] Multiple related tags considered
- [ ] Path revalidation added to actions
- [ ] Tested cache hit behavior
- [ ] Tested invalidation behavior
- [ ] Tested for stale data

## Checklist for a task mutation

- [ ] Firestore write succeeded
- [ ] Server action → `revalidateTaskData(userId, { taskId?, includeUser?, includeActivity? })`
- [ ] Render / JWT path → `scheduleTaskRevalidation` instead
- [ ] Repeating-task writes finish **before** `getTasksByUserId`
- [ ] Dashboard, today, calendar, completed, inbox all covered (the helper does this)
- [ ] No new Refresh button

---

## Debugging cache issues

### Cache not invalidating (notes / user / fitness)

```typescript
revalidateTag(CacheTags.userNotes(userId));
console.log("[Cache] Invalidated notes for", userId);
```

### Task UI still stale

1. Confirm `getTasksByUserId` is not wrapped in `unstable_cache` or `React.cache()`.
2. Confirm the mutation used `revalidateTaskData`, not a partial `revalidatePath("/webapp/tasks")`.
3. If the write happened in JWT / RSC, confirm `scheduleTaskRevalidation` (`after()`), not `revalidateTag` during render.
4. Hard-reload once so the service worker that cache-first’d RSC is gone (`CACHE_VERSION` bump in `public/sw.js`).
5. Client router: `staleTimes.dynamic` is `0`; `RefreshOnFocus` refetches after 5s in the background.

### Cache not being used (cached domains)

```typescript
unstable_cache(fn, ["too-generic"], ...);  // wrong
unstable_cache(fn, [`unique-${id}`], ...); // right
```

---

## Additional resources

- Helpers: `app/_utils/serverCache.ts` (`revalidateTaskData`, `scheduleTaskRevalidation`)
- Task reads: `app/_lib/tasks-admin.ts` (`getTasksByUserId` is uncached on purpose)
- Repeating-task resets: `app/_lib/auth.ts` (`updateUserRepeatingTasks` + JWT order)
- Service worker: `public/sw.js`
- Client refetch on return: `app/_components/RefreshOnFocus.tsx`
- Next.js docs: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
- `unstable_cache` API: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
- `after()`: https://nextjs.org/docs/app/api-reference/functions/after

---

## Pro tips

1. **Start conservative** with shorter cache times (3–5 min) for cacheable domains.
2. **Monitor Firestore reads** to verify caching is working where we still cache.
3. **Do not cache the task list** to save reads — those reads are the product.
4. **Never call `revalidateTag` from the JWT callback**; use `after()` / `scheduleTaskRevalidation`.
5. **Invalidate related caches** (e.g. task completion also updates user stats — pass `includeUser: true`).
6. **Test dashboard + other-device reload**, not only the page you mutated.
7. **When in doubt, invalidate more paths rather than fewer** — or just call `revalidateTaskData`.
