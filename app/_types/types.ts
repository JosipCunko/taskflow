import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  delayCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  experience?: "bad" | "okay" | "good" | "best";
  location?: string;
  dueDate: Date; // Stored as Timestamp in Firestore, converted to Date in app
  startDate?: Date;
  startTime?: { hour: number; minute: number };
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
export interface RepetitionRule {
  interval?: number;
  daysOfWeek: DayOfWeek[];
  timesPerWeek?: number;
  completedAt: Date[];
  completions: number;
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
  gainedPoints: number[]; // max length 7
  //Removed todayPoints
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

// In the user document under achievements array
// Since they aren't stored in a seperate collection, firebase doesnt need an id
export interface Achievement {
  type: AchievementType;
  id: string; // `task_completionist_${milestone}`
  userId: string;
  unlockedAt: Date;
}

export interface AnalyticsData {
  // App usage analytics
  sessionDuration: number;
  pageViews: number;
  activeTime: number;

  // Task analytics
  dailyTaskCompletions: number[];
  weeklyTaskTrends: number[];
  averageCompletionTime: number;
  mostProductiveHour: number;

  // User behavior
  pointsGrowth: number[];
  featureUsage: Record<string, number>;

  // Performance insights
  completionRateHistory: number[];
  consistencyScore: number;
  productivityScore: number;

  // Achievement analytics
  recentAchievements: Achievement[];
  achievementsByType: Record<string, number>;
}

export interface SessionData {
  userId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  pageViews: number;
  activeTime: number; // in seconds
  pagesVisited: string[];
}

export interface TaskAnalytics {
  userId: string;
  taskId: string;
  action: TaskEventType;
  timestamp: Date;
  completionTime?: number; // seconds from creation to completion
  dueDate: Date;
  isPriority: boolean;
  isRepeating: boolean;
  delayCount?: number;
  hour: number; // hour of day when action occurred
}
export type TaskEventType =
  | "task_completed"
  | "task_created"
  | "task_deleted"
  | "task_delayed";

export interface UserBehaviorData {
  userId: string;
  featureUsed: string;
  duration: number; // time spent in seconds
  timestamp: Date;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
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

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: Date;
}

export type AchievementType =
  | "streak_milestone"
  | "points_milestone"
  | "task_completionist";

export type NotificationType =
  | "TASK_OVERDUE"
  | "TASK_DUE_SOON"
  | "WEEKLY_SUMMARY"
  | "ACHIEVEMENT_UNLOCKED"
  | "SYSTEM";
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

export interface CampaignNotification {
  title: string;
  message: string;
  actionUrl: string;
  type: NotificationType;
  priority: NotificationPriority;
}
