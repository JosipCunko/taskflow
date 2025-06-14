import {
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  getDay,
  addDays,
} from "date-fns";
import { DayOfWeek, RepetitionFrequency, Task } from "../_types/types";
import { MONDAY_START_OF_WEEK } from "../utils";

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
      dueDate: endOfDay(taskStartDate),
      repetitionRule: {
        frequency,
        interval,
        timesPerWeek: undefined,
        daysOfWeek: [],
        lastInstanceCompletedDate: undefined,
        startDate: startOfDay(taskStartDate),
        completions: 0,
      },
    };
  }
  if (timesPerWeek) {
    return {
      isRepeating: true,
      dueDate: endOfDay(endOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
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
    const startDay = getDay(taskStartDate); // Sunday = 0, Monday = 1, etc.
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

    // Find the first day in the schedule that is on or after the start date's day of the week
    let nextDueDay = sortedDays.find((day) => day >= startDay);
    let daysUntilNextDue: number;

    if (nextDueDay !== undefined) {
      // A day was found in the same week as the start date
      daysUntilNextDue = nextDueDay - startDay;
    } else {
      // No due dates left in the current week, so schedule for the first available day next week
      nextDueDay = sortedDays[0];
      daysUntilNextDue = 7 - startDay + nextDueDay;
    }

    const firstDueDate = addDays(taskStartDate, daysUntilNextDue);

    return {
      isRepeating: true,
      dueDate: endOfDay(firstDueDate),
      repetitionRule: {
        frequency: "weekly",
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        lastInstanceCompletedDate: undefined,
        startDate: startOfDay(taskStartDate),
        completions: 0,
      },
    };
  } else return { isRepeating: false, dueDate, repetitionRule: undefined };
}
