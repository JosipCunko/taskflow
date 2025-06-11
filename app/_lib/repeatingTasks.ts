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

export function loadRepeatingTaskWithTimesPerWeek(task: Task): Task {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const rule = task.repetitionRule;
  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return task;
  }

  const currentDate = new Date();
  const today = startOfDay(currentDate);
  const inSameWeek = isSameWeek(today, rule.startDate, MONDAY_START_OF_WEEK);
  const currentCompletions = inSameWeek ? rule.completions || 0 : 0;
  const fullyCompleted = currentCompletions === rule.timesPerWeek;
  const status = fullyCompleted ? "completed" : "pending";
  const dueDate = startOfDay(endOfWeek(today, MONDAY_START_OF_WEEK));

  const loadedTask = {
    ...task,
    status,
    dueDate,
    repetitionRule: {
      ...rule,
      completions: currentCompletions,
    },
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}

export function loadRepeatingTaskWithDaysOfWeek(task: Task): Task {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }
  const currentDate = new Date();
  const rule = task.repetitionRule;
  if (rule.daysOfWeek.length === 0) {
    return task;
  }

  const today = startOfDay(currentDate);
  const inSameWeek = isSameWeek(today, rule.startDate, MONDAY_START_OF_WEEK);
  const currentCompletions = inSameWeek ? rule.completions || 0 : 0;
  const fullyCompleted = currentCompletions === rule.daysOfWeek.length;
  const nextDueDate = calculateNextDueDate(task, currentDate);
  const status = fullyCompleted ? "completed" : "pending";

  const loadedTask = {
    ...task,
    status,
    dueDate: nextDueDate as Date,
    repetitionRule: {
      ...rule,
      completions: currentCompletions,
    },
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}

export function loadRepeatingTaskWithInterval(task: Task): Task {
  if (!task.isRepeating || !task.repetitionRule) {
    return task;
  }

  const currentDate = new Date();
  const rule = task.repetitionRule;
  if (!rule.interval || rule.interval === 0) {
    return task;
  }

  const startDate = startOfDay(rule.startDate);
  const today = startOfDay(currentDate);
  const daysSinceStart = differenceInDays(today, startDate);

  if (daysSinceStart < 0) {
    return {
      ...task,
      status: "pending",
      dueDate: startDate,
      risk: false,
    };
  }

  const isScheduledToday = daysSinceStart % rule.interval === 0;
  const completedToday =
    rule.lastInstanceCompletedDate &&
    isSameDay(rule.lastInstanceCompletedDate, today);

  let status: "pending" | "completed" | "delayed" = task.status;
  let dueDate = new Date(task.dueDate);

  if (isScheduledToday) {
    if (completedToday) {
      status = "completed";
      dueDate = calculateNextDueDate(task, currentDate) as Date;
    } else {
      status = "pending";
      dueDate = today;
    }
  } else {
    const nextScheduledDayOffset =
      rule.interval - (daysSinceStart % rule.interval);
    dueDate = addDays(today, nextScheduledDayOffset);
    status = "pending";
  }

  const loadedTask = {
    ...task,
    status,
    dueDate,
  } as Task;

  const isAtRisk = isTaskAtRisk(loadedTask, currentDate);

  return {
    ...loadedTask,
    risk: isAtRisk,
  };
}
