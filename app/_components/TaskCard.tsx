"use client"; // using Next.js App Router and framer-motion client features

import { AnimatePresence, motion } from "framer-motion";
import { getTaskIconByName, CardSpecificIcons } from "../utils";
import { formatDate, formatDateTime } from "../utils";
import { Task } from "../_types/types";
import { isPast } from "date-fns";
import { useFormStatus } from "react-dom";
import Button from "./reusable/Button";
import { useState } from "react";
import {
  delayTaskAction,
  rescheduleTaskAction,
  togglePriorityAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "../_lib/actions";
import { useOutsideClick } from "../hooks/useOutsideClick";

function ActionSubmitButton({
  children,
  className,
  Icon,
  classNameIcon,
}: {
  children: React.ReactNode;
  className?: string;
  Icon?: React.ElementType;
  classNameIcon?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="secondary"
      className={`w-full text-left px-3 py-2.5 text-sm text-text-gray    ${className} ${
        pending ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {Icon && (
        <Icon
          size={16}
          className={`mr-2.5 text-text-low group-hover:text-text-high transition-colors ${
            classNameIcon ? classNameIcon : ""
          }`}
        />
      )}
      {pending ? "Processing..." : children}
    </Button>
  );
}

// Status colors like 'status-pending-text', 'status-completed-text', 'status-delayed-text'

interface TaskCardProps {
  task: Task;
  index?: number;
  onOpenUpdateModal?: (task: Task) => void;
}

export default function TaskCard({
  task,
  index = 0,
  onOpenUpdateModal,
}: TaskCardProps) {
  const TaskIcon = getTaskIconByName(task.icon);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const statusInfo = getStatusStyles();
  const StatusIcon = statusInfo.icon;
  const isPastDue = !task.completedAt && isPast(new Date(task.dueDate));
  // Crutial callback implementation to avoid too many re-renders
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

  function getStatusStyles() {
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
  }

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

  // ---Maybe handlers for server actions (can use useFormState for feedback)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: "0px 8px 25px rgba(0,0,0,0.1)" }}
      layout // Animates layout changes (e.g., if content changes)
      style={
        {
          "--task-color": task.color,
          border: "1px solid #0c4a6e",
          borderRadius: "0.5rem",
        } as React.CSSProperties
      }
      ref={outsideClickRef}
    >
      <div className="p-5 flex items-start space-x-4 border-b border-divider relative">
        <div
          className="p-3 rounded-lg w-12 h-12 flex items-center justify-center"
          style={{ backgroundColor: `${task.color}33` }}
        >
          <TaskIcon size={24} style={{ color: task.color }} />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-semibold text-text-high break-words text-pretty mb-2 truncate">
            {task.title}
          </h3>
          <p className="text-xs font-semibold  text-text-low uppercase tracking-wider">
            {task.type}
          </p>
        </div>
        <div className="relative shrink-0">
          <Button
            variant="secondary"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Task options"
          >
            <CardSpecificIcons.Options size={20} />
          </Button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.95,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-60 bg-background-600 border border-divider shadow-xl rounded-lg p-1.5 z-50 origin-top-right focus:outline-none"
              >
                {/* ---: Action: Mark as Completed/Pending --- */}
                {task.status !== "completed" && (
                  <li>
                    <form
                      action={updateTaskStatusAction}
                      onSubmit={() => setIsDropdownOpen(false)}
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="newStatus" value="completed" />
                      <ActionSubmitButton Icon={CardSpecificIcons.MarkComplete}>
                        Mark as Completed
                      </ActionSubmitButton>
                    </form>
                  </li>
                )}
                {task.status === "completed" && (
                  <li>
                    <form
                      action={updateTaskStatusAction}
                      onSubmit={() => setIsDropdownOpen(false)}
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="newStatus" value="pending" />
                      <ActionSubmitButton
                        Icon={CardSpecificIcons.StatusPending}
                      >
                        Mark as Pending
                      </ActionSubmitButton>
                    </form>
                  </li>
                )}

                {/* ---: Action: Delay --- */}
                {task.status !== "completed" && (
                  <>
                    <li>
                      <form
                        action={delayTaskAction}
                        onSubmit={() => setIsDropdownOpen(false)}
                      >
                        <input type="hidden" name="taskId" value={task.id} />
                        <input
                          type="hidden"
                          name="delayOption"
                          value="tomorrow"
                        />
                        <ActionSubmitButton
                          Icon={CardSpecificIcons.DelayTomorrow}
                        >
                          Delay to Tomorrow
                        </ActionSubmitButton>
                      </form>
                    </li>
                    <li>
                      <form
                        action={delayTaskAction}
                        onSubmit={() => setIsDropdownOpen(false)}
                      >
                        <input type="hidden" name="taskId" value={task.id} />
                        <input
                          type="hidden"
                          name="delayOption"
                          value="nextWeek"
                        />
                        <ActionSubmitButton
                          Icon={CardSpecificIcons.DelayNextWeek}
                        >
                          Delay 1 Week
                        </ActionSubmitButton>
                      </form>
                    </li>
                  </>
                )}

                {/* ---: Action: Reschedule (with date input) --- */}
                {task.status !== "completed" && (
                  <li className="px-1.5 py-1.5 group">
                    <form
                      action={rescheduleTaskAction}
                      className="space-y-1.5"
                      onSubmit={() => setIsDropdownOpen(false)}
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <label
                        htmlFor={`reschedule-date-${task.id}`}
                        className="block text-xs text-text-low px-1.5"
                      >
                        Reschedule to:
                      </label>
                      <div className="flex items-center space-x-2 px-1.5">
                        <input
                          id={`reschedule-date-${task.id}`}
                          type="date"
                          name="newDueDate"
                          defaultValue={
                            new Date(task.dueDate).toISOString().split("T")[0]
                          }
                          className="flex-grow p-1.5 border border-divider rounded-md text-sm bg-background-input text-text-default focus:ring-primary-600 focus:border-primary-600"
                          required
                        />
                        <Button type="submit" aria-label="Confirm reschedule">
                          Set
                        </Button>
                      </div>
                    </form>
                  </li>
                )}

                {/* ---: Action: Toggle Priority --- */}
                <li>
                  <form
                    action={togglePriorityAction}
                    onSubmit={() => setIsDropdownOpen(false)}
                  >
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="currentIsPriority"
                      value={task.isPriority.toString()}
                    />
                    <ActionSubmitButton
                      Icon={
                        task.isPriority
                          ? CardSpecificIcons.RemovePriority
                          : CardSpecificIcons.AddPriority
                      }
                    >
                      {task.isPriority ? "Remove Priority" : "Add Priority"}
                    </ActionSubmitButton>
                  </form>
                </li>

                <li className="my-1">
                  <hr className="border-divider opacity-50" />
                </li>

                {/* ---: Action: Update (opens modal via prop) --- */}
                {onOpenUpdateModal && (
                  <li>
                    <button
                      onClick={() => {
                        onOpenUpdateModal(task);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-text-medium hover:bg-background-hover flex items-center transition-colors duration-150 rounded-md group"
                    >
                      <CardSpecificIcons.Edit
                        size={16}
                        className="mr-2.5 text-text-low group-hover:text-text-high transition-colors"
                      />
                      Update Task...
                    </button>
                  </li>
                )}

                {/* ---: Action: Delete --- */}
                <li>
                  <form
                    action={deleteTaskAction}
                    onSubmit={() => setIsDropdownOpen(false)}
                  >
                    <input type="hidden" name="taskId" value={task.id} />
                    <ActionSubmitButton
                      Icon={CardSpecificIcons.Delete}
                      className="text-red-500 hover:bg-red-500/10"
                      classNameIcon="group-hover:bg-red-500"
                    >
                      <span className="group-hover:text-red-500">
                        Delete Task
                      </span>
                    </ActionSubmitButton>
                  </form>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-5 flex-grow space-y-3">
        {task.description && (
          <p className="text-sm mb-4 text-text-gray leading-relaxed line-clamp-3">
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
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
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

      <div className="px-5 py-3 bg-background-main/30 border-t border-divider text-xs text-text-low space-y-1">
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
        {/* {task.preconditionTaskIds && task.preconditionTaskIds.length > 0 && (
          <div className="flex items-center text-orange-400/80">
            <CardSpecificIcons.PreconditionTasks size={14} className="mr-1.5" />
            <span>Blocked by {task.preconditionTaskIds.length} task(s)</span>
          </div>
        )} */}
        <p className="text-right opacity-60">
          Last updated: {formatDateTime(task.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
}
