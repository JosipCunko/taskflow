import {
  endOfWeek,
  startOfDay,
  startOfWeek,
  getDay,
  addDays,
  endOfDay,
} from "date-fns";
import { DayOfWeek, RepetitionFrequency, Task } from "../_types/types";
import { MONDAY_START_OF_WEEK } from "../utils";

export function preCreateRepeatingTask(
  interval: number | undefined,
  timesPerWeek: number | undefined,
  daysOfWeek: DayOfWeek[],
  dueDateWithTime: Date,
  taskStartDate: Date
): Partial<Task> {
  const setTimeFromDueDate = (dateToModify: Date): Date => {
    const newDate = new Date(dateToModify);
    const timeSource = new Date(dueDateWithTime);
    newDate.setHours(
      timeSource.getHours(),
      timeSource.getMinutes(),
      timeSource.getSeconds(),
      timeSource.getMilliseconds()
    );
    return newDate;
  };

  if (interval) {
    let frequency: RepetitionFrequency;
    if (interval === 1) frequency = "daily";
    else if (interval >= 2 && interval <= 7) frequency = "weekly";
    else frequency = "monthly";
    return {
      isRepeating: true,
      dueDate: setTimeFromDueDate(endOfDay(taskStartDate)),
      repetitionRule: {
        frequency,
        interval,
        timesPerWeek: undefined,
        daysOfWeek: [],
        startDate: startOfDay(taskStartDate),
        completions: 0,
      },
    };
  }
  if (timesPerWeek) {
    return {
      isRepeating: true,
      dueDate: setTimeFromDueDate(
        endOfWeek(taskStartDate, MONDAY_START_OF_WEEK)
      ),
      repetitionRule: {
        frequency: "weekly",
        timesPerWeek,
        interval: undefined,
        daysOfWeek: [],
        startDate: startOfDay(startOfWeek(taskStartDate, MONDAY_START_OF_WEEK)),
        completions: 0,
      },
    };
  }
  if (daysOfWeek && daysOfWeek?.length > 0) {
    const startDay = getDay(taskStartDate);
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

    let nextDueDay = sortedDays.find((day) => day >= startDay);
    let daysUntilNextDue: number;

    if (nextDueDay !== undefined) {
      daysUntilNextDue = nextDueDay - startDay;
    } else {
      nextDueDay = sortedDays[0];
      daysUntilNextDue = 7 - startDay + nextDueDay;
    }

    const firstDueDate = addDays(taskStartDate, daysUntilNextDue);

    return {
      isRepeating: true,
      dueDate: setTimeFromDueDate(endOfDay(firstDueDate)),
      repetitionRule: {
        frequency: "weekly",
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        startDate: startOfDay(taskStartDate),
        completions: 0,
      },
    };
  } else {
    return {
      isRepeating: false,
      dueDate: dueDateWithTime,
      repetitionRule: undefined,
    };
  }
}
