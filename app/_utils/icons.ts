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
  Calendar,
  Bell,
  Star,
  Meh,
  Smile,
  Frown,
  Trash2,
  Tag,
  CheckCircle2,
  Clock,
  ClipboardList,
  LucideIcon,
  Zap,
  CalendarClock,
  CalendarPlus,
  ZapOff,
  BellPlus,
  BookOpen,
  Code,
  Gamepad2,
  Phone,
  BicepsFlexed,
  CircleCheckBig,
  CircleX,
  Trophy,
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
  SquarePen,
  Info,
  Play,
  TrendingUp,
  ClockAlert,
  ClockFading,
  Ellipsis,
  Clock7,
  MapPin,
  MapPinOff,
  Ham,
  Wheat,
  BatteryFull,
} from "lucide-react";
import { NotificationType } from "../_types/types";

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
  Time: Clock7,
  StatusPending: Clock,
  StatusCompleted: CheckCircle2,
  StatusDelayed: ClockAlert,
  StatusMissed: ClockFading,
  Tag: Tag,
  Points: Star,
  ExperienceGood: Smile,
  ExperienceOkay: Meh,
  ExperienceBad: Frown,
  ExperienceBest: BicepsFlexed,
  Options: Ellipsis,
  Edit: SquarePen,
  Delete: Trash2,
  MarkComplete: CheckCircle2,
  DelayTomorrow: CalendarClock,
  DelayNextWeek: CalendarClock,
  Reschedule: CalendarPlus,
  AddPriority: Zap,
  AddReminder: BellPlus,
  RemovePriority: ZapOff,
  SetReminder: BellPlus,
  RemoveReminder: BellOff,
  Location: MapPin,
  ResetLocation: MapPinOff,
  User: User,
};

export const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    TASK_OVERDUE: Clock,
    TASK_DUE_SOON: Calendar,
    ACHIEVEMENT_UNLOCKED: Trophy,
    WEEKLY_SUMMARY: TrendingUp,
    POINTS_MILESTONE: Trophy,
    SYSTEM: Info,
    YOUTUBE_SUMMARY: Play,
  };

  return iconMap[type] || Bell;
};

export const FoodIcons = {
  Calories: BatteryFull,
  Protein: Ham,
  Carbs: Wheat,
  Fat: Hamburger,
};
