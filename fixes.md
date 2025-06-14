ACTION: Delete Task 2t6gieva9AhbQJfad7iL
Task 2t6gieva9AhbQJfad7iL not found for deletion.
Error deleting task: Error: Task not found for deletion point calculation.
at deleteTask (app_lib\tasks.ts:334:12)
at async deleteTaskAction (app_lib\actions.ts:210:24)
332 | if (!taskDocSnap.exists()) {
333 | console.warn(`Task ${taskId} not found for deletion.`);

> 334 | throw new Error("Task not found for deletion point calculation.");

      |            ^

335 | }
336 |
337 | const taskOld = fromFirestore(
POST /webapp/tasks 200 in 711ms

# New feature in AddTask

Specify the time also for the dueDate, default is 23:59 (end of a day)

# Fixes

lastInstanceCompletedAt == completedAt
