import {
  Coffee,
  Sunrise,
  AlarmClock,
  Droplets,
  Dumbbell,
  Timer,
  Activity,
  Heart,
  User,
  Home,
  Apple,
  Stethoscope,
  Pill,
  Briefcase,
  Laptop,
  FileText,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Receipt,
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
} from "lucide-react";
import toast from "react-hot-toast";
import { Task } from "./_types/types";

/** Possible task icons to set in the IconPicker*/
export const TASK_ICONS = [
  {
    id: "user",
    type: "personal",
    icon: User,
    label: "User",
  },
  {
    id: "coffee",
    type: "morning routine",
    icon: Coffee,
    label: "Coffee",
  },
  {
    id: "sunrise",
    type: "morning routine",
    icon: Sunrise,
    label: "Sunrise",
  },
  {
    id: "alarm-clock",
    type: "morning routine",
    icon: AlarmClock,
    label: "Alarm Clock",
  },
  {
    id: "droplets",
    type: "morning routine",
    icon: Droplets,
    label: "Water/Shower",
  },
  {
    id: "dumbbell",
    type: "gym",
    icon: Dumbbell,
    label: "Dumbbell",
  },
  {
    id: "timer",
    type: "gym",
    icon: Timer,
    label: "Timer",
  },
  {
    id: "activity",
    type: "gym",
    icon: Activity,
    label: "Activity",
  },
  {
    id: "heart",
    type: "personal",
    icon: Heart,
    label: "Heart",
  },

  {
    id: "home",
    type: "personal",
    icon: Home,
    label: "Home",
  },
  {
    id: "apple",
    type: "health",
    icon: Apple,
    label: "Apple",
  },
  {
    id: "stethoscope",
    type: "health",
    icon: Stethoscope,
    label: "Stethoscope",
  },
  {
    id: "pill",
    type: "health",
    icon: Pill,
    label: "Pill",
  },
  {
    id: "briefcase",
    type: "work",
    icon: Briefcase,
    label: "Briefcase",
  },
  {
    id: "laptop",
    type: "work",
    icon: Laptop,
    label: "Laptop",
  },
  {
    id: "file-text",
    type: "work",
    icon: FileText,
    label: "File",
  },
  {
    id: "credit-card",
    type: "expense",
    icon: CreditCard,
    label: "Credit Card",
  },
  {
    id: "dollar-sign",
    type: "expense",
    icon: DollarSign,
    label: "Dollar",
  },
  {
    id: "shopping-cart",
    type: "expense",
    icon: ShoppingCart,
    label: "Shopping Cart",
  },
  {
    id: "receipt",
    type: "expense",
    icon: Receipt,
    label: "Receipt",
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
    icon: Dumbbell,
    label: "Dumbbell",
    description: "Improve yourself with discipline and dedication",
  },
];

/* Color picker */
export const colorsColorPicker = [
  "#3b82f6",
  "#64748b",
  "#f97316",
  "#ef4444",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#4c0519",
  "#1e1b4b",
  "#042f2e",
  "#0c0a09",
  "#fecaca",
  "#e2e8f0",
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
];

/** Search feature */
export const navItemsToSearch = [
  {
    icon: Home,
    label: "Dashboard",
    command: ["Ctrl", "H"],
    link: "/",
  },
  {
    icon: Inbox,
    label: "Inbox",
    command: ["Ctrl", "I"],
    link: "/inbox",
  },
  {
    icon: ChartColumn,
    label: "Tasks",
    command: ["Ctrl", "F"],
    link: "/tasks",
  },
  {
    icon: Calendar,
    label: "Calendar",
    command: ["Ctrl", "U"],
    link: "/calendar",
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
  const found = TASK_ICONS.find(
    (item) => item.icon.displayName.toLowerCase() === name.toLowerCase()
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

// { success: boolean; message?: string; error?: string }
export const handleToast = (state: any, handler: () => void) => {
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
    type: "Personal",
    icon: "ShoppingCart",
    color: "#10B981", // Green
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() + 86400000 * 2), // In 2 days
    status: "pending",
    delayCount: 0,
    points: 5,
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
    type: "Admin",
    icon: "ClipboardList",
    color: "#F59E0B", // Amber
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() - 86400000 * 10), // Due 10 days ago
    status: "completed",
    delayCount: 0,
    points: 3,
    tags: ["finance", "report"],
    createdAt: new Date(Date.now() - 86400000 * 40),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    completedAt: new Date(Date.now() - 86400000 * 9),
    experience: "good",
  },
];
