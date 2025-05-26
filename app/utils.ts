import {
  Sunrise,
  AlarmClock,
  Dumbbell,
  Timer,
  Activity,
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
  BellRing,
  BookOpen,
  Code,
  Gamepad2,
  Phone,
  Award,
  BicepsFlexed,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ConsistencyStats,
  EmojiOption,
  Task,
  TimeManagementStats,
} from "./_types/types";
import {
  differenceInCalendarDays,
  differenceInDays,
  formatISO,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from "date-fns";
import { isFuture } from "date-fns";
import { isAfter } from "date-fns";
import { isPast } from "date-fns";
import { isToday } from "date-fns";

/** Possible task icons to set in the IconPicker*/
export const TASK_ICONS = [
  {
    id: "user",
    icon: User,
    label: "User",
  },
  {
    id: "Activity",
    icon: Activity,
    label: "Activity",
  },
  {
    id: "AlarmClock",
    icon: AlarmClock,
    label: "Alarm Clock",
  },
  {
    id: "Apple",
    icon: Apple,
    label: "Apple",
  },
  {
    id: "Award",
    icon: Award,
    label: "Award",
  },
  {
    id: "dumbbell",
    icon: Dumbbell,
    label: "Dumbbell",
  },
  {
    id: "timer",
    icon: Timer,
    label: "Timer",
  },
  {
    id: "BellRing",
    icon: BellRing,
    label: "BellRing",
  },
  {
    id: "heart",
    icon: Heart,
    label: "Heart",
  },

  {
    id: "home",
    icon: Home,
    label: "Home",
  },
  {
    id: "BookOpen",
    icon: BookOpen,
    label: "Book",
  },
  {
    id: "Briefcase",
    icon: Briefcase,
    label: "Briefcase",
  },
  {
    id: "Star",
    icon: Star,
    label: "Star",
  },
  {
    id: "Smile",
    icon: Smile,
    label: "Smile",
  },
  {
    id: "laptop",
    icon: Laptop,
    label: "Laptop",
  },
  {
    id: "file-text",
    icon: FileText,
    label: "File",
  },
  {
    id: "Phone",
    icon: Phone,
    label: "Phone",
  },
  {
    id: "Code",
    icon: Code,
    label: "Code",
  },
  {
    id: "shopping-cart",
    icon: ShoppingCart,
    label: "Shopping Cart",
  },
  {
    id: "Gamepad",
    icon: Gamepad2,
    label: "Gamepad",
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

/**App features showcased in the landing page */
export const FEATURES = [
  {
    icon: Timer,
    label: "Organization",
    description:
      "Organize your life, dont miss on any events and tasks in your life",
  },
  {
    icon: Activity,
    label: "Management",
    description: "Manage all upcoming and completed tasks",
  },
  {
    icon: Heart,
    label: "Priority",
    description:
      "Prioritize your tasks so the most important ones get done as soon as possible with the most energy",
  },
  {
    icon: Sunrise,
    label: "Seize the day",
    description:
      "Get up early so you can complete all of your tasks for the day",
  },
  {
    icon: AlarmClock,
    label: "Alarm Clock",
    description: "Set up reminders for each task",
  },
  {
    id: "dumbbell",
    icon: Dumbbell,
    label: "Dumbbell",
    description: "Improve yourself with discipline and dedication",
  },
];

/* Color picker */
export const colorsColorPicker = [
  "#86efac",
  "#bae6fd",
  "#0e7490",
  "#a3e635",
  "#14b8a6",
  "#fbbf24",
  "#10b981",
  "#22d3ee",
  "#4d7c0f",
  "#d97706",
  "#4f46e5",
  "#f87171",
  "#3b82f6",
  "#d946ef",
  "#fb923c",
  "#78716c",
  "#334155",
  "#b91c1c",
  "#94a3b8",
  "#ea580c",
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
    icon: Calendar,
    label: "Calendar",
    command: ["Ctrl", "U"],
    link: "/webapp/calendar",
  },
];

/* Date functions */
export function getPhaseOfTheDay() {
  const date = new Date();
  const hours = date.getHours();
  if (hours >= 6 && hours < 14) return "morning";
  if (hours >= 14 && hours < 18) return "afternoon";
  if (hours >= 18 && hours < 22) return "evening";
  if (hours >= 22 || (hours >= 0 && hours < 6)) return "night";
}

export const formatDate = (
  date: Date | string | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString(
      undefined,
      options || {
        month: "short",
        day: "numeric",
        year: "numeric",
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

/* Task Card */

export interface TaskIconItem {
  name: string;
  icon: LucideIcon;
}

/*Actually, label === icon, but I will leave it only for ClipboardList*/
export const getTaskIconByName = (name: string | undefined): LucideIcon => {
  if (!name) return ClipboardList;
  const found =
    TASK_ICONS.find(
      (item) => item.icon.displayName?.toLowerCase() === name.toLowerCase()
    ) ||
    ACTIVITY_ICONS.find(
      (item) => item.icon.displayName?.toLowerCase() === name.toLowerCase()
    );

  return found ? found.icon : ClipboardList;
};

export const CardSpecificIcons = {
  DueDate: Calendar,
  Priority: Zap,
  Reminder: Bell,
  StatusPending: Clock,
  StatusCompleted: CheckCircle2,
  StatusDelayed: XCircle,
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
};

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

interface ToastState {
  success: boolean;
  message?: string;
  error?: string;
}

export const handleToast = (state: ToastState, handler: () => void) => {
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

/**Phone number validation */
export const phoneNumberRegex =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// if (!phoneNumberRegex.test(phoneNumber)) {
//   errorToast("Please enter a valid phone number.");
// }

export const sampleTasks: Task[] = [
  {
    id: "2",
    userId: "user123",
    title: "Grocery Shopping for the Week",
    description:
      "Buy fruits, vegetables, milk, and other essentials for the week. Check pantry for stock.",
    icon: "ShoppingCart",
    color: "#10B981", // Green
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() + 86400000 * 2), // In 2 days
    status: "pending",
    delayCount: 0,
    tags: ["home", "essentials"],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },

  {
    id: "4",
    userId: "user123",
    title: "Submit Monthly Expense Report",
    description:
      "Compile all receipts and submit the expense report for last month through the company portal.",
    icon: "ClipboardList",
    color: "#F59E0B", // Amber
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() - 86400000 * 10), // Due 10 days ago
    status: "completed",
    delayCount: 0,
    tags: ["finance", "report"],
    createdAt: new Date(Date.now() - 86400000 * 40),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    completedAt: new Date(Date.now() - 86400000 * 9),
    experience: "good",
  },
];

export const emojiOptions: EmojiOption[] = [
  { id: "bad", emoji: Frown, label: "Bad", selected: false },
  { id: "okay", emoji: Meh, label: "Okay", selected: false },
  { id: "good", emoji: Smile, label: "Good", selected: false },
  { id: "best", emoji: BicepsFlexed, label: "Best", selected: false },
];

export interface TaskCategories {
  todaysTasks: Task[];
  upcomingTasks: Task[];
  missedTasks: Task[];
  delayedTasks: Task[];
  completedTasks: Task[];
  completedTodayTasks: Task[];
  pendingTodayTasks: Task[];
  pendingTasks: Task[];
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

export const calculateTaskPoints = (task: Task) => {
  const delayCount = task.delayCount || 0;
  if (task.status === "completed") {
    return -2 * delayCount + 10;
  } else {
    return -2 * delayCount - 8;
  }
};

export function calculateTimeManagementStats(
  tasks: Task[]
): TimeManagementStats {
  let onTimeTasksCount = 0;
  let totalDelayDays = 0;
  let delayedAndCompletedCount = 0;
  let totalRelevantTasksForTiming = 0;

  const now = new Date();

  tasks.forEach((task) => {
    if (task.status === "completed" && task.completedAt && task.dueDate) {
      totalRelevantTasksForTiming++;
      const dueDateStart = startOfDay(task.dueDate);
      const completedAtStart = startOfDay(task.completedAt);

      // Completed on or before the due date
      if (
        isBefore(completedAtStart, dueDateStart) ||
        isEqual(completedAtStart, dueDateStart)
      ) {
        onTimeTasksCount++;
      } else {
        // Completed after due date
        //Needs to be original due
        const effectiveDueDate = task.dueDate
          ? startOfDay(task.dueDate)
          : dueDateStart;
        const delay = differenceInDays(completedAtStart, effectiveDueDate);
        if (delay > 0) {
          totalDelayDays += delay;
          delayedAndCompletedCount++;
        }
      }
    } else if (
      (isPast(task.dueDate) ||
        (task.status === "pending" &&
          isBefore(startOfDay(task.dueDate), startOfDay(now)))) &&
      task.dueDate
    ) {
      // Consider missed tasks as not on-time
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

export function calculateConsistencyStats(
  completedTasks: Task[]
): ConsistencyStats {
  if (!completedTasks || completedTasks.length === 0) {
    return { currentStreakDays: 0, bestStreakDays: 0 };
  }

  // Get unique days on which tasks were completed, sorted chronologically
  const completionDays = Array.from(
    new Set(
      completedTasks
        .filter((task) => task.completedAt) // Ensure completedAt exists
        .map((task) =>
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
