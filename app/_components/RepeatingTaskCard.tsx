"use client";

import { isToday, isSameWeek } from "date-fns";
import {
  Repeat,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { Task, ActionResult } from "@/app/_types/types";
import {
  CardSpecificIcons,
  errorToast,
  formatDate,
  getStatusStyles,
  getTaskIconByName,
  handleToast,
  getStartAndEndTime,
  getDayName,
  getTimeString,
  canCompleteRepeatingTaskNow,
} from "../utils";
import { getExperienceIcon } from "./TaskCard";
import {
  completeRepeatingTaskWithDaysOfWeek,
  completeRepeatingTaskWithInterval,
  completeRepeatingTaskWithTimesPerWeek,
} from "../_lib/actions";
import { useState } from "react";
import DurationCalculator from "./DurationCalculator";
import { useOutsideClick } from "../_hooks/useOutsideClick";
import Dropdown from "./Dropdown";

export default function RepeatingTaskCard({
  notProcessedTask,
}: {
  notProcessedTask: Task;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const outsideClickRef = useOutsideClick(() => setIsDropdownOpen(false));
  const task = notProcessedTask;
  if (!task.repetitionRule) throw new Error("Task has no repetition rule");

  const IconComponent = getTaskIconByName(task.icon) || Repeat;
  const statusInfo = getStatusStyles(task.status);
  let repetitionSummary = "Repeats";
  let completionFraction = "";
  let progressPercentage = 0;
  let nextInstanceInfo = "";
  const rule = task.repetitionRule;

  const { startTime, endTime } = getStartAndEndTime(task);
  const { canCompleteNow } = canCompleteRepeatingTaskNow(task);

  // For display purposes, check if task is due today regardless of time window
  const isDueToday = isToday(task.dueDate);

  const timeString = getTimeString(startTime, endTime);

  if (rule.interval) {
    repetitionSummary = `Every ${rule.interval === 1 ? "" : rule.interval} ${
      rule.interval === 1 ? "day" : "days"
    }${timeString}`;
    nextInstanceInfo = `Next: ${
      isDueToday ? "Today" : formatDate(task.dueDate)
    }`;
  } else if (rule.daysOfWeek.length > 0) {
    repetitionSummary = `On ${rule.daysOfWeek
      .map(getDayName)
      .join(", ")}${timeString}`;
    completionFraction = `${rule.completions}/${rule.daysOfWeek.length}`;
    progressPercentage = (rule.completions / rule.daysOfWeek.length) * 100;
    nextInstanceInfo = `Next: ${
      isDueToday ? "Today" : formatDate(task.dueDate)
    }`;
  } else if (rule.timesPerWeek) {
    repetitionSummary = `${rule.timesPerWeek} time${
      rule.timesPerWeek > 1 ? "s" : ""
    } a week${timeString}`;
    completionFraction = `${rule.completions}/${rule.timesPerWeek}`;
    progressPercentage = (rule.completions / rule.timesPerWeek) * 100;
    const isThisWeek = isSameWeek(new Date(), task.dueDate, {
      weekStartsOn: 1,
    });

    nextInstanceInfo = isThisWeek
      ? "Complete this week"
      : `Week from ${formatDate(rule.startDate)} to ${formatDate(
          task.dueDate
        )}`;
  }

  if (rule.startDate) {
    repetitionSummary += ` from ${formatDate(rule.startDate)}`;
  }

  /*
  const isFullyCompletedForCurrentCycle =
    (rule.interval && isToday(task.completedAt as Date)) ||
    (rule.timesPerWeek &&
      rule.completions !== 0 &&
      rule.completions === rule.timesPerWeek) ||
    (rule.daysOfWeek &&
      rule.completions !== 0 &&
      rule.daysOfWeek.length > 0 &&
      rule.completions === rule.daysOfWeek.length);
      */
  const isFullyCompletedForCurrentCycle = task.status === "completed";

  const handleComplete = async () => {
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

  const cardBaseClasses =
    "p-3 rounded-xl shadow-md transition-all border-l-4 flex flex-col justify-between h-full group";
  let cardStateClasses = "bg-background-600 hover:bg-background-550";

  if (isFullyCompletedForCurrentCycle) {
    cardStateClasses = "bg-green-900/30 opacity-70 hover:bg-green-900/40";
  }

  return (
    <div
      className={`${cardBaseClasses} ${cardStateClasses} relative border border-divider`}
      style={{ borderLeftColor: task.color, zIndex: isDropdownOpen ? 50 : 0 }}
      ref={outsideClickRef}
    >
      <div className="flex-grow ">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
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
          <Dropdown
            task={task}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            canComplete={canCompleteNow}
            handleComplete={handleComplete}
          />
        </div>

        <p className="text-xs text-text-low mb-1.5 flex items-center">
          <Repeat
            size={12}
            className="inline mr-1.5 opacity-80 flex-shrink-0"
          />
          <span>{repetitionSummary}</span>
        </p>

        {task.description && (
          <p className="my-2 flex items-start gap-1.5 text-xs text-text-low">
            <FileText size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
            <span className="italic">{task.description}</span>
          </p>
        )}

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
        {!rule.interval && task.completedAt && isToday(task.completedAt) && (
          <div
            className={
              "flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-md bg-green-500/10"
            }
          >
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-green-400">Completed Today ✨</span>
          </div>
        )}

        <DurationCalculator task={task} />

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
        {task.experience && (
          <div className="absolute bottom-10 right-2 text-lg opacity-80">
            {getExperienceIcon(task)}
          </div>
        )}
        {isFullyCompletedForCurrentCycle && (
          <CheckCircle2
            size={20}
            className="absolute bottom-2 right-2 text-green-500 flex-shrink-0 ml-2"
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-text-low mt-3 pt-2 border-t border-divider/30">
        <div className="flex items-center gap-1">
          <CalendarDays size={12} className="opacity-70 flex-shrink-0" />
          <span>{nextInstanceInfo}</span>
        </div>
        {task.risk && !task.experience && !isFullyCompletedForCurrentCycle && (
          <div className="flex items-center gap-1 text-yellow-400">
            <AlertTriangle size={12} />
            <span className="text-2xs">At Risk</span>
          </div>
        )}
      </div>
    </div>
  );
}
