import { useFormStatus } from "react-dom";
import Button from "./reusable/Button";
import {
  handleToast,
  canCompleteRepeatingTaskNow,
  getStartAndEndTime,
  formatDate,
} from "@/app/_utils/utils";
import { CardSpecificIcons } from "../_utils/icons";

import { AnimatePresence, motion } from "framer-motion";
import { Task } from "@/app/_types/types";
import { isSameDay, isToday, format, isTomorrow } from "date-fns";
import {
  delayTaskAction,
  completeTaskAction,
  toggleReminderAction,
  togglePriorityAction,
  updateTaskExperienceAction,
  deleteTaskAction,
} from "@/app/_lib/actions";
import EmojiExperience from "./EmojiExperience";

function ActionSubmitButton({
  children,
  className,
  Icon,
  classNameIcon,
  disabled: propDisabled = false,
  colorIcon,
}: {
  children: React.ReactNode;
  className?: string;
  Icon?: React.ElementType;
  classNameIcon?: string;
  disabled?: boolean;
  colorIcon?: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || propDisabled;
  return (
    <Button
      type="submit"
      disabled={isDisabled}
      variant="secondary"
      className={`w-full text-left px-2.5 py-2.5 text-sm text-text-gray ${className} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {Icon && (
        <Icon
          size={16}
          color={colorIcon}
          className={`mr-2.5 text-text-low group-hover:text-text-high transition-colors ${
            classNameIcon ? classNameIcon : ""
          }`}
        />
      )}
      {pending ? "Processing..." : children}
    </Button>
  );
}

function getCompletionAvailabilityInfo(task: Task, canComplete?: boolean) {
  // If task is completed today, show completion message
  if (task.completedAt && isToday(task.completedAt)) {
    return {
      text: "Already completed today",
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  // If task is already completed (but not today)
  if (task.status === "completed") {
    return {
      text: "Already completed",
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  // For repeating tasks, use the advanced logic
  if (task.isRepeating) {
    const { canCompleteNow, isDueToday } = canCompleteRepeatingTaskNow(task);
    const { startTime, endTime } = getStartAndEndTime(task);

    if (canCompleteNow) {
      return {
        text: "Complete",
        canComplete: true,
        icon: CardSpecificIcons.MarkComplete,
      };
    }

    // If task is due today but not available right now due to time window
    if (isDueToday && startTime && endTime) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const startTimeInMinutes =
        Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);
      const endTimeInMinutes =
        Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

      if (currentTimeInMinutes < startTimeInMinutes) {
        return {
          text: `Available from ${startTime}`,
          canComplete: false,
          icon: CardSpecificIcons.MarkComplete,
        };
      } else if (currentTimeInMinutes > endTimeInMinutes) {
        return {
          text: `Was available until ${endTime}`,
          canComplete: false,
          icon: CardSpecificIcons.MarkComplete,
        };
      }
    }

    // If task is not due today, show when it will be available
    if (!isDueToday) {
      if (isTomorrow(task.dueDate)) {
        return {
          text: "Can complete tomorrow",
          canComplete: false,
          icon: CardSpecificIcons.MarkComplete,
        };
      } else {
        if (task.repetitionRule?.timesPerWeek)
          return {
            text: `Available ${formatDate(task.repetitionRule.startDate)}`,
            canComplete: false,
            icon: CardSpecificIcons.MarkComplete,
          };
        return {
          text: `Available ${formatDate(task.dueDate)}`,
          canComplete: false,
          icon: CardSpecificIcons.MarkComplete,
        };
      }
    }

    // Fallback for repeating tasks
    return {
      text: "Not available now",
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  // For regular tasks, use the canComplete prop or default behavior
  if (canComplete === false) {
    // Check if it's tomorrow
    if (isTomorrow(task.dueDate)) {
      return {
        text: "Can complete tomorrow",
        canComplete: false,
        icon: CardSpecificIcons.MarkComplete,
      };
    }

    // For future dates
    return {
      text: `Available ${format(task.dueDate, "MMM d")}`,
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  // Default case - can complete
  return {
    text: "Complete",
    canComplete: canComplete === undefined || canComplete === true,
    icon: CardSpecificIcons.MarkComplete,
  };
}

export default function Dropdown({
  isDropdownOpen,
  setIsDropdownOpen,
  task,
  canComplete = undefined,
  handleComplete = undefined,
}: {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isDropdownOpen: boolean) => void;
  task: Task;
  canComplete?: boolean;
  handleComplete?: () => void;
}) {
  const completionInfo = getCompletionAvailabilityInfo(task, canComplete);

  return (
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
            className="absolute right-0 mt-2 w-60 bg-background-600 border border-divider shadow-xl rounded-lg p-1.5 z-[100] origin-top-right focus:outline-none "
          >
            {/* ---: Action: Mark as Completed  --- */}
            <li>
              <form
                action={
                  completionInfo.canComplete
                    ? !task.isRepeating
                      ? async (formData: FormData) => {
                          const res = await completeTaskAction(formData);
                          handleToast(res, () => setIsDropdownOpen(false));
                        }
                      : handleComplete
                    : async () => {}
                }
              >
                <input type="hidden" name="taskId" value={task.id} />
                <ActionSubmitButton
                  Icon={completionInfo.icon}
                  disabled={!completionInfo.canComplete}
                >
                  {completionInfo.text}
                </ActionSubmitButton>
              </form>
            </li>

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
                          task.dueDate,
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
                              task.dueDate,
                              task.delayCount
                            );
                            handleToast(res, () => setIsDropdownOpen(false));
                          }}
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
                    const res = await delayTaskAction(
                      formData,
                      task.dueDate,
                      task.delayCount,
                      task.dueDate
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
                        new Date(new Date().setDate(new Date().getDate() + 1))
                          .toISOString()
                          .split("T")[0]
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
            {task.status !== "completed" && (
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
            {/* ---: Action: Toggle Reminder --- */}
            {task.status !== "completed" && (
              <li>
                <form
                  action={async (formData: FormData) => {
                    const res = await toggleReminderAction(formData);
                    handleToast(res, () => setIsDropdownOpen(false));
                  }}
                >
                  <input type="hidden" name="taskId" value={task.id} />
                  <input
                    type="hidden"
                    name="currentIsReminder"
                    value={task.isReminder.toString()}
                  />
                  <ActionSubmitButton
                    Icon={
                      task.isReminder
                        ? CardSpecificIcons.RemoveReminder
                        : CardSpecificIcons.AddReminder
                    }
                  >
                    {task.isReminder ? "Remove Reminder" : "Add Reminder"}
                  </ActionSubmitButton>
                </form>
              </li>
            )}
            {/* Emoji experience */}
            {task.status === "completed" && (
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
                  className=" hover:bg-red-500/10"
                  colorIcon="var(--color-red-500)"
                >
                  <span className="text-red-500">Delete Task</span>
                </ActionSubmitButton>
              </form>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
