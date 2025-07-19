"use client";
import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { CalendarDays, ListChecks, AlertTriangle } from "lucide-react";

import TaskCardSmall from "@/app/_components/TaskCardSmall";
import { Task } from "@/app/_types/types";

export default function Calendar({ tasks }: { tasks: Task[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  /** Memoized list of tasks for the selected day */
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((task) => isSameDay(task.dueDate, selectedDate));
  }, [selectedDate, tasks]);

  /** Memoized set of dates that have tasks, for dot indicator */
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
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 ">
      <div className="lg:col-span-4 bg-background-600 p-3 sm:p-4 rounded-xl shadow-xl flex justify-center items-start relative">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays
          fixedWeeks
          modifiers={{ hasTasks: taskDayModifier.test }}
          modifiersClassNames={{ hasTasks: taskDayModifier.className }}
        />
      </div>

      <div className="lg:col-span-3 bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl relative max-h-[370px] overflow-y-auto overflow-x-hidden">
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
                No tasks for this day (excluding repeating ones).
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
  );
}
