import {
  CardSpecificIcons,
  getStatusStyles,
  getTaskIconByName,
  formatDate,
  getTaskDisplayStatus,
} from "../utils";
import { Task } from "../_types/types";
import DurationCalculator from "./DurationCalculator";
import { Calendar } from "lucide-react";
import { isPast } from "date-fns";

export default function TaskCardSmall({ task }: { task: Task }) {
  const IconComponent = getTaskIconByName(task.icon);

  // Only calculate time strings if startTime exists
  const startTime = task.startTime
    ? `${String(task.startTime.hour).padStart(2, "0")}:${String(
        task.startTime.minute
      ).padStart(2, "0")}`
    : null;

  const endTime =
    task.startTime && task.duration
      ? (() => {
          const endHour = task.startTime.hour + (task.duration.hours || 0);
          const endMinute =
            task.startTime.minute + (task.duration.minutes || 0);
          const finalHour = endMinute >= 60 ? endHour + 1 : endHour;
          const finalMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
          return `${String(finalHour).padStart(2, "0")}:${String(
            finalMinute
          ).padStart(2, "0")}`;
        })()
      : null;

  const statusInfo = getStatusStyles(getTaskDisplayStatus(task));

  return (
    <li className="group relative overflow-hidden list-none cursor-default">
      {/* Animated gradient background overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${task.color}08, ${task.color}15, transparent)`,
        }}
      />

      <div className="relative bg-gradient-to-br from-background-700 via-background-650 to-background-600 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary-500/30">
        <div className="flex items-start justify-between mb-4">
          {/* Time display with modern styling */}
          <div className="flex flex-col items-start">
            <div className="bg-background-800/80 px-3 py-2 rounded-lg   min-w-[85px] text-center">
              {(() => {
                // No start time - show "Any time"
                if (!startTime) {
                  return (
                    <span className="text-xs font-medium text-text-low tracking-wide">
                      Any time
                    </span>
                  );
                }

                // Don't show meaningless time ranges (e.g., 00:00 to 23:59)
                const isAllDayTask =
                  startTime === "00:00" &&
                  (endTime === "23:59" || !task.duration);

                if (isAllDayTask) {
                  return (
                    <span className="text-xs font-medium text-text-low tracking-wide">
                      Any time
                    </span>
                  );
                }

                return (
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-text-high block">
                      {startTime}
                    </span>
                    {endTime && endTime !== startTime && (
                      <>
                        <div className="w-4 h-px bg-text-low mx-auto opacity-60" />
                        <span className="text-sm font-bold text-text-high block">
                          {endTime}
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="relative">
            <div
              className="p-3 rounded-xl shadow-md border border-background-500/30 backdrop-blur-sm hover:scale-110 transition-transform duration-200"
              style={{
                backgroundColor: `${task.color}15`,
                boxShadow: `0 4px 12px ${task.color}20`,
              }}
            >
              <IconComponent size={24} style={{ color: task.color }} />
            </div>

            {/* Floating notification dot for priority/reminder */}
            {(task.isPriority || task.isReminder) && (
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor:
                    getTaskDisplayStatus(task) === "completed"
                      ? "#10b981"
                      : getTaskDisplayStatus(task) === "pending"
                      ? isPast(task.dueDate)
                        ? "#ff0000"
                        : "#f59e0b"
                      : "#ff0000",
                }}
              />
            )}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-lg font-bold text-text-high leading-tight  line-clamp-2">
            {task.title}
          </h4>
        </div>

        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-background-800/60 text-text-low border border-background-500/40">
            <Calendar size={12} />
            <span>Due {formatDate(task.dueDate)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border backdrop-blur-sm ${statusInfo.bgColorClass} ${statusInfo.colorClass} shadow-sm`}
          >
            <statusInfo.icon size={14} className={statusInfo.colorClass} />
            <span>{statusInfo.text}</span>
            {getTaskDisplayStatus(task) === "delayed" &&
              task.delayCount > 0 && (
                <span
                  className={`ml-1 font-bold ${statusInfo.colorClass} bg-current/20 px-1.5 py-0.5 rounded-full text-xs`}
                >
                  {task.delayCount}
                </span>
              )}
          </div>

          <DurationCalculator task={task} />

          {task.isPriority && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 border border-orange-500/30 shadow-sm backdrop-blur-sm">
              <CardSpecificIcons.Priority size={14} />
              <span>Priority</span>
            </div>
          )}

          {task.isReminder && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500/15 to-violet-500/15 text-purple-400 border border-purple-500/30 shadow-sm backdrop-blur-sm">
              <CardSpecificIcons.Reminder size={14} />
              <span>Reminder</span>
            </div>
          )}
        </div>

        {/* Subtle bottom glow effect */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-2 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${task.color}, transparent)`,
          }}
        />
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-2 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${task.color}, transparent)`,
          }}
        />
      </div>
    </li>
  );
}
