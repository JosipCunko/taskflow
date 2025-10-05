import { endOfWeek, startOfDay, startOfWeek, getDay, addDays } from "date-fns";
import { DayOfWeek, Task } from "../_types/types";
import { MONDAY_START_OF_WEEK } from "../_utils/utils";

export function preCreateRepeatingTask(
  interval: number | undefined,
  timesPerWeek: number | undefined,
  daysOfWeek: DayOfWeek[],
  dueDate: number, // UNIX timestamp
  taskStartDate: number // UNIX timestamp
): Partial<Task> {
  const dueDateObj = new Date(dueDate);
  const taskStartDateObj = new Date(taskStartDate);
  
  const setTimeForDueDate = (dateToModify: Date): number => {
    const newDate = new Date(dateToModify);
    newDate.setHours(dueDateObj.getHours(), dueDateObj.getMinutes());
    return newDate.getTime();
  };

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
  if (timesPerWeek) {
    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(
        endOfWeek(taskStartDateObj, MONDAY_START_OF_WEEK)
      ),
      startDate: startOfDay(startOfWeek(taskStartDateObj, MONDAY_START_OF_WEEK)).getTime(),
      repetitionRule: {
        completedAt: [],
        timesPerWeek,
        interval: undefined,
        daysOfWeek: [],
        completions: 0,
      },
    };
  }
  if (daysOfWeek && daysOfWeek?.length > 0) {
    const startDay = getDay(taskStartDateObj);
    const sortedDays = daysOfWeek.sort((a, b) => a - b);

    let nextDueDay = sortedDays.find((day) => day >= startDay);
    let daysUntilNextDue: number;

    if (nextDueDay !== undefined) {
      daysUntilNextDue = nextDueDay - startDay;
    } else {
      nextDueDay = sortedDays[0];
      daysUntilNextDue = 7 - startDay + nextDueDay;
    }

    const firstDueDate = addDays(taskStartDateObj, daysUntilNextDue);

    return {
      isRepeating: true,
      dueDate: setTimeForDueDate(firstDueDate),
      startDate: startOfDay(taskStartDateObj).getTime(),
      repetitionRule: {
        completedAt: [],
        daysOfWeek,
        timesPerWeek: undefined,
        interval: undefined,
        completions: 0,
      },
    };
  } else {
    throw new Error(
      "Something went very wrong with the preCreateRepeatingTask function!"
    );
  }
}
