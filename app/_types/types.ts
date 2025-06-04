import { LucideIcon, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean; // 'focus' tag could set this
  isReminder: boolean;
  delayCount: number;
  tags?: string[]; // For user-defined tags like 'morning routine', 'gym'
  createdAt: Date; // Stored as Timestamp in Firestore
  updatedAt: Date; // Stored as Timestamp in Firestore
  experience?: "bad" | "okay" | "good" | "best";

  dueDate: Date; // Stored as Timestamp in Firestore, converted to Date in app
  completedAt?: Date;
  status: "pending" | "completed" | "delayed";

  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  duration?: {
    minutes: number;
    hours: number;
    days: number;
  };
}
export type RepetitionFrequency = "daily" | "weekly" | "monthly";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** daily, weekly or monhtly
 * interval: every x days
 * daysOfWekk: [1,2] Monday, Tuesday
 * timesPerWeek: 3
 * startDate: often begining of the week
 * completions: only for weekly and monthly
 */
export interface RepetitionRule {
  frequency: RepetitionFrequency;
  interval?: number; // every 'interval' days/weeks/months
  daysOfWeek: DayOfWeek[];
  timesPerWeek?: number; // For "weekly" if it's like "3 times a week, any day"

  lastInstanceCompletedDate?: Date;
  startDate: Date;
  completions: number; // 0 or 1 for daily tasks
}

export type EmojiOption = {
  id: "bad" | "okay" | "good" | "best";
  emoji: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  selected?: boolean;
};

export interface SearchedTask {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
}
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
export interface TaskIconItem {
  name: string;
  icon: LucideIcon;
}

export interface TimeManagementStats {
  onTimeTasksCount: number;
  totalRelevantTasksForTiming: number; // Completed or missed tasks that had a due date
  averageDelayDays: number; // For tasks that were completed but after their original due date
  onTimeCompletionRate: number;
}

export interface ConsistencyStats {
  currentStreakDays: number;
  bestStreakDays: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: Date;
  type:
    | "TASK_COMPLETED"
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "EXPERIENCE_RATED"
    | "TASK_DELAYED"
    | "TASK_MISSED"
    | "TASK_DELETED";
  taskId?: string;
  taskSnapshot?: Partial<Task>;
  details?: string;
  activityIcon?: keyof typeof import("lucide-react");
  activityColor?: string;
}

export interface userProfileType {
  displayName: string;
  email: string;
  photoURL: string;
  memberSince: Date;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ActionError extends Error {
  message: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: Date;
}
