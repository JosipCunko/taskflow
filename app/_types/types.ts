import { LucideProps } from "lucide-react";
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
  startTime?: { hour: number; minute: number }; // NEW: Time of day for the task
  completedAt?: Date;
  /**Delayed is pending but rescheduled */
  status: "pending" | "completed" | "delayed";

  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  duration?: {
    hours: number;
    minutes: number;
  };
  risk?: boolean;
  points: number;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date;
  provider: string;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  rewardPoints: number;
  achievements: Achievement[];
  completedTasksCount: number;
  currentStreak: number;
  bestStreak: number;
  lastLoginAt?: Date;
  notesCount?: number; // Added field in /webapp/profile
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface RepetitionRule {
  interval?: number;
  daysOfWeek: DayOfWeek[];
  timesPerWeek?: number;
  completedAt: Date[];
  startDate: Date;
  completions: number;
}

export type TaskToCreateData = Omit<
  Task,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "points"
  | "status"
  | "delayCount"
  | "completedAt"
>;
export type TaskToUpdateData = Partial<
  Omit<Task, "id" | "userId" | "createdAt" | "points" | "updatedAt">
>;
export interface SearchedTask {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export type EmojiOption = {
  id: "bad" | "okay" | "good" | "best";
  emoji: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  selected?: boolean;
};

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: Date;
  type:
    | "TASK_COMPLETED"
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_DELAYED"
    | "TASK_MISSED"
    | "TASK_DELETED";
  taskId: string;
  taskSnapshot: Partial<Task>;
  activityIcon: keyof typeof import("lucide-react");
  activityColor: string;
}

export interface Achievement {
  type: AchievementType;
  id: string;
  userId: string;
  unlockedAt: Date;
}
export type AchievementType =
  | "streak_milestone"
  | "points_milestone"
  | "task_completionist";

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  taskId?: string; // Related task ID if applicable
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  readAt?: Date;
  data?: Record<string, unknown>; // Additional data for the notification
  expiresAt?: Date;
}
export type NotificationType =
  | "TASK_OVERDUE"
  | "TASK_DUE_SOON"
  | "WEEKLY_SUMMARY"
  | "ACHIEVEMENT_UNLOCKED"
  | "POINTS_MILESTONE"
  | "SYSTEM_UPDATE";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}
export interface ActionError extends Error {
  message: string;
}

export interface NotificationStats {
  totalUnread: number;
  unreadByPriority: {
    [K in NotificationPriority]: number;
  };
  unreadByType: {
    [K in NotificationType]?: number;
  };
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
