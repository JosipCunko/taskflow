"use client";
import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { CalendarDays, ListChecks, AlertTriangle, Repeat } from "lucide-react";

import TaskCardSmall from "@/app/_components/TaskCardSmall";
import { Task } from "@/app/_types/types";
import { formatDate } from "@/app/_utils/utils";
import {
  getCalendarDateBounds,
  shouldShowRepeatingTaskOnDate,
} from "@/app/_lib/repeatingTasks";

export default function Calendar({
  tasks,
  repeatingTasks,
}: {
  tasks: Task[];
  repeatingTasks: Task[];
}) {
  const today = useMemo(() => new Date(), []);
  const { minDate, maxDate } = useMemo(
    () => getCalendarDateBounds(today),
    [today],
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  /** Memoized list of regular tasks for the selected day */
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((task) => isSameDay(task.dueDate, selectedDate));
  }, [selectedDate, tasks]);

  /** Repeating tasks that may be available on the selected day */
  const repeatingTasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return repeatingTasks.filter((task) =>
      shouldShowRepeatingTaskOnDate(task, selectedDate, today),
    );
  }, [selectedDate, repeatingTasks, today]);

  /** Memoized set of dates that have regular tasks, for dot indicator */
  const daysWithTasks = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach((task) => {
      dates.add(format(new Date(task.dueDate), "MMMM do, yyyy"));
    });
    return dates;
  }, [tasks]);

  // Modifier to add a class to days with tasks ---
  const taskDayModifier = {
    className: "day-with-tasks",
    test: (date: Date) => daysWithTasks.has(format(date, "MMMM do, yyyy")),
  };
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 ">
        <div className="lg:col-span-4 bg-background-600 p-3 sm:p-4 rounded-xl shadow-xl flex justify-center items-start relative">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            showOutsideDays
            fixedWeeks
            startMonth={minDate}
            endMonth={maxDate}
            disabled={{ before: minDate, after: maxDate }}
            modifiers={{ hasTasks: taskDayModifier.test }}
            modifiersClassNames={{ hasTasks: taskDayModifier.className }}
          />
        </div>

        <div className="lg:col-span-3 bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl relative max-h-[370px]">
          <div className="flex items-center mb-4 sm:mb-6">
            <ListChecks className="w-6 h-6 mr-2 text-primary-400" />
            <h2 className="text-xl sm:text-2xl font-semibold text-text-low">
              {selectedDate
                ? format(selectedDate, "MMMM do, yyyy")
                : "Select a day"}
            </h2>
          </div>

          {selectedDate ? (
            tasksForSelectedDay.length > 0 ? (
              <ul className="space-y-3 max-h-[60vh] pr-1">
                {tasksForSelectedDay.map((task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <CalendarDays className="w-12 h-12 sm:w-16 text-text-gray mx-auto mb-4" />
                <p className="text-sm text-text-gray">
                  No regular tasks for this day.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-10">
              <AlertTriangle className="w-12 h-12 sm:w-16  text-warning mx-auto mb-4" />
              <p className="text-sm text-text-gray">
                Please select a day from the calendar to view tasks on that day.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedDate && (
        <section className="bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <Repeat className="w-6 h-6 mr-2 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-semibold text-text-low">
              Repeating tasks available on {formatDate(selectedDate)}
            </h2>
          </div>

          {repeatingTasksForSelectedDay.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {repeatingTasksForSelectedDay.map((task) => (
                <TaskCardSmall
                  key={task.id}
                  task={task}
                  forDate={selectedDate}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Repeat className="w-12 h-12 sm:w-16 text-text-gray mx-auto mb-4" />
              <p className="text-sm text-text-gray">
                No repeating tasks available on this day.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
