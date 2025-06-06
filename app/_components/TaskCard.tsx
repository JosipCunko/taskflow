"use client"; // using Next.js App Router and framer-motion client features

import { AnimatePresence, motion } from "framer-motion";
import {
  getTaskIconByName,
  CardSpecificIcons,
  handleToast,
  getStatusStyles,
} from "../utils";
import { formatDate, formatDateTime } from "../utils";
import { Task } from "../_types/types";
import { format, isPast, isSameDay, isToday, isValid } from "date-fns";
import { useFormStatus } from "react-dom";
import Button from "./reusable/Button";
import { useState, useMemo } from "react";
import {
  delayTaskAction,
  rescheduleTaskAction,
  togglePriorityAction,
  updateTaskStatusAction,
  deleteTaskAction,
  updateTaskExperienceAction,
} from "../_lib/actions";
import { useOutsideClick } from "../_hooks/useOutsideClick";
import EmojiExperience from "./EmojiExperience";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Repeat,
  Tag,
  Timer,
} from "lucide-react";

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
      className={`w-full text-left px-2.5 py-2.5 text-sm text-text-gray    ${className} ${
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
}

export default function TaskCard({ task, index = 0 }: TaskCardProps) {
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

  const getExperienceIcon = () => {
    if (!task.completedAt || !task.experience) return null;
    const commonClasses = "w-5 h-5";
    switch (task.experience) {
      case "good":
        return (
          <CardSpecificIcons.ExperienceGood
            className={`${commonClasses} text-green-400`}
          />
        );
      case "okay":
        return (
          <CardSpecificIcons.ExperienceOkay
            className={`${commonClasses} text-yellow-400`}
          />
        );
      case "bad":
        return (
          <CardSpecificIcons.ExperienceBad
            className={`${commonClasses} text-red-400`}
          />
        );
      case "best":
        return (
          <CardSpecificIcons.ExperienceBest
            className={`${commonClasses} text-yellow-400`} // Assuming best is also yellow, or choose another color
          />
        );
      default:
        return null;
    }
  };

  const endTime =
    task.dueDate.getHours().toString().padStart(2, "0") +
    ":" +
    task.dueDate.getMinutes().toString().padStart(2, "0");
  const startTime =
    task.startTime?.hour.toString().padStart(2, "0") +
    ":" +
    task.startTime?.minute.toString().padStart(2, "0");

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: "0px 6px 20px rgba(0,0,0,0.07)" }}
      layout
      className="bg-background-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"
      style={{ borderColor: task.color }}
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

        <div className="relative shrink-0">
          <Button
            variant="secondary"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Task options"
            className="text-text-low hover:text-text-high hover:bg-background-hover focus:ring-1 focus:ring-primary-500 p-2 rounded-md"
          >
            <CardSpecificIcons.Options size={18} />
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
                {!task.isRepeating && task.status !== "completed" && (
                  <li>
                    <form
                      action={async (formData: FormData) => {
                        const res = await updateTaskStatusAction(formData);
                        handleToast(res, () => setIsDropdownOpen(false));
                      }}
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="newStatus" value="completed" />
                      <ActionSubmitButton Icon={CardSpecificIcons.MarkComplete}>
                        Mark as Completed
                      </ActionSubmitButton>
                    </form>
                  </li>
                )}
                {!task.isRepeating && task.status === "completed" && (
                  <li>
                    <form
                      action={async (formData: FormData) => {
                        const res = await updateTaskStatusAction(formData);
                        handleToast(res, () => setIsDropdownOpen(false));
                      }}
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
                {!task.isRepeating && task.status !== "completed" && (
                  <>
                    {!isSameDay(
                      task.dueDate,
                      new Date(new Date().setDate(new Date().getDate() + 1))
                    ) && (
                      <li>
                        <form
                          action={async (formData: FormData) => {
                            const res = await delayTaskAction(
                              formData,
                              task.startTime?.hour ??
                                new Date(task.dueDate).getHours(),
                              task.startTime?.minute ??
                                new Date(task.dueDate).getMinutes(),
                              task.delayCount
                            );
                            handleToast(res, () => setIsDropdownOpen(false));
                          }}
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
                    )}

                    {(() => {
                      // Calculate the start of next week (Monday)
                      const today = new Date();
                      const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1
                      const daysUntilNextMonday =
                        (dayOfWeek === 0 ? 1 : 8 - dayOfWeek) % 7;
                      const nextMonday = new Date(today);
                      nextMonday.setDate(
                        today.getDate() +
                          (daysUntilNextMonday === 0 ? 7 : daysUntilNextMonday)
                      ); // if today is monday, jump to next monday
                      nextMonday.setHours(0, 0, 0, 0);

                      // Calculate the due date's week start (Monday)
                      const dueDate = new Date(task.dueDate);
                      const dueDayOfWeek = dueDate.getDay();
                      const dueWeekMonday = new Date(dueDate);
                      // Adjust to get to the previous Monday (or current if it's Monday)
                      dueWeekMonday.setDate(
                        dueDate.getDate() -
                          (dueDayOfWeek === 0 ? 6 : dueDayOfWeek - 1)
                      );
                      dueWeekMonday.setHours(0, 0, 0, 0);

                      // Only render if due date is not in next week
                      if (dueWeekMonday.getTime() !== nextMonday.getTime()) {
                        return (
                          <li>
                            <form
                              action={async (formData: FormData) => {
                                const res = await delayTaskAction(
                                  formData,
                                  task.startTime?.hour ??
                                    new Date(task.dueDate).getHours(),
                                  task.startTime?.minute ??
                                    new Date(task.dueDate).getMinutes(),
                                  task.delayCount
                                );
                                handleToast(res, () =>
                                  setIsDropdownOpen(false)
                                );
                              }}
                            >
                              <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
                              />
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
                        );
                      }
                      return null;
                    })()}
                  </>
                )}

                {/* ---: Action: Reschedule (with date input) --- */}
                {!task.isRepeating && task.status !== "completed" && (
                  <li className="px-1.5 py-1.5 group">
                    <form
                      action={async (formData: FormData) => {
                        const res = await rescheduleTaskAction(
                          formData,
                          task.startTime?.hour ??
                            new Date(task.dueDate).getHours(),
                          task.startTime?.minute ??
                            new Date(task.dueDate).getMinutes()
                        );
                        handleToast(res, () => setIsDropdownOpen(false));
                      }}
                      className="space-y-1.5"
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
                        <Button type="submit" variant="secondary">
                          Set
                        </Button>
                      </div>
                    </form>
                  </li>
                )}

                {/* ---: Action: Toggle Priority --- */}
                {!task.isRepeating && task.status !== "completed" && (
                  <li>
                    <form
                      action={async (formData: FormData) => {
                        const res = await togglePriorityAction(formData);
                        handleToast(res, () => setIsDropdownOpen(false));
                      }}
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
                )}
                {/* Emoji experience */}
                {!task.isRepeating && task.status === "completed" && (
                  <li>
                    <form
                      action={async (formData: FormData) => {
                        const res = await updateTaskExperienceAction(formData);
                        handleToast(res, () => setIsDropdownOpen(false));
                      }}
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <EmojiExperience currentExperience={task.experience} />
                    </form>
                  </li>
                )}

                <li className="my-1">
                  <hr className="border-divider opacity-50" />
                </li>

                {/* ---: Action: Delete --- */}
                <li>
                  <form
                    action={async (formData: FormData) => {
                      const res = await deleteTaskAction(formData);
                      handleToast(res, () => setIsDropdownOpen(false));
                    }}
                  >
                    <input type="hidden" name="taskId" value={task.id} />
                    <ActionSubmitButton
                      Icon={CardSpecificIcons.Delete}
                      className="text-red-500 hover:bg-red-500/10"
                      classNameIcon="group-hover:text-red-500"
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

      {/* Main Content: Description, Due Date, Status, Indicators */}
      <div className="p-4 space-y-3">
        {task.description && (
          <div className="text-sm text-text-default">
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
                className="text-xs text-primary-500 hover:text-primary-400 mt-1 flex items-center"
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

        {/* Due Date & Time */}
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
          {task.startTime && startTime !== "00:00" ? (
            <div className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background-500 text-text-low flex items-center gap-2">
              {startTime !== endTime ? (
                <>
                  <span>{startTime}</span>
                  <span>-</span>
                  <span>{endTime}</span>
                </>
              ) : (
                <span>{endTime}</span>
              )}
            </div>
          ) : endTime === "23:59" ? (
            ""
          ) : (
            <div className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background-500 text-text-low ">
              <span>{endTime}</span>
            </div>
          )}
        </div>

        {/* Status Badge & Delay Count */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md ${statusInfo.bgColorClass} ${statusInfo.colorClass}`}
          >
            <StatusIcon size={14} />
            <span>
              {isPastDue &&
              task.status !== "completed" &&
              task.status !== "delayed"
                ? "Missed"
                : statusInfo.text}
            </span>
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

          {/* Repeating Task Indicator */}
          {task.isRepeating && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-teal-500/10 text-teal-400">
              <Repeat size={14} />
              <span>
                Repeating
                {task.repetitionRule?.frequency &&
                  ` (${
                    task.repetitionRule.frequency.charAt(0).toUpperCase() +
                    task.repetitionRule.frequency.slice(1)
                  })`}
              </span>
            </div>
          )}
        </div>

        {/* Duration */}
        {task.duration &&
          (task.duration.hours > 0 || task.duration.minutes > 0) && (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 w-fit">
              <Timer size={14} />
              <span>
                {task.duration.hours > 0 && `${task.duration.hours}h `}
                {task.duration.minutes > 0 && `${task.duration.minutes}m`}
              </span>
            </div>
          )}

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
        <div className="flex justify-between items-center">
          <div
            className="flex items-center"
            title={`Created: ${formatDateTime(task.createdAt)}`}
          >
            <Clock size={12} className="mr-1 opacity-70" />
            <span>
              {formatDate(task.createdAt, { day: "numeric", month: "short" })}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {getExperienceIcon()}
            {task.completedAt && (
              <span title={`Completed: ${formatDateTime(task.completedAt)}`}>
                Done:{" "}
                {formatDate(task.completedAt, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>

        <p
          className="text-right opacity-60 text-[11px]"
          title={`Last updated: ${formatDateTime(task.updatedAt)}`}
        >
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
