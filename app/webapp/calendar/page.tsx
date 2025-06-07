"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import {
  CalendarDays,
  ListChecks,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { errorToast } from "@/app/utils";
import { useSession } from "next-auth/react";
import { Task } from "@/app/_types/types";
import { getTasksByUserId } from "@/app/_lib/tasks";
import Button from "@/app/_components/reusable/Button";
import Loader from "@/app/_components/Loader";
import TaskCardSmall from "@/app/_components/TaskCardSmall";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const session = useSession();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTasksByUserId(session.data?.user.id);
      const nonRepeatingTasks = res.filter((task) => !task.isRepeating);
      setAllTasks(nonRepeatingTasks);
    } catch (error: unknown) {
      setAllTasks([]);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching tasks";
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [session.data?.user.id]);

  useEffect(
    function () {
      fetchTasks();
    },
    [fetchTasks]
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  /** Memoized list of tasks for the selected day */
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return allTasks.filter((task) =>
      isSameDay(new Date(task.dueDate), selectedDate)
    );
  }, [selectedDate, allTasks]);

  /** Memoized set of dates that have tasks, for dot indicator */
  const daysWithTasks = useMemo(() => {
    const dates = new Set<string>();
    allTasks.forEach((task) => {
      dates.add(format(new Date(task.dueDate), "MMMM do, yyyy"));
    });
    return dates;
  }, [allTasks]);

  // Modifier to add a class to days with tasks ---
  const taskDayModifier = {
    className: "day-with-tasks",
    test: (date: Date) => daysWithTasks.has(format(date, "MMMM do, yyyy")),
  };

  return (
    <>
      <div className="max-h-screen  bg-background-700 text-text-high p-4 sm:p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
            <CalendarDays className="w-8 h-8 mr-3 text-primary-500" />
            My Calendar
          </h1>
          <p className="text-text-low mt-1 text-sm sm:text-base">
            Manage your schedule and tasks efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8">
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

            <Button
              variant="secondary"
              onClick={fetchTasks}
              disabled={isLoading}
              className="absolute top-6 right-[22.5%]"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div className="lg:col-span-3 bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl relative max-h-[370px] overflow-scroll">
            <div className="flex items-center mb-4 sm:mb-6">
              <ListChecks className="w-6 h-6 mr-2 text-primary-400" />
              <h2 className="text-xl sm:text-2xl font-semibold text-text-high">
                {selectedDate
                  ? format(selectedDate, "MMMM do, yyyy")
                  : "Select a day"}
              </h2>
            </div>
            {isLoading && <Loader label="Loading user tasks..." />}

            {!isLoading && selectedDate ? (
              tasksForSelectedDay.length > 0 ? (
                <ul className="space-y-3 max-h-[60vh] pr-1">
                  {tasksForSelectedDay.map((task) => (
                    <TaskCardSmall key={task.id} task={task} />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10">
                  <CalendarDays className="w-12 h-12 sm:w-16 text-text-medium mx-auto mb-4" />
                  <p className="text-sm text-text-medium">
                    No tasks for this day (excluding repeating ones).
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="w-12 h-12 sm:w-16  text-warning mx-auto mb-4" />
                <p className="text-sm text-text-gray">
                  Please select a day from the calendar to view tasks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
