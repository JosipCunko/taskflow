import {
  startOfDay,
  startOfWeek,
  getDay,
  addYears,
  subYears,
  differenceInDays,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
} from "date-fns";
import { DayOfWeek, Task } from "../_types/types";

export const MONDAY_START_OF_WEEK = { weekStartsOn: 1 } as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** UTC noon on a calendar day — stays on that day in every TZ from UTC-12 to UTC+12. */
export function utcNoon(date: Date | number): Date {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0),
  );
}

/** Monday 12:00 UTC of the week that contains `date` (week starts Monday). */
export function getWeekStartUtc(date: Date | number = new Date()): Date {
  const noon = utcNoon(date);
  const day = noon.getUTCDay(); // 0 Sun … 6 Sat
  const offset = day === 0 ? 6 : day - 1;
  return new Date(noon.getTime() - offset * MS_PER_DAY);
}

export function countCompletionsInWeek(
  completedAt: number[] | undefined,
  dateInWeek: Date | number = new Date(),
): number {
  if (!completedAt?.length) return 0;
  const weekStart = getWeekStartUtc(dateInWeek).getTime();
  const weekEnd = weekStart + 7 * MS_PER_DAY;
  return completedAt.filter((ts) => ts >= weekStart && ts < weekEnd).length;
}

/**
 * Weekly cycle progress. Prefer completion history so a wiped counter
 * cannot hide work already done this week. Fall back to `completions`
 * only when history was never recorded (legacy tasks).
 */
export function getCurrentCycleCompletions(
  task: Task,
  today: Date | number = new Date(),
): number {
  const rule = task.repetitionRule;
  if (!rule) return 0;
  const usesWeeklyCycle =
    !!rule.timesPerWeek || (rule.daysOfWeek?.length ?? 0) > 0;
  if (!usesWeeklyCycle) return rule.completions ?? 0;
  if (rule.completedAt?.length) {
    return countCompletionsInWeek(rule.completedAt, today);
  }
  return rule.completions ?? 0;
}

export function getDaysOfWeekAnchorUtc(
  dateInWeek: Date | number,
  firstDayInWeek: DayOfWeek,
): Date {
  const monday = getWeekStartUtc(dateInWeek);
  const offset = firstDayInWeek === 0 ? 6 : firstDayInWeek - 1;
  return new Date(monday.getTime() + offset * MS_PER_DAY);
}

export function daysUntilNextScheduledDay(
  fromDay: DayOfWeek,
  targetDay: DayOfWeek,
  { inclusive = false }: { inclusive?: boolean } = {},
): number {
  const diff = (targetDay - fromDay + 7) % 7;
  if (diff === 0) return inclusive ? 0 : 7;
  return diff;
}

export function nextScheduledDateUtc(
  from: Date | number,
  daysOfWeek: DayOfWeek[],
  { inclusive = false }: { inclusive?: boolean } = {},
): Date {
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const fromNoon = utcNoon(from);
  const fromDay = fromNoon.getUTCDay() as DayOfWeek;
  const candidates = inclusive
    ? sorted
    : sorted.filter((day) => day !== fromDay);
  const searchDays = candidates.length > 0 ? candidates : sorted;
  let best = 8;
  for (const day of searchDays) {
    const until = daysUntilNextScheduledDay(fromDay, day, {
      inclusive: inclusive && day === fromDay,
    });
    if (until < best) best = until;
  }
  if (best === 8) best = 7;
  return new Date(fromNoon.getTime() + best * MS_PER_DAY);
}

function copyClockTime(source: Date | number, target: Date): Date {
  const src = new Date(source);
  const out = new Date(target);
  out.setUTCHours(
    src.getUTCHours(),
    src.getUTCMinutes(),
    src.getUTCSeconds(),
    0,
  );
  return out;
}

function utcDayIndex(date: Date | number): number {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / MS_PER_DAY;
}

function isSameUtcDay(a: Date | number, b: Date | number): boolean {
  return utcDayIndex(a) === utcDayIndex(b);
}

function isSameUtcMonth(a: Date | number, b: Date | number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth()
  );
}

function applyWeeklyPoints(
  currentPoints: number,
  completedCount: number,
  requiredCount: number,
): number {
  const missedCount = requiredCount - completedCount;
  if (completedCount > missedCount) {
    return Math.min(10, currentPoints + 2);
  }
  if (completedCount < requiredCount) {
    return Math.max(2, currentPoints - 2);
  }
  return currentPoints;
}

export type RepeatingTaskDailyUpdates = {
  status?: Task["status"];
  dueDate?: number;
  startDate?: number;
  points?: number;
  completedAt?: number;
  "repetitionRule.completions"?: number;
};

function setIfChanged<K extends keyof RepeatingTaskDailyUpdates>(
  updates: RepeatingTaskDailyUpdates,
  key: K,
  newValue: RepeatingTaskDailyUpdates[K],
  currentValue: unknown,
) {
  if (newValue !== undefined && newValue !== currentValue) {
    updates[key] = newValue;
  }
}

/**
 * Daily maintenance for one repeating task.
 *
 * Week identity and progress come from completion timestamps, not from
 * `startDate`. Client-created startDates are local midnights, which look like
 * the previous week on a UTC server and used to wipe in-progress counts.
 */
export function getRepeatingTaskDailyUpdates(
  task: Task,
  today: Date = new Date(),
): RepeatingTaskDailyUpdates {
  const rule = task.repetitionRule;
  if (!rule) return {};

  const updates: RepeatingTaskDailyUpdates = {};
  const todayNoon = utcNoon(today);
  const currentWeekStart = getWeekStartUtc(today);
  const isRecentlyCreated =
    utcDayIndex(today) - utcDayIndex(task.createdAt) < 1;

  // ==================== INTERVAL TASKS ====================
  if (rule.interval && rule.interval > 0) {
    const dueNoon = utcNoon(task.dueDate);
    const taskIsPastDue = dueNoon.getTime() < todayNoon.getTime();
    const wasCompletedOnDueDate = rule.completedAt?.some((completedDate) =>
      isSameUtcDay(completedDate, task.dueDate),
    );
    const isCompletedToday =
      (task.completedAt != null && isSameUtcDay(task.completedAt, today)) ||
      rule.completedAt?.some((d) => isSameUtcDay(d, today));

    if (taskIsPastDue && !wasCompletedOnDueDate && !isRecentlyCreated) {
      setIfChanged(
        updates,
        "points",
        Math.max(2, task.points - 2),
        task.points,
      );
    }

    if (!isCompletedToday) {
      if (taskIsPastDue || (task.status === "completed" && !isCompletedToday)) {
        setIfChanged(updates, "status", "pending", task.status);
        setIfChanged(
          updates,
          "repetitionRule.completions",
          0,
          rule.completions,
        );
      }

      if (taskIsPastDue) {
        if (!isSameUtcMonth(task.dueDate, today)) {
          setIfChanged(updates, "points", 10, task.points);
        }

        let nextDue = new Date(task.dueDate);
        while (utcNoon(nextDue).getTime() < todayNoon.getTime()) {
          nextDue = new Date(nextDue.getTime() + rule.interval * MS_PER_DAY);
        }
        setIfChanged(updates, "dueDate", nextDue.getTime(), task.dueDate);
      }
    }

    return updates;
  }

  // ==================== TIMES PER WEEK TASKS ====================
  if (rule.timesPerWeek) {
    const thisWeekCompletions = getCurrentCycleCompletions(task, today);
    const required = rule.timesPerWeek;
    const isFullyCompleted = thisWeekCompletions >= required;

    setIfChanged(
      updates,
      "repetitionRule.completions",
      thisWeekCompletions,
      rule.completions,
    );

    const storedWeekStart = getWeekStartUtc(task.startDate ?? task.dueDate);
    if (
      storedWeekStart.getTime() < currentWeekStart.getTime() &&
      thisWeekCompletions === 0 &&
      !isRecentlyCreated
    ) {
      const previousWeekCompletions = countCompletionsInWeek(
        rule.completedAt,
        storedWeekStart,
      );
      setIfChanged(
        updates,
        "points",
        applyWeeklyPoints(task.points, previousWeekCompletions, required),
        task.points,
      );
    }

    if (isFullyCompleted) {
      const nextMonday = new Date(currentWeekStart.getTime() + 7 * MS_PER_DAY);
      setIfChanged(updates, "startDate", nextMonday.getTime(), task.startDate);
      setIfChanged(
        updates,
        "dueDate",
        copyClockTime(task.dueDate, nextMonday).getTime(),
        task.dueDate,
      );
      setIfChanged(updates, "status", "completed", task.status);
    } else {
      setIfChanged(
        updates,
        "startDate",
        currentWeekStart.getTime(),
        task.startDate,
      );
      setIfChanged(
        updates,
        "dueDate",
        copyClockTime(task.dueDate, todayNoon).getTime(),
        task.dueDate,
      );
      if (task.status === "completed") {
        setIfChanged(updates, "status", "pending", task.status);
      }
    }

    return updates;
  }

  // ==================== DAYS OF WEEK TASKS ====================
  if (rule.daysOfWeek.length > 0) {
    const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);
    const firstDayInWeek = sortedDays[0];
    const required = sortedDays.length;
    const thisWeekCompletions = getCurrentCycleCompletions(task, today);
    const isFullyCompleted = thisWeekCompletions >= required;
    const todayDay = todayNoon.getUTCDay() as DayOfWeek;
    const isTodayScheduled = sortedDays.includes(todayDay);
    const completedToday = rule.completedAt?.some((d) => isSameUtcDay(d, today));

    setIfChanged(
      updates,
      "repetitionRule.completions",
      thisWeekCompletions,
      rule.completions,
    );

    const storedWeekStart = getWeekStartUtc(task.startDate ?? task.dueDate);
    if (
      storedWeekStart.getTime() < currentWeekStart.getTime() &&
      thisWeekCompletions === 0 &&
      !isRecentlyCreated
    ) {
      const previousWeekCompletions = countCompletionsInWeek(
        rule.completedAt,
        storedWeekStart,
      );
      setIfChanged(
        updates,
        "points",
        applyWeeklyPoints(task.points, previousWeekCompletions, required),
        task.points,
      );
    }

    if (isFullyCompleted) {
      const nextWeekAnchor = getDaysOfWeekAnchorUtc(
        currentWeekStart.getTime() + 7 * MS_PER_DAY,
        firstDayInWeek,
      );
      setIfChanged(
        updates,
        "startDate",
        nextWeekAnchor.getTime(),
        task.startDate,
      );
      setIfChanged(
        updates,
        "dueDate",
        copyClockTime(task.dueDate, nextWeekAnchor).getTime(),
        task.dueDate,
      );
      setIfChanged(updates, "status", "completed", task.status);
    } else {
      const thisWeekAnchor = getDaysOfWeekAnchorUtc(
        currentWeekStart,
        firstDayInWeek,
      );
      setIfChanged(
        updates,
        "startDate",
        thisWeekAnchor.getTime(),
        task.startDate,
      );

      let nextDueNoon: Date;
      if (isTodayScheduled && !completedToday) {
        nextDueNoon = todayNoon;
      } else {
        nextDueNoon = nextScheduledDateUtc(today, sortedDays, {
          inclusive: isTodayScheduled && !completedToday,
        });
      }

      setIfChanged(
        updates,
        "dueDate",
        copyClockTime(task.dueDate, nextDueNoon).getTime(),
        task.dueDate,
      );
      if (task.status === "completed") {
        setIfChanged(updates, "status", "pending", task.status);
      }
    }

    return updates;
  }

  return updates;
}

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
    // Calendar cells use the viewer's local week, not the UTC cycle week.
    const currentWeekStart = startOfWeek(todayStart, MONDAY_START_OF_WEEK);
    const selectedWeekStart = startOfWeek(day, MONDAY_START_OF_WEEK);
    const cycleWeekStart = startOfWeek(origin, MONDAY_START_OF_WEEK);

    if (isBefore(selectedWeekStart, currentWeekStart)) return false;
    if (isBefore(selectedWeekStart, cycleWeekStart)) return false;

    if (isEqual(selectedWeekStart, currentWeekStart)) {
      if (isAfter(cycleWeekStart, currentWeekStart)) return false;
      return getCurrentCycleCompletions(task, today) < rule.timesPerWeek;
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
    return copyClockTime(dueDateObj, utcNoon(dateToModify)).getTime();
  };

  // ==================== INTERVAL TASKS ====================
  // startDate is set once at creation, dueDate = startDate initially
  if (interval) {
    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(taskStartDateObj),
      startDate: utcNoon(taskStartDateObj).getTime(),
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
  // startDate is always Monday (UTC noon), dueDate is the start date
  if (timesPerWeek) {
    const weekStart = getWeekStartUtc(taskStartDateObj);

    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(taskStartDateObj),
      startDate: weekStart.getTime(),
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
  if (daysOfWeek && daysOfWeek?.length > 0) {
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    const firstDayInWeek = sortedDays[0];
    const startNoon = utcNoon(taskStartDateObj);
    const startDay = startNoon.getUTCDay() as DayOfWeek;
    const nextDueDay =
      sortedDays.find((day) => day >= startDay) ?? sortedDays[0];
    const until = daysUntilNextScheduledDay(startDay, nextDueDay, {
      inclusive: true,
    });
    const firstDueDate = new Date(startNoon.getTime() + until * MS_PER_DAY);

    const correctStartDate = getDaysOfWeekAnchorUtc(
      taskStartDateObj,
      firstDayInWeek,
    );

    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(firstDueDate),
      startDate: correctStartDate.getTime(),
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
