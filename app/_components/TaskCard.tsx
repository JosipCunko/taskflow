"use client"; // using Next.js App Router and framer-motion client features

import { motion } from "framer-motion";
import {
  getStatusStyles,
  getStartAndEndTime,
  getTimeString,
  formatDate,
  emojiOptions,
} from "../_utils/utils";
import { getTaskIconByName, CardSpecificIcons } from "../_utils/icons";

import { EmojiOption, Task } from "../_types/types";
import { format, isPast, isToday, isValid } from "date-fns";
import { useState, useMemo } from "react";
import { useOutsideClick } from "../_hooks/useOutsideClick";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import DurationCalculator from "./DurationCalculator";
import Dropdown from "./Dropdown";

export const getExperienceIcon = (task: Task) => {
  if (!task.completedAt || !task.experience) return null;
  const commonClasses = "w-5 h-5";
  // Already good colors from globals.css
  const color =
    task.experience === "bad"
      ? "text-error"
      : task.experience === "good"
      ? "text-success"
      : "text-warning";

  const selectedExperience = Object.entries(emojiOptions).find(
    (el) => el[1].id === task.experience
  );
  if (!selectedExperience) return null;
  const Icon = selectedExperience.at(1) as EmojiOption;

  return <Icon.emoji className={`${commonClasses} ${color}`} />;
};

export default function TaskCard({
  task,
  index = 0,
}: {
  task: Task;
  index?: number;
}) {
  const TaskIcon = getTaskIconByName(task.icon);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const statusInfo = getStatusStyles(task.status);
  const StatusIcon = statusInfo.icon;
  const isPastDue =
    task.status !== "completed" &&
    task.dueDate &&
    isPast(new Date(task.dueDate));

  const outsideClickRef = useOutsideClick(() => setIsDropdownOpen(false));

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const formattedDueDate = useMemo(() => {
    if (!task.dueDate || !isValid(new Date(task.dueDate))) return "N/A";
    return formatDate(task.dueDate);
  }, [task.dueDate]);

  const { startTime, endTime } = getStartAndEndTime(task);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: "0px 6px 20px rgba(0,0,0,0.07)" }}
      layout
      className="bg-background-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 relative "
      style={{ borderColor: task.color, zIndex: isDropdownOpen ? 50 : 1 }}
      ref={outsideClickRef}
    >
      {/* Header: Icon, Title, Options */}
      <div className="p-4 flex items-start justify-between border-b border-divider">
        <div className="flex items-start space-x-3">
          <div
            className="p-2.5 rounded-md w-10 h-10 flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${task.color}20` }} // Lighter background
          >
            <TaskIcon size={20} style={{ color: task.color }} />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-md font-semibold text-text-high break-words">
              {task.title}
            </h3>
          </div>
        </div>

        <Dropdown
          task={task}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
        />
      </div>
      <div className="p-4 space-y-3">
        {task.description && (
          <div className="text-sm text-text-gray">
            <p
              className={`leading-relaxed ${
                !isDescriptionExpanded ? "line-clamp-2" : ""
              }`}
            >
              {task.description}
            </p>
            {task.description.length > 100 && ( // Rough check if description is long enough to warrant expander
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs text-primary-600 hover:text-primary-400 mt-1 flex items-center"
              >
                {isDescriptionExpanded ? "Show Less" : "Show More"}
                {isDescriptionExpanded ? (
                  <ChevronUp size={14} className="ml-1" />
                ) : (
                  <ChevronDown size={14} className="ml-1" />
                )}
              </button>
            )}
          </div>
        )}

        <div
          className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md w-fit ${
            isPastDue
              ? "bg-red-500/10 text-red-500"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          <CardSpecificIcons.DueDate size={14} />
          <span>Due: {formattedDueDate}</span>
          {isToday(task.dueDate) && task.status !== "completed" && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary-600 text-white font-semibold">
              Today
            </span>
          )}
          <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background-500 text-text-low">
            {getTimeString(startTime, endTime)}
          </span>
        </div>

        {/* Status Badge & Delay Count */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md ${statusInfo.bgColorClass} ${statusInfo.colorClass}`}
          >
            <StatusIcon size={14} />
            {/*!!! CAREFUL */}
            <span>{isPastDue ? "Missed" : statusInfo.text}</span>
            {task.status === "delayed" && task.delayCount > 0 && (
              <span className="ml-1 font-semibold">({task.delayCount})</span>
            )}
          </div>

          {/* Priority Indicator */}
          {task.isPriority && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-orange-500/10 text-orange-400">
              <CardSpecificIcons.Priority size={14} />
              <span>Priority</span>
            </div>
          )}

          {/* Reminder Indicator */}
          {task.isReminder && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-purple-500/10 text-purple-400">
              <CardSpecificIcons.Reminder size={14} />
              <span>Reminder</span>
            </div>
          )}
        </div>

        <DurationCalculator task={task} />

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full flex items-center bg-background-muted text-text-low"
              >
                <Tag size={12} className="mr-1.5 opacity-70" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Dates & Experience */}
      <div className="px-4 py-2.5 bg-background-main/50 border-t border-divider text-xs text-text-low space-y-1 rounded-b-lg">
        <div className="flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-1">
            <span>Created: </span>
            <span className="text-text-gray ">
              {formatDate(task.createdAt, { day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Reward points if completed:</span>
            <span className="text-text-gray">{task.points}</span>
          </div>

          <div className="flex items-center space-x-2">
            {getExperienceIcon(task)}
            {task.completedAt && (
              <span>
                Completed:{" "}
                {formatDate(task.completedAt, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>

        <p className="text-right opacity-60 text-[11px]">
          Updated:{" "}
          {formatDate(task.updatedAt, {
            day: "numeric",
            month: "short",
            year: "2-digit",
          })}{" "}
          {format(new Date(task.updatedAt), "p")}
        </p>
      </div>
    </motion.div>
  );
}
