"use server";

import {
  addDays,
  differenceInDays,
  isSameDay,
  isSameWeek,
  startOfWeek,
} from "date-fns";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Task, ActionResult, DayOfWeek } from "@/app/_types/types";
import { getDay } from "date-fns";
import { Timestamp } from "firebase/firestore";

const MONDAY_START_OF_WEEK = { weekStartsOn: 1 } as const;

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

  // Check if task is configured for times per week
  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return {
      success: false,
      error: "Task is not configured for times per week completion",
    };
  }

  // Check if already completed today
  if (
    rule.lastInstanceCompletedDate &&
    isSameDay(rule.lastInstanceCompletedDate, completionDate)
  ) {
    return {
      success: false,
      error: "Task already completed today",
    };
  }

  // Get current week start (Monday)
  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);

  // If this is a new week, reset completions
  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }

  // Increment completions
  rule.completions = (rule.completions || 0) + 1;

  // Update task status
  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
  };

  // If we've reached the required completions for the week
  if (rule.completions >= rule.timesPerWeek) {
    updates.status = "completed";
    updates.completedAt = completionDate;
  }

  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, updates);

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

  // Check if task is configured for specific days
  if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
    return {
      success: false,
      error: "Task is not configured for specific days of week",
    };
  }

  // Check if today is one of the scheduled days
  const today = getDay(completionDate) as DayOfWeek;
  if (!rule.daysOfWeek.includes(today)) {
    return {
      success: false,
      error: "Task is not scheduled for today",
    };
  }

  // Check if already completed today
  if (
    rule.lastInstanceCompletedDate &&
    isSameDay(rule.lastInstanceCompletedDate, completionDate)
  ) {
    return {
      success: false,
      error: "Task already completed today",
    };
  }

  // Get current week start (Monday)
  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);

  // If this is a new week, reset completions
  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }

  // Increment completions
  rule.completions = (rule.completions || 0) + 1;

  // Update task status
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
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, updates);

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

  // Check if task is configured for interval
  if (!rule.interval || rule.interval <= 0 || !rule.startDate) {
    return {
      success: false,
      error: "Task is not configured for interval completion",
    };
  }

  // Check if already completed today
  if (
    rule.lastInstanceCompletedDate &&
    isSameDay(rule.lastInstanceCompletedDate, completionDate)
  ) {
    return {
      success: false,
      error: "Task already completed today",
    };
  }

  // Calculate days since start
  const daysSinceStart = differenceInDays(completionDate, rule.startDate);

  // Check if today is a due day (divisible by interval)
  if (daysSinceStart % rule.interval !== 0) {
    return {
      success: false,
      error: `Task is not due today. Next due in ${
        rule.interval - (daysSinceStart % rule.interval)
      } days`,
    };
  }

  // Calculate next due date
  const nextDueDate = addDays(completionDate, rule.interval);

  // Update task status
  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      lastInstanceCompletedDate: completionDate,
    },
    dueDate: nextDueDate,
    completedAt: completionDate,
    status: "completed",
  };

  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, updates);

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

export async function loadRepeatingTaskWithInterval(
  task: Task,
  currentDate: Date = new Date()
): Promise<Task> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.interval || !rule.startDate) {
    return task;
  }

  // Calculate days since start
  const daysSinceStart = differenceInDays(currentDate, rule.startDate);

  // Check if today is a due day (divisible by interval)
  const isDueToday = daysSinceStart % rule.interval === 0;

  // Calculate next due date
  const nextDueDate = isDueToday
    ? addDays(currentDate, rule.interval)
    : addDays(currentDate, rule.interval - (daysSinceStart % rule.interval));

  return {
    ...task,
    status: isDueToday ? "pending" : "pending",
    dueDate: nextDueDate,
    repetitionRule: {
      ...rule,
      startDate: task.createdAt,
    },
  };
}

export async function loadRepeatingTaskWithDaysOfWeek(
  task: Task,
  currentDate: Date = new Date()
): Promise<Task> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
    return task;
  }

  // Get current week start (Monday)
  const weekStart = startOfWeek(currentDate, MONDAY_START_OF_WEEK);

  // Check if today is one of the scheduled days
  const today = getDay(currentDate) as DayOfWeek;
  const isDueToday = rule.daysOfWeek.includes(today);

  // Find the next due day
  let nextDueDay = today;
  while (!rule.daysOfWeek.includes(nextDueDay as DayOfWeek)) {
    nextDueDay = (nextDueDay + 1) % 7;
  }

  // Calculate days until next due
  const daysUntilNext = (nextDueDay - today + 7) % 7;
  const nextDueDate = addDays(currentDate, daysUntilNext);

  // If this is a new week, reset completions
  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    const updatedTask: Task = {
      ...task,
      status: "pending",
      dueDate: nextDueDate,
      repetitionRule: {
        ...rule,
        startDate: weekStart,
        completions: 0,
      },
    };

    // Update the task in Firestore
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        status: updatedTask.status,
        dueDate: Timestamp.fromDate(nextDueDate),
        "repetitionRule.startDate": Timestamp.fromDate(weekStart),
        "repetitionRule.completions": 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating repeating task:", error);
    }

    return updatedTask;
  }

  const updatedTask: Task = {
    ...task,
    status: "pending",
    dueDate: nextDueDate,
    repetitionRule: {
      ...rule,
      startDate: weekStart,
    },
  };

  // Update the task in Firestore
  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      status: updatedTask.status,
      dueDate: Timestamp.fromDate(nextDueDate),
      "repetitionRule.startDate": Timestamp.fromDate(weekStart),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating repeating task:", error);
  }

  return updatedTask;
}

export async function loadRepeatingTaskWithTimesPerWeek(
  task: Task,
  currentDate: Date = new Date()
): Promise<Task> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return task;
  }

  // Get current week start (Monday)
  const weekStart = startOfWeek(currentDate, MONDAY_START_OF_WEEK);

  // Calculate remaining completions needed
  const remainingCompletions = rule.timesPerWeek - (rule.completions || 0);

  // Calculate days left in week
  const daysLeftInWeek = 7 - getDay(currentDate);

  // Check if task is at risk of not being completed
  const isAtRisk =
    remainingCompletions > daysLeftInWeek && rule.completions === 0;

  // If this is a new week, reset completions
  if (
    !rule.startDate ||
    !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
  ) {
    const updatedTask: Task = {
      ...task,
      status: "pending",
      repetitionRule: {
        ...rule,
        startDate: weekStart,
        completions: 0,
      },
    };

    // Update the task in Firestore
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        status: updatedTask.status,
        "repetitionRule.startDate": Timestamp.fromDate(weekStart),
        "repetitionRule.completions": 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating repeating task:", error);
    }

    return updatedTask;
  }

  const updatedTask: Task = {
    ...task,
    status: "pending",
    repetitionRule: {
      ...rule,
      startDate: weekStart,
    },
  };

  // Update the task in Firestore
  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      status: updatedTask.status,
      "repetitionRule.startDate": Timestamp.fromDate(weekStart),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating repeating task:", error);
  }

  return updatedTask;
}
