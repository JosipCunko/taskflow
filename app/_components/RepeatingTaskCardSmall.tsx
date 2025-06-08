"use client";

import { isToday, isSameDay } from "date-fns";
import {
  Repeat,
  CalendarDays,
  CheckCircle2,
  Check,
  AlertTriangle,
} from "lucide-react";

import type { Task, DayOfWeek, ActionResult } from "@/app/_types/types";
import {
  calculateNextDueDate,
  CardSpecificIcons,
  errorToast,
  formatDate,
  getStatusStyles,
  getTaskIconByName,
  handleToast,
} from "../utils";
import Button from "./reusable/Button";
import {
  completeRepeatingTaskWithDaysOfWeek,
  completeRepeatingTaskWithInterval,
  completeRepeatingTaskWithTimesPerWeek,
} from "../_lib/repeatingTasksActions";
import { FormEvent, useMemo } from "react";
import {
  loadRepeatingTaskWithDaysOfWeek,
  loadRepeatingTaskWithInterval,
  loadRepeatingTaskWithTimesPerWeek,
} from "../_lib/repeatingTasks";
import DurationCalculator from "./DurationCalculator";

interface RepeatingTaskCardSmallProps {
  notProcessedTask: Task & { isDueToday?: boolean; risk?: boolean };
}

const getDayName = (day: DayOfWeek): string => {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][day];
};

export default function RepeatingTaskCardSmall({
  notProcessedTask,
}: RepeatingTaskCardSmallProps) {
  const task: Task & { isDueToday?: boolean; risk?: boolean } = useMemo(() => {
    if (notProcessedTask.repetitionRule?.interval) {
      return loadRepeatingTaskWithInterval(notProcessedTask);
    }
    if (
      notProcessedTask.repetitionRule?.daysOfWeek &&
      notProcessedTask.repetitionRule.daysOfWeek.length > 0
    ) {
      return loadRepeatingTaskWithDaysOfWeek(notProcessedTask);
    }
    if (notProcessedTask.repetitionRule?.timesPerWeek) {
      return loadRepeatingTaskWithTimesPerWeek(notProcessedTask);
    }
    return notProcessedTask;
  }, [notProcessedTask]);

  const IconComponent = getTaskIconByName(task.icon) || Repeat;
  const statusInfo = getStatusStyles(task.status);
  let repetitionSummary = "Repeats";
  let completionFraction = "";
  let progressPercentage = 0;
  let nextInstanceInfo = "Next: TBD";
  const rule = task.repetitionRule;

  // Helper function to format time information
  const getTimeString = () => {
    const hasStartTime =
      task.startTime &&
      (task.startTime.hour !== 0 || task.startTime.minute !== 0);
    const hasDuration =
      task.duration && (task.duration.hours > 0 || task.duration.minutes > 0);

    if (!hasStartTime && !hasDuration) {
      return "";
    }

    const startTimeStr =
      hasStartTime && task.startTime
        ? `${task.startTime.hour
            .toString()
            .padStart(2, "0")}:${task.startTime.minute
            .toString()
            .padStart(2, "0")}`
        : null;

    // Calculate end time from start time + duration
    let endTimeStr = null;
    if (hasStartTime && hasDuration && task.startTime && task.duration) {
      const startMinutes = task.startTime.hour * 60 + task.startTime.minute;
      const durationMinutes =
        (task.duration.hours || 0) * 60 + (task.duration.minutes || 0);
      const endMinutes = startMinutes + durationMinutes;
      const endHour = Math.floor(endMinutes / 60) % 24;
      const endMinute = endMinutes % 60;
      endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;
    }

    if (startTimeStr && endTimeStr) {
      return ` from ${startTimeStr} to ${endTimeStr}`;
    } else if (startTimeStr) {
      return ` from ${startTimeStr}`;
    }
    return "";
  };

  if (rule) {
    const timeString = getTimeString();

    if (rule.interval && rule.startDate) {
      repetitionSummary = `Every ${rule.interval} ${
        rule.interval === 1 ? "day" : "days"
      }${timeString}`;
      if (task.dueDate) {
        const todayCompleted =
          isToday(task.dueDate) && task.status === "completed";
        const todayComplete =
          isToday(task.dueDate) && task.status === "pending";

        nextInstanceInfo = `Next: ${
          todayCompleted
            ? formatDate(calculateNextDueDate(task))
            : todayComplete
            ? "Today"
            : formatDate(calculateNextDueDate(task))
        }`;
      }
    } else if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      repetitionSummary = `On ${rule.daysOfWeek
        .map(getDayName)
        .join(", ")}${timeString}`;
      if (rule.completions !== undefined) {
        completionFraction = `${rule.completions}/${rule.daysOfWeek.length}`;
        progressPercentage = (rule.completions / rule.daysOfWeek.length) * 100;
      }
      if (task.dueDate) {
        let info = formatDate(task.dueDate);
        const todayCompleted = isToday(
          task.repetitionRule?.lastInstanceCompletedDate as Date
        );
        const todayComplete =
          !todayCompleted && isToday(task.dueDate) && task.status === "pending";
        const notDueTodayComplete = !todayComplete && task.status === "pending";

        if (todayCompleted) {
          const nextDate = calculateNextDueDate(task) as Date;
          info = formatDate(nextDate);
        }
        if (todayComplete) info = "Today";
        if (notDueTodayComplete) info = formatDate(task.dueDate);
        nextInstanceInfo = `Next: ${
          info === formatDate(new Date()) ? "Starts next week" : info
        }`;
      }
    } else if (rule.timesPerWeek) {
      repetitionSummary = `${rule.timesPerWeek} time(s) a week${timeString}`;
      if (rule.completions !== undefined) {
        completionFraction = `${rule.completions}/${rule.timesPerWeek}`;
        progressPercentage = (rule.completions / rule.timesPerWeek) * 100;
      }
      nextInstanceInfo = "This week";
    }
    if (rule.startDate) {
      repetitionSummary += ` from ${formatDate(rule.startDate)}`;
    }
  }
  const isFullyCompletedForCurrentCycle =
    (rule?.interval &&
      task.status === "completed" &&
      isToday(task.repetitionRule?.lastInstanceCompletedDate as Date)) ||
    (rule?.timesPerWeek &&
      rule.completions !== 0 &&
      rule.completions >= rule.timesPerWeek) ||
    (rule?.daysOfWeek &&
      rule.completions !== 0 &&
      rule.daysOfWeek.length > 0 &&
      rule.completions >= rule.daysOfWeek.length);

  const canCompleteToday = (() => {
    // Task must be due today
    if (!task.isDueToday) return false;

    // Task must not be fully completed for current cycle
    if (isFullyCompletedForCurrentCycle) return false;

    // For interval tasks: check if not completed today
    if (rule?.interval) {
      return (
        !rule.lastInstanceCompletedDate ||
        !isSameDay(rule.lastInstanceCompletedDate, new Date())
      );
    }

    // For times per week tasks: check if can still complete more times this week
    if (rule?.timesPerWeek) {
      const completionsLeft = rule.timesPerWeek - (rule.completions || 0);
      const notCompletedToday =
        !rule.lastInstanceCompletedDate ||
        !isSameDay(rule.lastInstanceCompletedDate, new Date());
      return completionsLeft > 0 && notCompletedToday;
    }

    // For days of week tasks: check if today is a scheduled day and not completed today
    if (rule?.daysOfWeek?.length) {
      const today = new Date();
      const todayDayOfWeek = today.getDay() as DayOfWeek;
      const isScheduledToday = rule.daysOfWeek.includes(todayDayOfWeek);
      const notCompletedToday =
        !rule.lastInstanceCompletedDate ||
        !isSameDay(rule.lastInstanceCompletedDate, new Date());
      return isScheduledToday && notCompletedToday;
    }

    return false;
  })();

  const handleComplete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rule) {
      errorToast("Task has no repetition rule");
      return;
    }

    try {
      const result = await (async (): Promise<ActionResult> => {
        if (rule.interval) {
          return completeRepeatingTaskWithInterval(task);
        }
        if (rule.daysOfWeek?.length) {
          return completeRepeatingTaskWithDaysOfWeek(task);
        }
        if (rule.timesPerWeek) {
          return completeRepeatingTaskWithTimesPerWeek(task);
        }
        throw new Error("Invalid repetition rule configuration");
      })();

      handleToast(result, () => {
        if (!result.error) window.location.reload();
      });
    } catch (err) {
      errorToast(
        err instanceof Error ? err.message : "Failed to complete task"
      );
    }
  };

  // Dynamic styling based on state
  const cardBaseClasses =
    "p-3 rounded-xl shadow-md transition-all border-l-4 flex flex-col justify-between h-full group";
  let cardStateClasses = "bg-background-600 hover:bg-background-550"; // Default
  let borderColor = task.color;

  if (isFullyCompletedForCurrentCycle) {
    cardStateClasses = "bg-green-900/30 opacity-70 hover:bg-green-900/40";
    borderColor = "var(--color-green-500)"; // Or your green color
  } else if (task.isDueToday && task.status === "pending") {
    // Emphasize if due *today* and pending
    cardStateClasses = "bg-primary-900/30 hover:bg-primary-900/40";
  } else if (task.risk && !isFullyCompletedForCurrentCycle) {
    // For timesPerWeek "at risk"
    cardStateClasses = "bg-yellow-900/30 hover:bg-yellow-900/40";
    borderColor = "var(--color-yellow-500)"; // Your yellow/warning color
  }

  return (
    <div
      className={`${cardBaseClasses} ${cardStateClasses} border border-divider`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {" "}
            <div
              className="p-1.5 rounded-lg w-fit h-fit flex-shrink-0"
              style={{ backgroundColor: `${task.color}2A` }}
            >
              <IconComponent size={20} style={{ color: task.color }} />
            </div>
            <h3 className="text-sm font-semibold text-text-high truncate">
              {task.title}
            </h3>
          </div>
          {/* Action button or Status Icon */}
          {canCompleteToday && !isFullyCompletedForCurrentCycle && (
            <form onSubmit={handleComplete} className="ml-2 flex-shrink-0">
              <Button
                type="submit"
                variant="secondary"
                className="p-1.5 rounded-full hover:bg-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check
                  size={18}
                  className="text-primary-500 group-hover:text-primary-400"
                />
              </Button>
            </form>
          )}
          {isFullyCompletedForCurrentCycle && (
            <CheckCircle2
              size={20}
              className="text-green-500 flex-shrink-0 ml-2"
            />
          )}
        </div>

        <p className="text-xs text-text-low mb-1.5 flex items-center">
          <Repeat
            size={12}
            className="inline mr-1.5 opacity-80 flex-shrink-0"
          />
          <span className="truncate">{repetitionSummary}</span>
        </p>

        {/* Progress Bar for weekly tasks */}
        {(rule?.timesPerWeek ||
          (rule?.daysOfWeek && rule.daysOfWeek.length > 0)) &&
          progressPercentage >= 0 && (
            <div className="w-full bg-background-500 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: task.color,
                }}
              ></div>
            </div>
          )}
        {completionFraction && !isFullyCompletedForCurrentCycle && (
          <p className="text-2xs text-text-low mb-1 text-right">
            {completionFraction} done
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-md ${statusInfo.bgColorClass}`}
        >
          <statusInfo.icon size={14} className={statusInfo.colorClass} />
          <span className={statusInfo.colorClass}>{statusInfo.text}</span>
          {task.status === "delayed" && task.delayCount > 0 && (
            <span className={`ml-1 font-semibold ${statusInfo.colorClass}`}>
              ({task.delayCount})
            </span>
          )}
        </div>
        <DurationCalculator task={task} />

        {rule?.lastInstanceCompletedDate &&
          isToday(rule.lastInstanceCompletedDate) && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-green-500/10 text-green-400">
              <CheckCircle2 size={14} />
              <span>Completed Today ✨</span>
            </div>
          )}

        <div className="flex flex-wrap gap-2 items-center">
          {task.isPriority && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-orange-500/10 text-orange-400">
              <CardSpecificIcons.Priority size={14} />
              <span>Priority</span>
            </div>
          )}
          {task.isReminder && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-purple-500/10 text-purple-400">
              <CardSpecificIcons.Reminder size={14} />
              <span>Reminder Set</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1.5 bg-tag-bg text-tag-text rounded-md flex items-center bg-background-500"
              >
                <CardSpecificIcons.Tag size={12} className="mr-2 opacity-70" />{" "}
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-text-low mt-3 pt-2 border-t border-divider/30">
        <div className="flex items-center gap-1">
          <CalendarDays size={12} className="opacity-70 flex-shrink-0" />
          <span>{nextInstanceInfo}</span>
        </div>
        {task.risk && !isFullyCompletedForCurrentCycle && (
          <div className="flex items-center gap-1 text-yellow-400">
            <AlertTriangle size={12} />
            <span className="text-2xs">At Risk</span>
          </div>
        )}
      </div>
    </div>
  );
}
