import {
  addDays,
  differenceInDays,
  endOfWeek,
  getDay,
  isSameDay,
  isSameWeek,
  startOfWeek,
} from "date-fns";
import { DayOfWeek, RepetitionFrequency, Task } from "../_types/types";
import {
  calculateNextDueDate,
  isTaskDueOn,
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
      dueDate: endOfWeek(taskStartDate, MONDAY_START_OF_WEEK),
      repetitionRule: {
        frequency: "weekly",
        timesPerWeek,
        interval: undefined,
        daysOfWeek: [],
        lastInstanceCompletedDate: undefined,
        startDate: startOfWeek(taskStartDate),
        completions: 0,
      },
    };
  }
  if (daysOfWeek && daysOfWeek?.length > 0) {
    return {
      isRepeating: true,
      dueDate: endOfWeek(taskStartDate, MONDAY_START_OF_WEEK),
      repetitionRule: {
        frequency: "weekly",
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        lastInstanceCompletedDate: undefined,
        startDate: startOfWeek(taskStartDate),
        completions: 0,
      },
    };
  } else return { isRepeating: false, dueDate, repetitionRule: undefined };
}

export function loadRepeatingTaskWithTimesPerWeek(
  task: Task,
  currentDate: Date = new Date()
): Task & Partial<{ risk: boolean; isDueToday: boolean }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return task;
  }

  const weekStart = startOfWeek(currentDate, MONDAY_START_OF_WEEK);
  const remainingCompletions = rule.timesPerWeek - (rule.completions || 0);
  const daysLeftInWeek = 7 - getDay(currentDate);

  //Create the warning one day before
  const isAtRisk = remainingCompletions >= daysLeftInWeek - 1;
  const fullyCompleted = rule.completions === rule.timesPerWeek;

  return {
    ...task,
    status: fullyCompleted ? "completed" : "pending",
    dueDate: endOfWeek(currentDate, MONDAY_START_OF_WEEK),
    risk: isAtRisk,
    isDueToday: isTaskDueOn(task, currentDate),
    repetitionRule: {
      ...rule,
      startDate: weekStart,
      completions: !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
        ? 0
        : rule.completions,
    },
  };
}

export function loadRepeatingTaskWithDaysOfWeek(
  task: Task,
  currentDate: Date = new Date()
): Task & Partial<{ isDueToday: boolean }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (rule.daysOfWeek.length === 0) {
    return task;
  }

  const weekStart = startOfWeek(currentDate, MONDAY_START_OF_WEEK);
  const fullyCompleted = rule.daysOfWeek.length === rule.completions;

  const nextDueDate = calculateNextDueDate(task, currentDate);

  return {
    ...task,
    status: fullyCompleted ? "completed" : "pending",
    dueDate: nextDueDate as Date,
    repetitionRule: {
      ...rule,
      startDate: weekStart,
      completions: !isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)
        ? 0
        : rule.completions,
    },
    isDueToday: isTaskDueOn(task, currentDate),
  };
}

export function loadRepeatingTaskWithInterval(
  task: Task,
  currentDate: Date = new Date()
): Task & Partial<{ isDueToday: boolean; nextDueDate: Date }> {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.interval || !rule.startDate) {
    return task;
  }

  const effectiveStartDate = task.createdAt;

  const daysSinceStart = differenceInDays(currentDate, effectiveStartDate);
  let isDueToday = false;
  let newStatus = task.status;

  if (daysSinceStart >= 0 && daysSinceStart % rule.interval === 0) {
    // It's a scheduled due day
    if (
      task.status !== "completed" ||
      !isSameDay(task.completedAt || 0, currentDate)
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

  let nextDueDate: Date;
  nextDueDate = new Date(); // Ignore error
  const cyclesPassed = Math.floor(daysSinceStart / rule.interval);
  let nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
  if (isDueToday && task.status !== "completed") {
    nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
  } else if (isDueToday && task.status === "completed") {
    nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
  } else {
    const remainder = daysSinceStart % rule.interval;
    if (remainder >= 0) {
      // It's after the last due date or on a non-due day
      nextDueCycleOffset = (cyclesPassed + 1) * rule.interval;
    } else {
      nextDueCycleOffset = rule.interval;
    }
  }
  nextDueDate = addDays(effectiveStartDate, nextDueCycleOffset);
  return {
    ...task,
    status: newStatus,
    dueDate: nextDueDate,
    isDueToday,
    nextDueDate,
  };
}
