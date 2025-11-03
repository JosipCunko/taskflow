# Dashboard Task Count and Points Calculation Fixes/BUGS

## Issues Identified

### 1. ❌ Incorrect Pending Tasks Count

**Problem**: When completing repeating tasks, the dashboard still showed "0/5 pending today" because the `pendingTodayTasks` array only included regular tasks.

**Root Cause**: In `app/_utils/utils.ts`, the `generateTaskTypes()` function had logic that only checked:

```typescript
if (isToday(task.dueDate) && task.status === "pending") {
  pendingTodayTasks.push(task);
}
```

This logic **completely ignored repeating tasks** because:

- Repeating tasks don't use `isToday(task.dueDate)` logic
- Repeating tasks use `canCompleteRepeatingTaskNow()` to determine if they're due today
- Repeating tasks that are completed today are tracked via `repetitionRule.completedAt`

### 2. ⚠️ Available Points Calculation (Was Actually Correct)

**Investigation**: The "available points" calculation was using the correct arrays:

```typescript
const potentialTodayPoints = [
  ...incompleteRegularTodayTasks,
  ...incompleteRepeatingTodayTasks,
].reduce((acc: number, task: Task) => acc + task.points, 0);
```

**Finding**: The issue wasn't with the calculation itself, but with the fact that users were confused because the pending count was wrong. Once the pending count shows the correct number including repeating tasks, the available points will also be displayed properly.

## Solutions Implemented

### Fix 1: Include Repeating Tasks in Pending Count

**Location**: `app/_utils/utils.ts` - `generateTaskTypes()` function

**Changes**:

1. Added tracking variables to monitor repeating task status:

```typescript
let repeatingTaskIsDueToday = false;
let isRepeatingTaskCompletedToday = false;
```

2. Set these variables when processing repeating tasks:

```typescript
if (task.isRepeating) {
  const { isDueToday } = canCompleteRepeatingTaskNow(task);
  repeatingTaskIsDueToday = isDueToday;

  if (isDueToday) {
    isRepeatingTaskCompletedToday =
      task.repetitionRule?.completedAt.some((d) => isToday(d)) ||
      (task.completedAt &&
        isToday(task.completedAt) &&
        task.status === "completed");
  }
}
```

3. Updated the pending tasks logic to include repeating tasks:

```typescript
// For regular tasks: check if today and pending
if (!task.isRepeating && isToday(task.dueDate) && task.status === "pending") {
  if (task.isPriority) pendingPriorityTasks.push(task);
  pendingTodayTasks.push(task);
}

// For repeating tasks: add incomplete repeating tasks to pending today
if (
  task.isRepeating &&
  repeatingTaskIsDueToday &&
  !isRepeatingTaskCompletedToday
) {
  if (task.isPriority) pendingPriorityTasks.push(task);
  pendingTodayTasks.push(task);
}
```

## How Points Work in the System

### Regular Tasks

- Start with **10 points** (delayCount = 0)
- Lose **2 points per delay** (calculated via `calculateTaskPoints()`)
- Minimum: **0 points**

### Repeating Tasks

#### Initial Points

- All repeating tasks start with **10 points** (delayCount = 0)
- Set during creation in `createTask()` function

#### Points Adjustment on Completion

**Interval-based tasks**:

- Gain **+2 points** on each completion (max 10)

```typescript
const newPoints = Math.min(10, task.points + 2);
```

**Times per week tasks**:

- Gain **+2 points** when week is fully completed (max 10)
- No points change for individual completions within the week

**Days of week tasks**:

- Gain **+2 points** when all scheduled days for the week are completed (max 10)

#### Weekly Reset Logic (in `auth.ts`)

When a new week starts:

- If `completed > missed`: **+2 points** (max 10)
- If `completed < required`: **-2 points** (min 2)

## Testing Recommendations

### Test Scenario 1: Repeating Task Completion

1. Create a repeating task (e.g., "5 times per week")
2. Complete 1 instance today
3. Check dashboard:
   - ✅ Completed count should increase by 1
   - ✅ Pending count should decrease by 1
   - ✅ Available points should decrease by task points

### Test Scenario 2: Mixed Tasks

1. Have both regular and repeating tasks due today
2. Complete some of each type
3. Verify:
   - ✅ Pending count reflects both types of incomplete tasks
   - ✅ Completed count reflects both types of completed tasks
   - ✅ Available points shows sum of all incomplete tasks

### Test Scenario 3: Points Accuracy

1. Create repeating task (starts at 10 points)
2. Complete it several times
3. Verify:
   - ✅ Points increase to max 10 (for interval tasks)
   - ✅ Available points match the current task points value

## Code References

**Files Modified**:

- `app/_utils/utils.ts` - `generateTaskTypes()` function (lines 684-752)

**Related Files** (for context):

- `app/webapp/page.tsx` - Dashboard display (lines 204-220)
- `app/_lib/actions.ts` - Task completion handlers
- `app/_lib/tasks-admin.ts` - Task creation (line 202)
- `app/_lib/auth.ts` - Weekly reset logic for repeating tasks

## Notes

- The fix ensures that both regular and repeating tasks are properly counted in the "pending today" metric
- The available points calculation was already correct, but now displays more accurately because the pending count is fixed
- Priority tasks are also properly tracked for both regular and repeating tasks
