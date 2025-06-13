import { endOfWeek, startOfDay } from "date-fns";
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
        startDate: taskStartDate,
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
        startDate: taskStartDate,
        completions: 0,
      },
    };
  } else return { isRepeating: false, dueDate, repetitionRule: undefined };
}
