"use server";

import {
  isSameWeek,
  startOfWeek,
  addDays,
  isBefore,
  getDay,
  isToday,
  endOfWeek,
  addWeeks,
} from "date-fns";
import type { Task, ActionResult, DayOfWeek } from "@/app/_types/types";
import { updateTask } from "./tasks";
import {
  formatDate,
  isRepeatingTaskDueToday,
  isTaskAtRisk,
  MONDAY_START_OF_WEEK,
} from "../utils";

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

  const { isDueToday } = isRepeatingTaskDueToday(task);
  if (!isDueToday || isBefore(completionDate, rule.startDate)) {
    return {
      success: false,
      error: "Task is not scheduled for today",
    };
  }

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);
  if (!isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }
  rule.completions = rule.completions + 1;

  // Next due date
  let nextDueDate: Date;
  let newStartDate: Date;
  if (rule.completions === rule.timesPerWeek) {
    const nextWeekStart = startOfWeek(
      addWeeks(completionDate, 1),
      MONDAY_START_OF_WEEK
    );
    nextDueDate = endOfWeek(nextWeekStart, MONDAY_START_OF_WEEK);
    newStartDate = nextWeekStart;
  } else {
    nextDueDate = endOfWeek(completionDate, MONDAY_START_OF_WEEK);
    newStartDate = rule.startDate;
  }

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      startDate: newStartDate,
      lastInstanceCompletedDate: completionDate,
    },
    dueDate: nextDueDate,
    risk: isTaskAtRisk(task),
  };

  if (rule.completions === rule.timesPerWeek) {
    updates.status = "completed";
    updates.completedAt = completionDate;
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions === rule.timesPerWeek
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
  const { isDueToday } = isRepeatingTaskDueToday(task);
  if (!isDueToday || isBefore(completionDate, rule.startDate)) {
    return {
      success: false,
      error: "Task is not scheduled for today",
    };
  }
  // Next due date
  const today = getDay(completionDate) as DayOfWeek;
  let newDueDate: Date;

  let nextDueDay = (today + 1) % 7;
  while (!rule.daysOfWeek.includes(nextDueDay as DayOfWeek)) {
    nextDueDay = (nextDueDay + 1) % 7;
  }
  const daysUntilNext = (nextDueDay - today + 7) % 7;

  if (isDueToday) {
    if (
      rule.lastInstanceCompletedDate &&
      isToday(rule.lastInstanceCompletedDate)
    ) {
      newDueDate = addDays(completionDate, daysUntilNext);
    } else {
      newDueDate = completionDate;
    }
  } else {
    newDueDate = addDays(completionDate, daysUntilNext);
  }

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);
  if (!isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }
  rule.completions = rule.completions + 1;

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
    dueDate: newDueDate,
    risk: isTaskAtRisk(task),
  };

  if (rule.completions === rule.daysOfWeek.length) {
    updates.status = "completed";
    updates.completedAt = completionDate;
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions === rule.daysOfWeek.length
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
  if (!rule.interval || rule.interval <= 0) {
    return {
      success: false,
      error: "Task is not configured for interval completion",
    };
  }

  const { isDueToday, daysSinceStart } = isRepeatingTaskDueToday(task);
  if (!isDueToday || isBefore(completionDate, rule.startDate)) {
    return {
      success: false,
      error: `Task is not due today. Next due in ${
        rule.interval - (daysSinceStart! % rule.interval)
      } days`,
    };
  }
  // Next due date
  completionDate.setHours(task.dueDate.getHours());
  completionDate.setMinutes(task.dueDate.getMinutes());
  const nextDueDate = addDays(completionDate, rule.interval);

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
    dueDate: nextDueDate,
    completedAt: completionDate,
    status: "completed",
    risk: isTaskAtRisk(task),
  };

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message: `Task completed. Next due on ${formatDate(nextDueDate)}`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}
