"use server";

import { differenceInDays, isSameWeek, startOfWeek, addDays } from "date-fns";
import type { Task, ActionResult } from "@/app/_types/types";
import { updateTask } from "./tasks";
import { isTaskDueOn, MONDAY_START_OF_WEEK } from "../utils";

export async function completeRepeatingTaskWithTimesPerWeek(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;

  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return {
      success: false,
      error: "Task is not configured for times per week completion",
    };
  }

  if (!isTaskDueOn(task, completionDate)) {
    return {
      success: false,
      error: "Task is not scheduled for today",
    };
  }

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);

  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }
  rule.completions = (rule.completions || 0) + 1;

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
  };

  if (rule.completions >= rule.timesPerWeek) {
    updates.status = "completed";
    updates.completedAt = completionDate;
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions >= rule.timesPerWeek
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions}/${rule.timesPerWeek} times this week)`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function completeRepeatingTaskWithDaysOfWeek(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;
  if (rule.daysOfWeek.length === 0) {
    return {
      success: false,
      error: "Task is not configured for specific days of week",
    };
  }

  if (!isTaskDueOn(task, completionDate)) {
    return {
      success: false,
      error: "Task is not scheduled for today",
    };
  }

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);

  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }

  rule.completions = (rule.completions || 0) + 1;

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
  };

  // If we've completed all days for this week
  if (rule.completions >= rule.daysOfWeek.length) {
    updates.status = "completed";
    updates.completedAt = completionDate;
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions >= rule.daysOfWeek.length
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions}/${rule.daysOfWeek.length} days this week)`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function completeRepeatingTaskWithInterval(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;
  if (!rule.interval || rule.interval <= 0 || !rule.startDate) {
    return {
      success: false,
      error: "Task is not configured for interval completion",
    };
  }

  const daysSinceStart = differenceInDays(completionDate, rule.startDate);

  if (!isTaskDueOn(task, completionDate)) {
    return {
      success: false,
      error: `Task is not due today. Next due in ${
        rule.interval - (daysSinceStart % rule.interval)
      } days`,
    };
  }

  // Calculate next due date directly from completion date + interval
  // This ensures the next due date is always exactly `interval` days from completion
  const nextDueDate = addDays(completionDate, rule.interval);

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
    dueDate: nextDueDate,
    completedAt: completionDate,
    status: "completed", // It's completed for today. The loader will reset it to pending tomorrow.
  };

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message: `Task completed. Next due on ${nextDueDate.toLocaleDateString()}`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}
