import {
  getStatusStyles,
  formatDate,
  getRepeatingTaskInfo,
} from "../_utils/utils";
import { CardSpecificIcons, getTaskIconByName } from "../_utils/icons";
import { Task } from "../_types/types";
import DurationCalculator from "./DurationCalculator";
import { Calendar, Repeat, CheckCircle2 } from "lucide-react";
import { isBefore, isPast, isToday, startOfDay } from "date-fns";
import { wasRepeatingTaskCompletedOnDate } from "../_lib/repeatingTasks";

function getLiveTaskDotColor(task: Task): string {
  if (task.status === "completed") return "#10b981";
  if (task.status === "pending") {
    return isPast(task.dueDate) ? "#ef4444" : "#f59e0b";
  }
  return "#ef4444";
}

function getActivitySnapshotDotColor(task: Task): string {
  if (task.status === "completed") return "#10b981";
  if (task.status === "delayed") return "#ef4444";
  return "#f59e0b";
}

export default function TaskCardSmall({
  task,
  forDate,
  showDot = true,
}: {
  task: Task;
  /** Calendar-only: the day this repeating occurrence is being shown for. */
  forDate?: Date;
  showDot?: boolean;
}) {
  const IconComponent = getTaskIconByName(task.icon);
  const isCalendarOccurrence = Boolean(forDate);
  const completedOnViewedDate = forDate
    ? wasRepeatingTaskCompletedOnDate(task, forDate)
    : false;
  const missedOnViewedDate =
    Boolean(forDate) &&
    !completedOnViewedDate &&
    isBefore(startOfDay(forDate as Date), startOfDay(new Date()));

  const displayStatus = completedOnViewedDate
    ? "completed"
    : isCalendarOccurrence
      ? "pending"
      : task.status;
  const statusInfo = missedOnViewedDate
    ? {
        icon: CardSpecificIcons.StatusMissed,
        text: "Missed",
        colorClass: "text-red-400",
        bgColorClass: "bg-red-500/10",
      }
    : getStatusStyles(displayStatus);

  const repeatingInfo =
    task.isRepeating && task.repetitionRule ? getRepeatingTaskInfo(task) : null;

  const isFullyCompletedForCurrentCycle = task.status === "completed";
  const showCurrentCycleProgress = !isCalendarOccurrence || isToday(forDate!);

  const formattedViewedDate = forDate ? formatDate(forDate) : "";
  const dateLabel = forDate
    ? completedOnViewedDate
      ? `Completed ${formattedViewedDate}`
      : missedOnViewedDate
        ? `Was available on ${formattedViewedDate}`
        : `Available ${formattedViewedDate}`
    : formatDate(task.dueDate);

  const isActivitySnapshot = !task.id;
  const dotColor = isCalendarOccurrence
    ? completedOnViewedDate
      ? "#10b981"
      : missedOnViewedDate
        ? "#ef4444"
        : "#f59e0b"
    : isActivitySnapshot
      ? getActivitySnapshotDotColor(task)
      : getLiveTaskDotColor(task);

  return (
    <li className="group relative list-none overflow-hidden cursor-default">
      {/* Animated gradient background overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${task.color}08, ${task.color}15, transparent)`,
        }}
      />

      <div
        className="relative bg-gradient-to-br from-background-700/80 via-background-650/80 to-background-600/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary-500/20 border border-transparent
      flex flex-col gap-2 justify-center
      "
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg shadow-md backdrop-blur-sm"
            style={{
              backgroundColor: `${task.color}1A`,
              boxShadow: `0 3px 10px ${task.color}20`,
            }}
          >
            <IconComponent size={22} style={{ color: task.color }} />
          </div>

          <h4 className="text-md font-bold text-text-low ">{task.title}</h4>
        </div>

        {/* Due Date - Always show for both regular and repeating tasks */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-background-800/60 text-text-low border border-background-500/40">
          {completedOnViewedDate ? (
            <CheckCircle2 size={12} className="text-green-400" />
          ) : (
            <Calendar size={12} />
          )}
          <span>{dateLabel}</span>
        </div>

        {/* Repeating task info - compact version */}
        {task.isRepeating && repeatingInfo && (
          <div className="space-y-2">
            {/* Short repetition label */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-background-800/60 text-text-low border border-background-500/40">
              <Repeat size={12} />
              <span className="text-left text-balance">
                {isCalendarOccurrence
                  ? repeatingInfo.repetitionSummary
                  : repeatingInfo.nextInstanceInfo}
              </span>
            </div>

            {/* Progress Bar for weekly tasks */}
            {showCurrentCycleProgress &&
              (task.repetitionRule?.timesPerWeek ||
                (task.repetitionRule?.daysOfWeek &&
                  task.repetitionRule?.daysOfWeek.length > 0)) &&
              repeatingInfo.progressPercentage >= 0 && (
                <div className="w-full bg-background-500 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${repeatingInfo.progressPercentage}%`,
                      backgroundColor: task.color,
                    }}
                  ></div>
                </div>
              )}

            {/* Completion fraction */}
            {showCurrentCycleProgress &&
              repeatingInfo.completionFraction &&
              !isFullyCompletedForCurrentCycle && (
                <div className="text-2xs text-text-low text-right">
                  <span>{repeatingInfo.completionFraction} done</span>
                </div>
              )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {showDot && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${statusInfo.bgColorClass} ${statusInfo.colorClass} shadow-sm`}
            >
              <statusInfo.icon size={13} />
              <span>{statusInfo.text}</span>
              {task.status === "delayed" &&
                task.delayCount > 0 &&
                !isCalendarOccurrence && (
                  <span
                    className={`ml-1 font-bold ${statusInfo.colorClass} bg-current/20 px-1.5 py-0.5 rounded-full text-[10px]`}
                  >
                    {task.delayCount}
                  </span>
                )}
            </div>
          )}

          {/* Repeating task tag */}
          {task.isRepeating && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500/15 to-violet-500/15 text-purple-400 border border-purple-500/30 shadow-sm backdrop-blur-sm">
              <Repeat size={13} />
              <span>Repeating</span>
            </div>
          )}

          {task.isPriority && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 border border-orange-500/30 shadow-sm backdrop-blur-sm">
              <CardSpecificIcons.Priority size={13} />
              <span>Priority</span>
            </div>
          )}

          {/* Completed Today indicator for repeating tasks */}
          {!isCalendarOccurrence &&
            task.isRepeating &&
            !task.repetitionRule?.interval &&
            task.completedAt &&
            isToday(task.completedAt) && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 shadow-sm backdrop-blur-sm">
                <CheckCircle2 size={13} />
                <span>Completed Today ✨</span>
              </div>
            )}

          <DurationCalculator task={task} showTimeRangeInfo />
        </div>

        {/* Floating notification dot for priority/reminder */}
        {showDot && (
          <div
            className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: dotColor,
              border: "2px solid var(--background-600)",
            }}
          />
        )}

        {/* Subtle bottom glow effect */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1.5 opacity-40 group-hover:opacity-60 transition-opacity duration-300 rounded-full"
          style={{
            background: `radial-gradient(ellipse at center, ${task.color} 40%, transparent 80%)`,
            filter: "blur(5px)",
          }}
        />
      </div>
    </li>
  );
}
