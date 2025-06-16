import {
  Dumbbell,
  Timer,
  Heart,
  User,
  Home,
  Apple,
  Briefcase,
  Laptop,
  FileText,
  ShoppingCart,
  Inbox,
  Calendar,
  Bell,
  Link2,
  Star,
  Meh,
  Smile,
  Frown,
  Edit3,
  Trash2,
  XCircle,
  Tag,
  CheckCircle2,
  Clock,
  ClipboardList,
  LucideIcon,
  Zap,
  MoreHorizontal,
  CalendarClock,
  CalendarPlus,
  ZapOff,
  BellPlus,
  ArrowRightLeft,
  ChartColumn,
  BookOpen,
  Code,
  Gamepad2,
  Phone,
  BicepsFlexed,
  CircleCheckBig,
  CircleX,
  CalendarArrowUp,
  AlertTriangle,
  Target,
  Trophy,
  Info,
  TrendingUp,
  PartyPopper,
  Pizza,
  Volleyball,
  BellOff,
  Utensils,
  Bed,
  Bike,
  Sandwich,
  Coffee,
  TvMinimal,
  Camera,
  Notebook,
  Hamburger,
  Gift,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ConsistencyStats,
  DayOfWeek,
  EmojiOption,
  Task,
  TaskCategories,
  TimeManagementStats,
  NotificationType,
  NotificationPriority,
} from "./_types/types";
import {
  differenceInCalendarDays,
  differenceInDays,
  formatISO,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  isPast,
  parseISO,
  startOfDay,
  isSameWeek,
} from "date-fns";
import { isFuture, isToday } from "date-fns";

export const TASK_ICONS = [
  {
    id: "user",
    icon: User,
    label: "User",
  },
  {
    id: "home",
    icon: Home,
    label: "Home",
  },
  {
    id: "heart",
    icon: Heart,
    label: "Heart",
  },
  {
    id: "Smile",
    icon: Smile,
    label: "Smile",
  },
  {
    id: "Sleep",
    icon: Bed,
    label: "Sleep",
  },
  {
    id: "Food",
    icon: Utensils,
    label: "Food",
  },
  {
    id: "Apple",
    icon: Apple,
    label: "Apple",
  },
  {
    id: "Pizza",
    icon: Pizza,
    label: "Pizza",
  },
  {
    id: "Hamburger",
    icon: Hamburger,
    label: "Hamburger",
  },
  {
    id: "Sandwich",
    icon: Sandwich,
    label: "Sandwich",
  },
  {
    id: "Coffee",
    icon: Coffee,
    label: "Coffee",
  },
  {
    id: "dumbbell",
    icon: Dumbbell,
    label: "Dumbbell",
  },
  {
    id: "Bike",
    icon: Bike,
    label: "Bike",
  },
  {
    id: "Volleyball",
    icon: Volleyball,
    label: "Volleyball",
  },
  {
    id: "Briefcase",
    icon: Briefcase,
    label: "Briefcase",
  },
  {
    id: "Code",
    icon: Code,
    label: "Code",
  },
  {
    id: "Phone",
    icon: Phone,
    label: "Phone",
  },
  {
    id: "BookOpen",
    icon: BookOpen,
    label: "Book",
  },
  {
    id: "file-text",
    icon: FileText,
    label: "File",
  },
  {
    id: "Notebook",
    icon: Notebook,
    label: "Notebook",
  },
  {
    id: "Camera",
    icon: Camera,
    label: "Camera",
  },
  {
    id: "TvMinimal",
    icon: TvMinimal,
    label: "Tv",
  },
  {
    id: "Gamepad",
    icon: Gamepad2,
    label: "Gamepad",
  },
  {
    id: "laptop",
    icon: Laptop,
    label: "Laptop",
  },
  {
    id: "PartyPopper",
    icon: PartyPopper,
    label: "Party Popper",
  },

  {
    id: "timer",
    icon: Timer,
    label: "Timer",
  },
  {
    id: "Star",
    icon: Star,
    label: "Star",
  },
  {
    id: "Trophy",
    icon: Trophy,
    label: "Trophy",
  },
  {
    id: "shopping-cart",
    icon: ShoppingCart,
    label: "Shopping Cart",
  },
  {
    id: "Gift",
    icon: Gift,
    label: "Gift",
  },
];
const ACTIVITY_ICONS = [
  {
    id: "succuess",
    icon: CircleCheckBig,
    label: "success",
  },
  {
    id: "deletion",
    icon: CircleX,
    label: "deletion",
  },
];
export const CardSpecificIcons = {
  DueDate: Calendar,
  Priority: Zap,
  Reminder: Bell,
  StatusPending: Clock,
  StatusCompleted: CheckCircle2,
  StatusDelayed: XCircle,
  StatusMissed: XCircle,
  Tag: Tag,
  Precondition: Link2,
  Points: Star,
  ExperienceGood: Smile,
  ExperienceOkay: Meh,
  ExperienceBad: Frown,
  Options: MoreHorizontal,
  Edit: Edit3,
  Delete: Trash2,
  PreconditionTasks: ArrowRightLeft,
  MarkComplete: CheckCircle2,
  DelayTomorrow: CalendarClock,
  DelayNextWeek: CalendarClock,
  Reschedule: CalendarPlus,
  AddPriority: Zap,
  RemovePriority: ZapOff,
  SetReminder: BellPlus,
  Smile: Smile,
  ExperienceBest: BicepsFlexed,
  Time: Clock,
  AddReminder: BellPlus,
  RemoveReminder: BellOff,
};
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
  { id: "bad", emoji: Frown, label: "Bad", selected: false },
  { id: "okay", emoji: Meh, label: "Okay", selected: false },
  { id: "good", emoji: Smile, label: "Good", selected: false },
  { id: "best", emoji: BicepsFlexed, label: "Best", selected: false },
];
/*Task icon calculator - matches by id, displayName, or label*/
export const getTaskIconByName = (name: string | undefined): LucideIcon => {
  if (!name) return ClipboardList;

  // Try to find by id first (most common case)
  const foundById =
    TASK_ICONS.find((item) => item.id.toLowerCase() === name.toLowerCase()) ||
    ACTIVITY_ICONS.find((item) => item.id.toLowerCase() === name.toLowerCase());

  if (foundById) return foundById.icon;

  // Fallback to displayName matching
  const foundByDisplayName =
    TASK_ICONS.find(
      (item) => item.icon.displayName?.toLowerCase() === name.toLowerCase()
    ) ||
    ACTIVITY_ICONS.find(
      (item) => item.icon.displayName?.toLowerCase() === name.toLowerCase()
    );

  if (foundByDisplayName) return foundByDisplayName.icon;

  // Final fallback to label matching
  const foundByLabel =
    TASK_ICONS.find(
      (item) => item.label.toLowerCase() === name.toLowerCase()
    ) ||
    ACTIVITY_ICONS.find(
      (item) => item.label.toLowerCase() === name.toLowerCase()
    );

  return foundByLabel ? foundByLabel.icon : ClipboardList;
};

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
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const givenDate = startOfDay(dateObj);

    if (isEqual(givenDate, today)) return "Today";
    if (isEqual(givenDate, tomorrow)) return "Tomorrow";
    if (isEqual(givenDate, yesterday)) return "Yesterday";

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
  toast(message, {
    style: {
      backgroundColor: "#0e1a2e",
      border: "1px solid #0284c7a1",
      color: "#cbd5e1",
      overflow: "hidden",
    },
    icon: "✅",
  });
}

export function errorToast(message: string) {
  toast(message, {
    style: {
      backgroundColor: "#0e1a2e",
      border: "1px solid #f43f5ea1",
      color: "#cbd5e1",
      overflow: "hidden",
    },
    icon: "❌",
  });
}

export function infoToast(message: string) {
  toast(message, {
    style: {
      backgroundColor: "#0e1a2e",
      border: "1px solid #0284c7a1",
      color: "#cbd5e1",
      overflow: "hidden",
    },
    icon: "ℹ️",
  });
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

export const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    TASK_AT_RISK: AlertTriangle,
    TASK_OVERDUE: Clock,
    TASK_DUE_SOON: Calendar,
    STREAK_AT_RISK: Zap,
    STREAK_MILESTONE: Trophy,
    PRIORITY_TASK_PENDING: Target,
    ACHIEVEMENT_UNLOCKED: Trophy,
    WEEKLY_SUMMARY: TrendingUp,
    TASK_REMINDER: Bell,
    CONSISTENCY_ALERT: Target,
    POINTS_MILESTONE: Trophy,
    SYSTEM_UPDATE: Info,
  };

  return iconMap[type] || Bell;
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
    TASK_AT_RISK: "Task at Risk",
    TASK_OVERDUE: "Overdue Task",
    TASK_DUE_SOON: "Due Soon",
    STREAK_AT_RISK: "Streak at Risk",
    STREAK_MILESTONE: "Streak Milestone",
    PRIORITY_TASK_PENDING: "Priority Task",
    ACHIEVEMENT_UNLOCKED: "Achievement",
    WEEKLY_SUMMARY: "Weekly Summary",
    TASK_REMINDER: "Reminder",
    CONSISTENCY_ALERT: "Consistency Alert",
    POINTS_MILESTONE: "Points Milestone",
    SYSTEM_UPDATE: "System Update",
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

export const shouldShowNotificationBadge = (unreadCount: number): boolean => {
  return unreadCount > 0;
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
  const delayCount = task.delayCount;
  const isMissed = isPast(task.dueDate);

  const status = task.status;
  if (status === "pending" && !isMissed) return 0;
  else if (status === "delayed" || (isMissed && status === "pending")) {
    return -2 * delayCount - 8;
  } else if (status === "completed" && task.completedAt) {
    return -2 * delayCount + 10;
  } else {
    throw new Error("Something went wrong with task points calculation");
  }
};

export const calculatePotentialTaskPoints = (task: Task) => {
  const isMissed = isPast(task.dueDate);

  if (task.status === "completed") {
    return 0;
  } else if (isMissed || task.status === "delayed") {
    return -2 * task.delayCount - 8;
  } else {
    return -2 * task.delayCount + 10;
  }
};

export function calculateTimeManagementStats(
  tasks: Task[]
): TimeManagementStats {
  let onTimeTasksCount = 0;
  let totalDelayDays = 0;
  let delayedAndCompletedCount = 0;
  let totalRelevantTasksForTiming = 0;

  tasks.forEach((task) => {
    // Only regular tasks that are completed are considered for on-time stats
    if (
      !task.isRepeating &&
      task.status === "completed" &&
      task.completedAt &&
      task.dueDate
    ) {
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
    } else if (
      !task.isRepeating &&
      isPast(task.dueDate) &&
      !isToday(task.dueDate) &&
      task.status === "pending"
    ) {
      // Consider missed non-repeating tasks as not on-time
      totalRelevantTasksForTiming++;
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

export function calculateConsistencyStats(tasks: Task[]): ConsistencyStats {
  const completedTasks = tasks.filter(
    (task) => task.status === "completed" && task.completedAt
  );

  if (!completedTasks || completedTasks.length === 0) {
    return { currentStreakDays: 0, bestStreakDays: 0 };
  }

  // Get unique days on which tasks were completed, sorted chronologically
  const completionDays = Array.from(
    new Set(
      completedTasks.map((task) =>
        formatISO(startOfDay(task.completedAt!), { representation: "date" })
      ) // 'yyyy-MM-dd'
    )
  ).sort(); // Sorts strings chronologically

  if (completionDays.length === 0) {
    return { currentStreakDays: 0, bestStreakDays: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;

  // Check if the last completion day is today or yesterday to start current streak
  if (completionDays.length > 0) {
    const lastCompletionDay = parseISO(
      completionDays[completionDays.length - 1]
    );
    const diffFromToday = differenceInCalendarDays(
      startOfDay(new Date()),
      lastCompletionDay
    );

    if (diffFromToday === 0 || diffFromToday === 1) {
      // Completed today or yesterday
      currentStreak = 1; // Start with 1 if last completion was recent enough

      for (let i = completionDays.length - 2; i >= 0; i--) {
        const prevDay = parseISO(completionDays[i]);
        const currentDayToCompare = parseISO(completionDays[i + 1]);
        if (differenceInCalendarDays(currentDayToCompare, prevDay) === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }
  }

  // Calculate best streak
  if (completionDays.length > 0) {
    let localCurrentStreak = 1;
    bestStreak = 1; // At least one day of completion
    for (let i = 1; i < completionDays.length; i++) {
      const day1 = parseISO(completionDays[i - 1]);
      const day2 = parseISO(completionDays[i]);
      if (differenceInCalendarDays(day2, day1) === 1) {
        localCurrentStreak++;
      } else {
        localCurrentStreak = 1; // Reset streak
      }
      if (localCurrentStreak > bestStreak) {
        bestStreak = localCurrentStreak;
      }
    }
  } else {
    bestStreak = 0;
  }

  // If no task completed today or yesterday, current streak is 0
  const lastCompletionDayObj =
    completionDays.length > 0
      ? parseISO(completionDays[completionDays.length - 1])
      : null;
  if (
    lastCompletionDayObj &&
    differenceInCalendarDays(startOfDay(new Date()), lastCompletionDayObj) > 1
  ) {
    currentStreak = 0;
  }

  return { currentStreakDays: currentStreak, bestStreakDays: bestStreak };
}

export function generateTaskTypes(allTasks: Task[]): TaskCategories {
  const now = new Date();
  const todayStart = startOfDay(now);

  const todaysTasks = allTasks.filter((task) => isToday(task.dueDate));

  //Delayed tasks also
  const upcomingTasks = allTasks.filter(
    (task) =>
      isFuture(task.dueDate) &&
      !isToday(task.dueDate) &&
      task.status !== "completed"
  );

  const missedTasks = allTasks.filter(
    (task) =>
      isPast(task.dueDate) &&
      !isToday(task.dueDate) &&
      task.status === "pending"
  );

  const delayedTasks = allTasks.filter(
    (task) =>
      (task.delayCount || 0) > 0 &&
      task.status === "delayed" &&
      isAfter(task.dueDate, todayStart)
  );
  const completedTasks = allTasks.filter((task) => task.status === "completed");
  const completedTodayTasks = allTasks.filter(
    (task) => isToday(task.dueDate) && task.status === "completed"
  );
  const pendingTodayTasks = allTasks.filter(
    (task) => isToday(task.dueDate) && task.status === "pending"
  );
  const pendingTasks = allTasks.filter((task) => task.status === "pending");

  return {
    todaysTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    completedTasks,
    completedTodayTasks,
    pendingTodayTasks,
    pendingTasks,
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
  const endTime =
    task.dueDate.getHours().toString().padStart(2, "0") +
    ":" +
    task.dueDate.getMinutes().toString().padStart(2, "0");
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

/*Repeating tasks */
/*Repeating tasks */
/*Repeating tasks */
export const MONDAY_START_OF_WEEK = { weekStartsOn: 1 } as const;
interface RepeatingTaskAvailability {
  canCompleteNow: boolean;
  sameWeek?: boolean;
  isDueToday: boolean;
}

export function canCompleteRepeatingTaskNow(
  task: Task
): RepeatingTaskAvailability {
  if (!task.isRepeating || !task.repetitionRule) {
    return { canCompleteNow: false, isDueToday: false };
  }
  const today = new Date();
  const rule = task.repetitionRule;
  if (today < rule.startDate)
    return { canCompleteNow: false, isDueToday: false };

  const completedToday =
    task.status === "completed" ||
    (task.completedAt && isToday(task.completedAt as Date));

  if (completedToday) {
    return { canCompleteNow: false, isDueToday: false };
  }

  const notCompletedToday = !completedToday;
  const sameWeek = isSameWeek(today, rule.startDate, MONDAY_START_OF_WEEK);

  // Check if task is scheduled for today first
  let isScheduledToday = false;

  if (rule.timesPerWeek) {
    isScheduledToday = sameWeek && rule.completions < rule.timesPerWeek;
  } else if (rule.daysOfWeek.length > 0) {
    const dayOfWeek = getDay(today) as DayOfWeek;
    isScheduledToday = sameWeek && rule.daysOfWeek.includes(dayOfWeek);
  } else if (rule.interval) {
    const daysSinceStart = differenceInDays(today, rule.startDate);
    if (daysSinceStart < 0) return { canCompleteNow: false, isDueToday: false };
    isScheduledToday = daysSinceStart % rule.interval === 0;
  }

  if (!isScheduledToday || !notCompletedToday) {
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
    const endTimeInMinutes =
      Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

    const isInTimeWindow =
      currentTimeInMinutes >= startTimeInMinutes &&
      currentTimeInMinutes <= endTimeInMinutes;

    return {
      canCompleteNow: isInTimeWindow,
      sameWeek,
      isDueToday: true,
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
