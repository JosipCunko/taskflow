import {
  addDays,
  differenceInDays,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfWeek,
  startOfDay,
} from "date-fns";
import { DayOfWeek, RepetitionFrequency, Task } from "../_types/types";
import {
  calculateNextDueDate,
  isTaskDueOn,
  isTaskAtRisk,
  MONDAY_START_OF_WEEK,
} from "../utils";

export function preCreateRepeatingTask(
  interval: number | undefined,
  timesPerWeek: number | undefined,
  daysOfWeek: DayOfWeek[],
  dueDate: Date,
  taskStartDate: Date
): Partial<Task> {
  if (interval) {
    let frequency: RepetitionFrequency;
    if (interval === 1) frequency = "daily";
    else if (interval >= 2 && interval <= 7) frequency = "weekly";
    else frequency = "monthly";
    return {
      isRepeating: true,
      dueDate,
      repetitionRule: {
        frequency,
        interval,
        timesPerWeek: undefined,
        daysOfWeek: [],
        lastInstanceCompletedDate: undefined,
        startDate: taskStartDate,
        completions: 0,
      },
    };
  }
  if (timesPerWeek) {
    return {
      isRepeating: true,
      dueDate: startOfDay(endOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
      repetitionRule: {
        frequency: "weekly",
        timesPerWeek,
        interval: undefined,
        daysOfWeek: [],
        lastInstanceCompletedDate: undefined,
        startDate: startOfDay(startOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
        completions: 0,
      },
    };
  }
  if (daysOfWeek && daysOfWeek?.length > 0) {
    return {
      isRepeating: true,
      dueDate: startOfDay(endOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
      repetitionRule: {
        frequency: "weekly",
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        lastInstanceCompletedDate: undefined,
        startDate: startOfDay(startOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
        completions: 0,
      },
    };
  } else return { isRepeating: false, dueDate, repetitionRule: undefined };
}

export function loadRepeatingTaskWithTimesPerWeek(
  task: Task
): Task & Partial<{ risk: boolean; isDueToday: boolean }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return task;
  }
  const currentDate = new Date();

  const taskStartOnDate = rule.startDate;
  const weekStart = startOfWeek(taskStartOnDate, MONDAY_START_OF_WEEK);
  const fullyCompleted = rule.completions === rule.timesPerWeek;

  const loadedTask = {
    ...task,
    status: fullyCompleted ? "completed" : "pending",
    dueDate: startOfDay(endOfWeek(taskStartOnDate, MONDAY_START_OF_WEEK)),
    isDueToday: isTaskDueOn(task, currentDate),
    repetitionRule: {
      ...rule,
      completions: !isSameWeek(taskStartOnDate, weekStart, MONDAY_START_OF_WEEK)
        ? 0
        : rule.completions,
    },
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}

export function loadRepeatingTaskWithDaysOfWeek(
  task: Task
): Task & Partial<{ isDueToday: boolean; risk: boolean }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }
  const currentDate = new Date();
  const rule = task.repetitionRule;
  if (rule.daysOfWeek.length === 0) {
    return task;
  }

  const taskStartOnDate = rule.startDate;
  const weekStart = startOfWeek(taskStartOnDate, MONDAY_START_OF_WEEK);
  const fullyCompleted = rule.daysOfWeek.length === rule.completions;

  const nextDueDate = calculateNextDueDate(task, currentDate);

  const loadedTask = {
    ...task,
    status: fullyCompleted ? "completed" : "pending",
    dueDate: nextDueDate as Date,
    repetitionRule: {
      ...rule,
      completions: !isSameWeek(taskStartOnDate, weekStart, MONDAY_START_OF_WEEK)
        ? 0
        : rule.completions,
    },
    isDueToday: isTaskDueOn(task, currentDate),
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}

export function loadRepeatingTaskWithInterval(
  task: Task
): Task & Partial<{ isDueToday: boolean; nextDueDate: Date; risk: boolean }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }
  const currentDate = new Date();
  const rule = task.repetitionRule;
  if (!rule.interval || !rule.startDate) {
    return task;
  }

  const effectiveStartDate = task.createdAt;
  const daysSinceStart = differenceInDays(currentDate, effectiveStartDate);

  let isDueToday = false;
  let newStatus = task.status;
  let nextDueDate: Date;

  // For daily tasks (interval = 1), always reset to today if overdue
  if (rule.interval === 1) {
    // Daily tasks should always be due today if not completed today
    const wasCompletedToday =
      rule.lastInstanceCompletedDate &&
      isSameDay(rule.lastInstanceCompletedDate, currentDate);

    if (!wasCompletedToday) {
      isDueToday = true;
      newStatus = "pending";
      nextDueDate = startOfDay(currentDate);
    } else {
      // Completed today, show as completed and next due tomorrow
      isDueToday = true;
      newStatus = "completed";
      nextDueDate = startOfDay(addDays(currentDate, 1));
    }
  } else {
    // For non-daily intervals, use the original logic
    if (daysSinceStart >= 0 && daysSinceStart % rule.interval === 0) {
      // It's a scheduled due day
      if (
        task.status !== "completed" ||
        !isSameDay(task.completedAt || new Date(0), currentDate)
      ) {
        isDueToday = true;
        newStatus = "pending";
      }
    } else if (
      task.status === "pending" &&
      task.dueDate &&
      currentDate > task.dueDate
    ) {
      newStatus = "pending";
    }

    // Calculate next due date for non-daily tasks
    const cyclesPassed = Math.floor(daysSinceStart / rule.interval);
    let nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;

    if (isDueToday && task.status !== "completed") {
      nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
    } else if (isDueToday && task.status === "completed") {
      nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
    } else {
      const remainder = daysSinceStart % rule.interval;
      if (remainder >= 0) {
        nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
      } else {
        nextDueCycleOffset = rule.interval;
      }
    }
    nextDueDate = addDays(effectiveStartDate, nextDueCycleOffset);
  }

  const loadedTask = {
    ...task,
    status: newStatus,
    dueDate: nextDueDate,
    isDueToday,
    nextDueDate,
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}
