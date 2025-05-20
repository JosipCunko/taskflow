"use client"; // using Next.js App Router and framer-motion client features

import { motion } from "framer-motion";
import { getTaskIconByName, CardSpecificIcons } from "../utils";
import { formatDate, formatDateTime } from "../utils";
import { Task } from "../_types/types";
import { isPast } from "date-fns";

interface TaskCardProps {
  task: Task;
  index?: number; // For staggered animation
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onToggleStatus?: (taskId: string) => void; // Example action
}

// Status colors like 'status-pending-text', 'status-completed-text', 'status-delayed-text'

export default function TaskCard({
  task,
  index = 0,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskCardProps) {
  const TaskIcon = getTaskIconByName(task.icon);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05, // Stagger delay
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const getStatusStyles = () => {
    switch (task.status) {
      case "completed":
        return {
          icon: CardSpecificIcons.StatusCompleted,
          text: "Completed",
          colorClass: "text-green-400", // or 'status-completed-text'
          bgColorClass: "bg-green-500/10",
        };
      case "delayed":
        return {
          icon: CardSpecificIcons.StatusDelayed,
          text: "Delayed",
          colorClass: "text-red-400", // Or 'status-delayed-text'
          bgColorClass: "bg-red-500/10",
        };
      case "pending":
      default:
        return {
          icon: CardSpecificIcons.StatusPending,
          text: "Pending",
          colorClass: "text-yellow-400", // Or 'status-pending-text'
          bgColorClass: "bg-yellow-500/10",
        };
    }
  };

  const statusInfo = getStatusStyles();
  const StatusIcon = statusInfo.icon;

  const getExperienceIcon = () => {
    if (!task.completedAt || !task.experience) return null;
    switch (task.experience) {
      case "good":
        return (
          <CardSpecificIcons.ExperienceGood className="w-5 h-5 text-green-400" />
        );
      case "okay":
        return (
          <CardSpecificIcons.ExperienceOkay className="w-5 h-5 text-yellow-400" />
        );
      case "bad":
        return (
          <CardSpecificIcons.ExperienceBad className="w-5 h-5 text-red-400" />
        );
      default:
        return null;
    }
  };

  // Determine if a date is in the past (for dueDate)
  const isPastDue = !task.completedAt && isPast(new Date(task.dueDate));

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: "0px 8px 25px rgba(0,0,0,0.1)" }}
      layout // Animates layout changes (e.g., if content changes)
      className="bg-background-card rounded-xl shadow-lg overflow-hidden flex flex-col border border-border-card"
      style={{ "--task-color": task.color } as React.CSSProperties} // For CSS variable usage
    >
      <div className="p-5 flex items-start space-x-4 border-b border-border-card relative">
        <div
          className="p-3 rounded-lg w-12 h-12 flex items-center justify-center"
          style={{ backgroundColor: `${task.color}33` }}
        >
          <TaskIcon size={24} style={{ color: task.color }} />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-text-high break-words text-pretty mb-2">
            {task.title}
          </h3>
          <p className="text-xs font-semibold  text-text-low uppercase tracking-wider">
            {task.type}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="absolute top-3 right-3 group">
            <CardSpecificIcons.Options
              size={20}
              className="text-text-low cursor-pointer hover:text-text-high"
            />
            {/* Basic Dropdown (improve with a proper dropdown library or state management) */}
            <div className="absolute right-0 mt-1 w-32 bg-background-main border border-border-card rounded-md shadow-xl z-10 hidden group-hover:block">
              {onEdit && (
                <button
                  onClick={() => onEdit(task.id)}
                  className="w-full text-left px-3 py-2 text-sm text-text-medium hover:bg-background-card flex items-center"
                >
                  <CardSpecificIcons.Edit size={14} className="mr-2" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-background-card flex items-center"
                >
                  <CardSpecificIcons.Delete size={14} className="mr-2" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-grow space-y-3">
        {task.description && (
          <p className="text-sm mb-4 text-text-gray leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 items-center text-xs">
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColorClass}`}
          >
            <StatusIcon size={14} className={statusInfo.colorClass} />
            <span className={statusInfo.colorClass}>{statusInfo.text}</span>
            {task.status === "delayed" && task.delayCount > 0 && (
              <span className={`ml-1 font-semibold ${statusInfo.colorClass}`}>
                ({task.delayCount})
              </span>
            )}
          </div>
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              isPastDue && task.status !== "completed"
                ? "bg-red-500/10 text-red-400"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <CardSpecificIcons.DueDate size={14} />
            <span>Due: {formatDate(task.dueDate)}</span>
            {task.isToday && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-600 text-white font-semibold">
                Today
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {task.isPriority && (
            <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400">
              <CardSpecificIcons.Priority size={14} />
              <span>Priority</span>
            </div>
          )}
          {task.isReminder && (
            <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
              <CardSpecificIcons.Reminder size={14} />
              <span>Reminder Set</span>
            </div>
          )}
          {task.points > 0 && (
            <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-teal-500/10 text-teal-400">
              <CardSpecificIcons.Points size={14} />
              <span>{task.points} Points</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-tag-bg text-tag-text rounded-full flex items-center"
              >
                <CardSpecificIcons.Tag size={12} className="mr-1 opacity-70" />{" "}
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-background-main/30 border-t border-border-card text-xs text-text-low space-y-1">
        <div className="flex justify-between items-center">
          <span>
            Created:{" "}
            {formatDate(task.createdAt, { day: "numeric", month: "short" })}
          </span>
          {getExperienceIcon()}
          {task.completedAt && (
            <span>
              Completed:{" "}
              {formatDate(task.completedAt, { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        {task.preconditionTaskIds && task.preconditionTaskIds.length > 0 && (
          <div className="flex items-center text-orange-400/80">
            <CardSpecificIcons.PreconditionTasks size={14} className="mr-1.5" />
            <span>Blocked by {task.preconditionTaskIds.length} task(s)</span>
          </div>
        )}
        <p className="text-right opacity-60">
          Last updated: {formatDateTime(task.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
}
