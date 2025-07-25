import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import {
  Home,
  FileText,
  Inbox,
  Calendar,
  ChartColumn,
  CalendarArrowUp,
} from "lucide-react";
import {
  DayOfWeek,
  EmojiOption,
  Task,
  TimeManagementStats,
  NotificationType,
  NotificationPriority,
} from "../_types/types";
import {
  differenceInDays,
  getDay,
  isBefore,
  isEqual,
  isPast,
  startOfDay,
  isSameWeek,
  format,
} from "date-fns";
import { isFuture, isToday } from "date-fns";
import { customToast } from "./toasts";
import { CardSpecificIcons } from "./icons";

export const colorsColorPicker = [
  "var(--color-primary-500)",
  "#0c4a6e",
  "#3b82f6",
  "#1e40af",
  "#8b5cf6",
  "#5b21b6",
  "#f59e0b",
  "#92400e",
  "#ef4444",
  "#991b1b",
  "#84cc16",
  "#10b981",
  "#0f766e",
  "#365314",
  "#ec4899",
  "#be185d",
  "#f97316",
  "#c2410c",
  "#64748b",
  "#334155",
];
export const TASK_PLACEHOLDERS = [
  "Buy barbecue sauce tomorrow",
  "Pick up grandma from the airport",
  "Repair neighbor's car",
  "Call dentist for appointment",
  "Organize a party for the kids",
  "Learn guitar chords",
  "Plan weekend hiking trip",
  "Pay gym membership",
  "Clean out garage",
  "Research vacation destinations",
];

/** Search feature */
export const navItemsToSearch = [
  {
    icon: Home,
    label: "Dashboard",
    command: ["Ctrl", "H"],
    link: "/webapp/",
  },
  {
    icon: Inbox,
    label: "Inbox",
    command: ["Ctrl", "I"],
    link: "/webapp/inbox",
  },
  {
    icon: ChartColumn,
    label: "Tasks",
    command: ["Ctrl", "F"],
    link: "/webapp/tasks",
  },
  {
    icon: CalendarArrowUp,
    label: "Calendar",
    command: ["Ctrl", "U"],
    link: "/webapp/calendar",
  },
  {
    icon: Calendar,
    label: "Today",
    command: ["Ctrl", "F1"],
    link: "/webapp/today",
  },
  {
    icon: FileText,
    label: "Notes",
    command: ["Ctrl", "F2"],
    link: "/webapp/notes",
  },
];

export const emojiOptions: EmojiOption[] = [
  {
    id: "bad",
    emoji: CardSpecificIcons.ExperienceBad,
    label: "Bad",
    selected: false,
  },
  {
    id: "okay",
    emoji: CardSpecificIcons.ExperienceOkay,
    label: "Okay",
    selected: false,
  },
  {
    id: "good",
    emoji: CardSpecificIcons.ExperienceGood,
    label: "Good",
    selected: false,
  },
  {
    id: "best",
    emoji: CardSpecificIcons.ExperienceBest,
    label: "Best",
    selected: false,
  },
];
/*Task icon calculator - matches by id, displayName, or label*/

export function getStatusStyles(status: "completed" | "delayed" | "pending") {
  switch (status) {
    case "completed":
      return {
        icon: CardSpecificIcons.StatusCompleted,
        text: "Completed",
        colorClass: "text-green-400",
        bgColorClass: "bg-green-500/10",
      };
    case "delayed":
      return {
        icon: CardSpecificIcons.StatusDelayed,
        text: "Delayed",
        colorClass: "text-red-400",
        bgColorClass: "bg-red-500/10",
      };
    case "pending":
    default:
      return {
        icon: CardSpecificIcons.StatusPending,
        text: "Pending",
        colorClass: "text-yellow-400",
        bgColorClass: "bg-yellow-500/10",
      };
  }
}

/* Date functions */
/* Date functions */
/* Date functions */
export const getPhaseOfTheDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

export const formatDate = (
  date: Date | string | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";

    // Check for relative dates first
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const givenDate = startOfDay(dateObj);

    if (isEqual(givenDate, today)) return "Today";
    if (isEqual(givenDate, tomorrow)) return "Tomorrow";

    return dateObj.toLocaleDateString(
      undefined,
      options || {
        month: "long",
        day: "numeric",
      }
    );
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return "Error Date";
  }
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date/time:", date, error);
    return "Error Date/Time";
  }
};

/* Toaster */
/* Toaster */
/* Toaster */
export function successToast(message: string) {
  customToast("Success", message);
}

export function errorToast(message: string) {
  customToast("Error", message);
}

export function warningToast(message: string) {
  customToast("Warning", message);
}

export function infoToast(message: string) {
  customToast("Info", message);
}
export const handleToast = (
  state: {
    success: boolean;
    message?: string;
    error?: string;
  },
  handler?: () => void
) => {
  if (state.message || state.error) {
    if (state.success) {
      successToast(state.message || "Action performed successfully.");
      handler?.();
    } else {
      errorToast(
        state.error || state.message || "Failed to perform task action."
      );
    }
  }
};

export const getNotificationStyles = (priority: NotificationPriority) => {
  const styleMap = {
    LOW: {
      borderColor: "border-gray-300",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      iconColor: "text-gray-500",
    },
    MEDIUM: {
      borderColor: "border-blue-300",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
    HIGH: {
      borderColor: "border-orange-300",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800",
      iconColor: "text-orange-600",
    },
    URGENT: {
      borderColor: "border-red-300",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      iconColor: "text-red-600",
    },
  };

  return styleMap[priority];
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labelMap = {
    TASK_OVERDUE: "Overdue Task",
    TASK_DUE_SOON: "Due Soon",
    ACHIEVEMENT_UNLOCKED: "Achievement",
    WEEKLY_SUMMARY: "Weekly Summary",
    POINTS_MILESTONE: "Points Milestone",
    SYSTEM: "System Update",
  };

  return labelMap[type] || "Notification";
};

export const formatNotificationTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(date, { month: "short", day: "numeric" });
};

export const getPriorityBadgeStyles = (priority: NotificationPriority) => {
  const badgeMap = {
    LOW: "bg-gray-100 text-gray-800 border-gray-200",
    MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    URGENT: "bg-red-100 text-red-800 border-red-200",
  };

  return badgeMap[priority];
};

export const formatNotificationCount = (count: number): string => {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return count.toString();
};

/*Stats */
/*Stats */
/*Stats */
export const calculateTaskPoints = (task: Task) => {
  const delayCount = task.delayCount || 0; // Ensure delayCount is never undefined/null
  const points = -2 * delayCount + 10;

  if (isNaN(points)) {
    console.error(
      `calculateTaskPoints: Calculated NaN points! delayCount=${delayCount}, task:`,
      task
    );
    return 10; // Default to 10 points if calculation fails
  }

  return Math.max(0, points);
};

export function calculateTimeManagementStats(
  regularTasks: Task[]
): TimeManagementStats {
  let onTimeTasksCount = 0;
  let totalDelayDays = 0;
  let delayedAndCompletedCount = 0;
  let totalRelevantTasksForTiming = 0;

  regularTasks.forEach((task) => {
    // For regular tasks that are completed
    if (task.status === "completed" && task.completedAt) {
      totalRelevantTasksForTiming++;
      const dueDateStart = startOfDay(task.dueDate);
      const completedAtStart = startOfDay(task.completedAt);

      if (
        isBefore(completedAtStart, dueDateStart) ||
        isEqual(completedAtStart, dueDateStart)
      ) {
        onTimeTasksCount++;
      } else {
        const delay = differenceInDays(completedAtStart, dueDateStart);
        if (delay > 0) {
          totalDelayDays += delay;
          delayedAndCompletedCount++;
        }
      }
    }
  });

  const averageDelayDays =
    delayedAndCompletedCount > 0
      ? Math.round(totalDelayDays / delayedAndCompletedCount)
      : 0;
  const onTimeCompletionRate =
    totalRelevantTasksForTiming > 0
      ? Math.round((onTimeTasksCount / totalRelevantTasksForTiming) * 100)
      : 0;

  return {
    onTimeTasksCount,
    totalRelevantTasksForTiming,
    averageDelayDays,
    onTimeCompletionRate,
  };
}

export function generateTaskTypes(allTasks: Task[]) {
  const regularTasks: Task[] = [];
  const repeatingTasks: Task[] = [];
  const completedPriorityTasks: Task[] = [];
  const pendingPriorityTasks: Task[] = [];
  const repeatingTasksDueToday: Task[] = [];
  const completedTodayRepeatingTasks: Task[] = [];
  const todaysTasks: Task[] = [];
  const upcomingTasks: Task[] = [];

  // Only regular tasks
  const missedTasks: Task[] = [];
  const delayedTasks: Task[] = [];
  const completedTasks: Task[] = [];
  const completedTodayRegularTasks: Task[] = [];
  const pendingTodayTasks: Task[] = [];
  const pendingTasks: Task[] = [];
  const incompleteRepeatingTodayTasks: Task[] = [];
  const incompleteRegularTodayTasks: Task[] = [];

  allTasks.map((task) => {
    if (task.isRepeating) {
      repeatingTasks.push(task);
      const { isDueToday } = canCompleteRepeatingTaskNow(task);
      if (isDueToday) {
        repeatingTasksDueToday.push(task);
        todaysTasks.push(task);

        if (
          task.repetitionRule?.completedAt.some((d) => isToday(d)) ||
          (task.completedAt &&
            isToday(task.completedAt) &&
            task.status === "completed")
        )
          completedTodayRepeatingTasks.push(task);
        else incompleteRepeatingTodayTasks.push(task);
      }
    } else {
      regularTasks.push(task);
      if (isToday(task.dueDate)) {
        todaysTasks.push(task);
        if (task.status !== "completed") incompleteRegularTodayTasks.push(task);
        else completedTodayRegularTasks.push(task);
      }

      if (
        isPast(task.dueDate) &&
        !isToday(task.dueDate) &&
        task.status === "pending"
      )
        missedTasks.push(task);

      if ((task.delayCount || 0) > 0 && task.status === "delayed")
        delayedTasks.push(task);
    }

    if (
      isFuture(task.dueDate) &&
      !isToday(task.dueDate) &&
      task.status !== "completed"
    )
      upcomingTasks.push(task);

    if (task.status === "completed") {
      if (task.isPriority) completedPriorityTasks.push(task);
      completedTasks.push(task);
    }

    if (isToday(task.dueDate) && task.status === "pending") {
      if (task.isPriority) pendingPriorityTasks.push(task);
      pendingTodayTasks.push(task);
    }
    if (task.status === "pending") pendingTasks.push(task);
  });

  return {
    regularTasks,
    completedTodayRegularTasks,
    incompleteRegularTodayTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    todaysTasks,
    pendingTasks,
    pendingTodayTasks,
    repeatingTasks,
    incompleteRepeatingTodayTasks,
    repeatingTasksDueToday,
    completedTodayRepeatingTasks,
    completedPriorityTasks,
    pendingPriorityTasks,
    completedTasks,
  };
}

export function getTimeString(startTime: string, endTime: string): string {
  const hasStartTime = startTime !== "00:00";
  const isEndTimeDefault = endTime === "23:59" || endTime === "00:00";
  const startEqualsEnd = startTime === endTime;

  if (!hasStartTime && isEndTimeDefault) {
    return "";
  }

  if (hasStartTime && isEndTimeDefault) {
    return ` from ${startTime}`;
  }

  if (!hasStartTime || startEqualsEnd) {
    return ` to ${endTime}`;
  }

  return ` ${startTime} - ${endTime}`;
}

/**
 * A task is considered "at risk" if its due date is today or has already passed
 */
export function isTaskAtRisk(task: Task): boolean {
  const currentDate = startOfDay(new Date());

  const rule = task.repetitionRule;

  if (rule?.timesPerWeek) {
    const remainingCompletions = rule.timesPerWeek - rule.completions;
    const daysLeftInWeek = 7 - getDay(currentDate);
    return remainingCompletions >= daysLeftInWeek;
  }

  return (
    (isPast(task.dueDate) || isToday(task.dueDate)) &&
    task.status !== "completed"
  );
}

export function getStartAndEndTime(task: Task) {
  let startTime: string;
  const dueDate = new Date(task.dueDate);
  const endTime =
    dueDate.getHours().toString().padStart(2, "0") +
    ":" +
    dueDate.getMinutes().toString().padStart(2, "0");
  if (
    !task?.startTime ||
    task.startTime.hour === undefined ||
    task.startTime.minute === undefined
  ) {
    startTime = "00:00";
  } else {
    startTime =
      task.startTime.hour.toString().padStart(2, "0") +
      ":" +
      task.startTime.minute.toString().padStart(2, "0");
  }
  return { startTime, endTime };
}
export function getCompletionAvailabilityInfo(
  task: Task,
  canComplete?: boolean
) {
  if (isPast(task.dueDate) && !task.isRepeating) {
    return {
      text: "Missed",
      canComplete: false,
      icon: CardSpecificIcons.StatusMissed,
    };
  }

  if (task.completedAt && isToday(task.completedAt)) {
    return {
      text: "Completed today",
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  if (task.completedAt && task.status === "completed") {
    return {
      text: "Already completed",
      canComplete: false,
      icon: CardSpecificIcons.MarkComplete,
    };
  }

  if (task.isRepeating) {
    const { canCompleteNow, isDueToday } = canCompleteRepeatingTaskNow(task);
    const { startTime, endTime } = getStartAndEndTime(task);

    if (canCompleteNow) {
      return {
        text: "Complete now",
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
        };
      } else if (currentTimeInMinutes > endTimeInMinutes) {
        return {
          text: `Was available until ${endTime}`,
          canComplete: false,
        };
      }
    }

    if (!isDueToday) {
      return {
        text: `Available ${formatDate(task.dueDate)}`,
        canComplete: false,
      };
    }

    // Fallback for repeating tasks
    return {
      text: "Not available now",
      canComplete: false,
    };
  }

  // For regular tasks, use the canComplete prop or default behavior
  if (canComplete === false) {
    return {
      text: `Available ${format(task.dueDate, "MMM d")}`,
      canComplete: false,
    };
  }

  // Default case - can complete
  return {
    text: "Complete",
    canComplete: canComplete === undefined || canComplete === true,
    icon: CardSpecificIcons.MarkComplete,
  };
}

/*Repeating tasks */
export const MONDAY_START_OF_WEEK = { weekStartsOn: 1 } as const;

export function canCompleteRepeatingTaskNow(task: Task): {
  canCompleteNow: boolean;
  sameWeek?: boolean;
  isDueToday: boolean;
} {
  if (!task.isRepeating || !task.repetitionRule) {
    return { canCompleteNow: false, isDueToday: false };
  }
  const today = new Date();
  const rule = task.repetitionRule;
  if (task.startDate && isFuture(task.startDate))
    return { canCompleteNow: false, isDueToday: false };

  const sameWeek = isSameWeek(
    today,
    task.startDate || new Date(),
    MONDAY_START_OF_WEEK
  );

  const completedToday =
    task.status === "completed" ||
    (task.completedAt && isToday(task.completedAt as Date));

  if (completedToday) {
    return { canCompleteNow: false, sameWeek, isDueToday: true };
  }

  let isScheduledToday = false;

  if (rule.timesPerWeek) {
    isScheduledToday = sameWeek && rule.completions < rule.timesPerWeek;
  } else if (rule.daysOfWeek.length > 0) {
    const dayOfWeek = getDay(today) as DayOfWeek;
    // Decided not to include sameWeek here because it's not relevant for daysOfWeek
    isScheduledToday = rule.daysOfWeek.includes(dayOfWeek);
  } else if (rule.interval) {
    const daysSinceStart = differenceInDays(
      today,
      task.startDate || new Date()
    );
    if (daysSinceStart < 0) return { canCompleteNow: false, isDueToday: false };
    isScheduledToday = daysSinceStart % rule.interval === 0;
  }

  if (!isScheduledToday) {
    return { canCompleteNow: false, sameWeek, isDueToday: false };
  }

  // If task has specific time window (startTime + duration), check if we're in that window
  const { startTime, endTime } = getStartAndEndTime(task);

  if (startTime && endTime) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const startTimeInMinutes =
      Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);
    //const endTimeInMinutes =
    //  Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);
    const endTimeInMinutes = 23 * 60 + 59; // Can complete until the end of the day, but not before the startTime

    const isInTimeWindow =
      currentTimeInMinutes >= startTimeInMinutes &&
      currentTimeInMinutes <= endTimeInMinutes;

    // Added isToday(task.dueDate) and isScheduledToday for timesPerWeek tasks
    return {
      canCompleteNow: isInTimeWindow && isToday(task.dueDate),
      sameWeek,
      isDueToday: isToday(task.dueDate),
    };
  }

  // If no specific time window, task is available all day
  return {
    canCompleteNow: true,
    sameWeek,
    isDueToday: true,
  };
}

export const getDayName = (day: DayOfWeek): string => {
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
export const pointsMilestones = [
  100, 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 5000,
];
export const streakMilestones = [3, 7, 14, 30, 50, 75, 100];
export const taskCompletionistMilestones = [
  1, 10, 25, 50, 100, 150, 200, 300, 400, 500, 1000, 2500, 5000, 10000,
];
export const calcNextPointsMilestone = (
  currentPoints: number
): { nextMilestone: number; currentMilestoneColor: string } => {
  let nextMilestone = 0;
  let currentMilestoneColor = "#f75454";

  pointsMilestones.forEach((milestone, index) => {
    if (currentPoints >= milestone) {
      nextMilestone = pointsMilestones[index + 1];
    }
  });

  if (currentPoints >= 10000) {
    nextMilestone = 10000;
    currentMilestoneColor = "#00c853";
  }
  if (currentPoints > nextMilestone * 0.2) currentMilestoneColor = "#cf6679";
  if (currentPoints > nextMilestone * 0.4) currentMilestoneColor = "#fbabab";
  if (currentPoints > nextMilestone * 0.6) currentMilestoneColor = "#ffd600";
  if (currentPoints > nextMilestone * 0.8) currentMilestoneColor = "#0ea5e9";
  if (currentPoints > nextMilestone * 0.9) currentMilestoneColor = "#00c853";

  return { nextMilestone, currentMilestoneColor };
};
