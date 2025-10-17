# Cache Quick Reference Guide

## 🚀 Adding Caching to a New Function

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
    }
  );

  return cachedGetData(id);
}
```

### Step 3: Add invalidation to mutations

```typescript
// In your action file
export async function updateDataAction(id: string, updates: any) {
  // ... update database

  // Invalidate cache
  revalidateTag(CacheTags.data(id));
  revalidatePath("/your-route");
}
```

## 📋 Common Cache Tags Reference

```typescript
// User
CacheTags.user(userId); // Single user
CacheTags.users(); // All users

// Tasks
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
```

## ⏱️ Cache Duration Constants

```typescript
CacheDuration.USER_DATA; // 300 sec (5 min)
CacheDuration.TASKS; // undefined (tag-based only)
CacheDuration.ANALYTICS; // 600 sec (10 min)
CacheDuration.NOTIFICATIONS; // undefined (tag-based only)
CacheDuration.NOTES; // 300 sec (5 min)
CacheDuration.ACHIEVEMENTS; // 300 sec (5 min)
CacheDuration.FITNESS_HEALTH; // 180 sec (3 min)
```

## 🔄 Invalidation Patterns

### Pattern 1: Single Entity Update

```typescript
// User updates their profile
revalidateTag(CacheTags.user(userId));
revalidateTag(CacheTags.users());
revalidatePath("/webapp/profile");
```

### Pattern 2: Collection Item Update

```typescript
// User completes a task
revalidateTag(CacheTags.tasks());
revalidateTag(CacheTags.userTasks(userId));
revalidateTag(CacheTags.task(taskId));
revalidatePath("/webapp/tasks");
```

### Pattern 3: Multiple Related Entities

```typescript
// Task completion affects user stats
revalidateTag(CacheTags.tasks());
revalidateTag(CacheTags.userTasks(userId));
revalidateTag(CacheTags.task(taskId));
revalidateTag(CacheTags.user(userId)); // User stats changed
revalidatePath("/webapp");
```

### Pattern 4: Creating New Items

```typescript
// User creates a note
revalidateTag(CacheTags.userNotes(userId));
revalidateTag(CacheTags.notes());
revalidatePath("/webapp/notes");
```

### Pattern 5: Deleting Items

```typescript
// User deletes a workout
revalidateTag(CacheTags.userFitness(userId));
revalidatePath("/webapp/fitness");
```

## 🎯 When to Use Which Duration

### Use `undefined` (tag-based only) when:

- ❌ Data changes frequently through user actions (tasks, notifications)
- ❌ Stale data would confuse users
- ✅ You have proper tag-based invalidation

### Use `300` (5 minutes) when:

- ✅ Data rarely changes (user profile, notes)
- ✅ You want a safety net for missed invalidations
- ✅ Slight staleness is acceptable

### Use `600` (10 minutes) when:

- ✅ Data is analytical/statistical
- ✅ Real-time accuracy isn't critical
- ✅ High read frequency justifies longer caching

### Use `180` (3 minutes) when:

- ✅ Data changes moderately (health logs, fitness sessions)
- ✅ Some staleness is okay but not too much
- ✅ Balance between freshness and performance

## 🧪 Testing Your Cache

### 1. Verify Cache is Working

```typescript
// Add logging (temporary)
export async function getData(id: string) {
  console.log("[Cache] Fetching data for", id);
  const cachedGetData = unstable_cache(getDataInternal, [`data-${id}`], {
    tags: [CacheTags.data(id)],
  });
  return cachedGetData(id);
}

// First call: logs "[Cache] Fetching data for..."
// Second call: should NOT log (cached)
```

### 2. Verify Invalidation Works

```typescript
// 1. Load page (cache populated)
// 2. Make mutation
// 3. Reload page (should see fresh data)

export async function updateDataAction(id: string) {
  await updateInDb(id);
  console.log("[Cache] Invalidating data:", id);
  revalidateTag(CacheTags.data(id));
  // Next page load should fetch fresh data
}
```

### 3. Check for Stale Data

```
Test Pattern:
1. Load page → Note the data
2. Update in database directly (Firebase console)
3. Wait for cache duration to pass
4. Reload page → Should show updated data
```

## ⚠️ Common Mistakes

### ❌ Mistake 1: Forgetting to invalidate

```typescript
// WRONG
export async function updateTask(id: string) {
  await db.update(id);
  // Missing: revalidateTag(CacheTags.task(id));
}
```

### ❌ Mistake 2: Using wrong cache tags

```typescript
// WRONG - invalidating user when task changed
export async function updateTask(id: string) {
  await db.update(id);
  revalidateTag(CacheTags.user(userId)); // Wrong tag!
}
```

### ❌ Mistake 3: Not using multiple tags

```typescript
// WRONG - too specific, won't invalidate list
export async function updateTask(id: string) {
  await db.update(id);
  revalidateTag(CacheTags.task(id)); // Only single task
  // Missing: CacheTags.tasks(), CacheTags.userTasks(userId)
}
```

### ❌ Mistake 4: Cache key not unique enough

```typescript
// WRONG - all users share same cache
const cached = unstable_cache(fn, ['user'], { ... });

// RIGHT - each user has own cache
const cached = unstable_cache(fn, [`user-${userId}`], { ... });
```

## ✅ Checklist for New Cached Function

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

## 🔍 Debugging Cache Issues

### Issue: Cache not invalidating

```typescript
// Add logging to track invalidations
revalidateTag(CacheTags.tasks());
console.log("[Cache] Invalidated tasks cache");
```

### Issue: Cache not being used

```typescript
// Check cache key is unique
unstable_cache(fn, ['too-generic'], ...);  // ❌
unstable_cache(fn, [`unique-${id}`], ...); // ✅
```

### Issue: Stale data persists

```typescript
// Check ALL related tags are invalidated
revalidateTag(CacheTags.task(id)); // Single task
revalidateTag(CacheTags.tasks()); // All tasks
revalidateTag(CacheTags.userTasks(uid)); // User's tasks
```

## 📚 Additional Resources

- **Full Documentation**: See `CACHING_IMPLEMENTATION.md`
- **Implementation Summary**: See `CACHING_SUMMARY.md`
- **Next.js Docs**: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
- **unstable_cache API**: https://nextjs.org/docs/app/api-reference/functions/unstable_cache

## 🎓 Pro Tips

1. **Start conservative** with shorter cache times (3-5 min)
2. **Monitor Firestore reads** to verify caching is working
3. **Use tag-based invalidation** for critical data (tasks, user profile)
4. **Add time-based revalidation** as a safety net (except for frequently changing data)
5. **Invalidate related caches** (e.g., task completion affects user stats)
6. **Test invalidation** after every mutation you add
7. **Document dependencies** when one cache affects another

Remember: **When in doubt, invalidate more caches rather than fewer!**
