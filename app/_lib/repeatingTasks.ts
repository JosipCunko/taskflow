import {
  startOfDay,
  startOfWeek,
  getDay,
  addDays,
  addYears,
  subYears,
  differenceInDays,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
} from "date-fns";
import { DayOfWeek, Task } from "../_types/types";
import { MONDAY_START_OF_WEEK } from "../_utils/utils";

/** Calendar can be navigated at most 1 year before and 1 year after today. */
export function getCalendarDateBounds(today: Date = new Date()) {
  const todayStart = startOfDay(today);
  return {
    minDate: startOfDay(subYears(todayStart, 1)),
    maxDate: startOfDay(addYears(todayStart, 1)),
  };
}

export function isRepeatingTaskAvailableOnDate(
  task: Task,
  date: Date,
  today: Date = new Date(),
): boolean {
  if (!task.isRepeating || !task.repetitionRule) return false;

  const rule = task.repetitionRule;
  const day = startOfDay(date);
  const todayStart = startOfDay(today);
  const { minDate, maxDate } = getCalendarDateBounds(todayStart);

  if (isBefore(day, minDate) || isAfter(day, maxDate)) return false;

  // startDate is the first scheduled occurrence; fall back to createdAt
  const origin = startOfDay(task.startDate ?? task.createdAt);
  if (isBefore(day, origin)) return false;

  // ==================== INTERVAL TASKS ====================
  if (rule.interval) {
    if (rule.interval === 1) return true;
    const diff = differenceInDays(day, origin);
    return diff % rule.interval === 0;
  }

  // ==================== DAYS OF WEEK TASKS ====================
  if (rule.daysOfWeek.length > 0) {
    return rule.daysOfWeek.includes(getDay(day) as DayOfWeek);
  }

  // ==================== TIMES PER WEEK TASKS ====================
  if (rule.timesPerWeek) {
    const currentWeekStart = startOfWeek(todayStart, MONDAY_START_OF_WEEK);
    const selectedWeekStart = startOfWeek(day, MONDAY_START_OF_WEEK);
    const cycleWeekStart = startOfWeek(origin, MONDAY_START_OF_WEEK);

    if (isBefore(selectedWeekStart, currentWeekStart)) return false;
    if (isBefore(selectedWeekStart, cycleWeekStart)) return false;

    if (isEqual(selectedWeekStart, currentWeekStart)) {
      if (isAfter(cycleWeekStart, currentWeekStart)) return false;
      return rule.completions < rule.timesPerWeek;
    }

    return true;
  }

  return false;
}

export function wasRepeatingTaskCompletedOnDate(
  task: Task,
  date: Date,
): boolean {
  const timestamps = task.repetitionRule?.completedAt;
  if (!timestamps?.length) return false;
  return timestamps.some((timestamp) => isSameDay(timestamp, date));
}

export function shouldShowRepeatingTaskOnDate(
  task: Task,
  date: Date,
  today: Date = new Date(),
): boolean {
  return (
    wasRepeatingTaskCompletedOnDate(task, date) ||
    isRepeatingTaskAvailableOnDate(task, date, today)
  );
}

export function preCreateRepeatingTask(
  interval: number | undefined,
  timesPerWeek: number | undefined,
  daysOfWeek: DayOfWeek[],
  dueDate: number, // UNIX timestamp
  taskStartDate: number, // UNIX timestamp
): Partial<Task> {
  const dueDateObj = new Date(dueDate);
  const taskStartDateObj = new Date(taskStartDate);

  const setTimeForDueDate = (dateToModify: Date): number => {
    const newDate = new Date(dateToModify);
    newDate.setHours(dueDateObj.getHours(), dueDateObj.getMinutes());
    return newDate.getTime();
  };

  // ==================== INTERVAL TASKS ====================
  // startDate is set once at creation, dueDate = startDate initially
  if (interval) {
    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(taskStartDateObj),
      startDate: startOfDay(taskStartDateObj).getTime(),
      repetitionRule: {
        completedAt: [],
        interval,
        timesPerWeek: undefined,
        daysOfWeek: [],
        completions: 0,
      },
    };
  }

  // ==================== TIMES PER WEEK TASKS ====================
  // startDate is always Monday, dueDate is today (or the taskStartDate if it's today)
  if (timesPerWeek) {
    const weekStart = startOfWeek(taskStartDateObj, MONDAY_START_OF_WEEK);

    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(taskStartDateObj), // Due today (or start date)
      startDate: startOfDay(weekStart).getTime(), // Always Monday
      repetitionRule: {
        completedAt: [],
        timesPerWeek,
        interval: undefined,
        daysOfWeek: [],
        completions: 0,
      },
    };
  }

  // ==================== DAYS OF WEEK TASKS ====================
  // startDate is the first day in daysOfWeek array
  // dueDate is the next occurrence of the first day
  if (daysOfWeek && daysOfWeek?.length > 0) {
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    const firstDayInWeek = sortedDays[0]; // This is our startDate reference
    const startDay = getDay(taskStartDateObj);

    // Calculate when the first scheduled day occurs
    let nextDueDay = sortedDays.find((day) => day >= startDay);
    let daysUntilNextDue: number;

    if (nextDueDay !== undefined) {
      daysUntilNextDue = nextDueDay - startDay;
    } else {
      nextDueDay = sortedDays[0];
      daysUntilNextDue = 7 - startDay + nextDueDay;
    }

    const firstDueDate = addDays(taskStartDateObj, daysUntilNextDue);

    // Calculate startDate as the first day in daysOfWeek array
    const currentWeekStart = startOfWeek(
      taskStartDateObj,
      MONDAY_START_OF_WEEK,
    );
    const correctStartDate = addDays(
      currentWeekStart,
      firstDayInWeek === 0 ? 6 : firstDayInWeek - 1,
      //firstDayInWeek === 0 ? 7 : firstDayInWeek //sunday (0) becomes day 7
    );

    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(firstDueDate),
      startDate: startOfDay(correctStartDate).getTime(),
      repetitionRule: {
        completedAt: [],
        daysOfWeek: sortedDays,
        timesPerWeek: undefined,
        interval: undefined,
        completions: 0,
      },
    };
  } else {
    throw new Error(
      "Something went very wrong with the preCreateRepeatingTask function!",
    );
  }
}
