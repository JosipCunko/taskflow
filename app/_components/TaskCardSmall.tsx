import { getStatusStyles, formatDate } from "../_utils/utils";
import { CardSpecificIcons, getTaskIconByName } from "../_utils/icons";
import { Task } from "../_types/types";
import DurationCalculator from "./DurationCalculator";
import { Calendar } from "lucide-react";
import { isPast } from "date-fns";

export default function TaskCardSmall({ task }: { task: Task }) {
  const IconComponent = getTaskIconByName(task.icon);
  const statusInfo = getStatusStyles(task.status);

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

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-background-800/60 text-text-low border border-background-500/40">
          <Calendar size={12} />
          <span>{formatDate(task.dueDate)}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${statusInfo.bgColorClass} ${statusInfo.colorClass} shadow-sm`}
          >
            <statusInfo.icon size={13} />
            <span>{statusInfo.text}</span>
            {task.status === "delayed" && task.delayCount > 0 && (
              <span
                className={`ml-1 font-bold ${statusInfo.colorClass} bg-current/20 px-1.5 py-0.5 rounded-full text-[10px]`}
              >
                {task.delayCount}
              </span>
            )}
          </div>

          {task.isPriority && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 border border-orange-500/30 shadow-sm backdrop-blur-sm">
              <CardSpecificIcons.Priority size={13} />
              <span>Priority</span>
            </div>
          )}
          {task.isReminder && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500/15 to-pink-500/15 text-purple-400 border border-purple-500/30 shadow-sm backdrop-blur-sm">
              <CardSpecificIcons.Reminder size={13} />
              <span>Reminder set</span>
            </div>
          )}
          <DurationCalculator task={task} />
        </div>

        {/* Floating notification dot for priority/reminder */}
        <div
          className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{
            backgroundColor:
              task.status === "completed"
                ? "#10b981"
                : task.status === "pending"
                ? isPast(task.dueDate)
                  ? "#ef4444"
                  : "#f59e0b"
                : "#ef4444",
            border: "2px solid var(--background-600)",
          }}
        />

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
