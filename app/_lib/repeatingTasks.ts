import { endOfWeek, startOfDay, startOfWeek, getDay, addDays } from "date-fns";
import { DayOfWeek, Task } from "../_types/types";
import { MONDAY_START_OF_WEEK } from "../utils";

export function preCreateRepeatingTask(
  interval: number | undefined,
  timesPerWeek: number | undefined,
  daysOfWeek: DayOfWeek[],
  dueDate: Date,
  taskStartDate: Date
): Partial<Task> {
  const setTimeForDueDate = (dateToModify: Date): Date => {
    const newDate = new Date(dateToModify); // Duplicate Date constructor but nvm
    newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
    return newDate;
  };

  if (interval) {
    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(taskStartDate),
      repetitionRule: {
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
      dueDate: setTimeForDueDate(
        endOfWeek(taskStartDate, MONDAY_START_OF_WEEK)
      ),
      repetitionRule: {
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
    const sortedDays = daysOfWeek.sort((a, b) => a - b);

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
      dueDate: setTimeForDueDate(firstDueDate),
      repetitionRule: {
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        startDate: startOfDay(taskStartDate),
        completions: 0,
      },
    };
  } else {
    throw new Error(
      "Something went very wrong with the preCreateRepeatingTask function!"
    );
  }
}
