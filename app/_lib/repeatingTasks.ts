import { startOfDay, startOfWeek, getDay, addDays } from "date-fns";
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
      MONDAY_START_OF_WEEK
    );
    const correctStartDate = addDays(
      currentWeekStart,
      firstDayInWeek === 0 ? 7 : firstDayInWeek // Sunday (0) becomes day 7
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
      "Something went very wrong with the preCreateRepeatingTask function!"
    );
  }
}
