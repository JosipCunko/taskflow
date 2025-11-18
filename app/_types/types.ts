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
  autoDelay?: boolean; // Automatically delay task to next day if missed
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  experience?: "bad" | "okay" | "good" | "best";
  location?: string;
  dueDate: number;
  startDate?: number;
  startTime?: { hour: number; minute: number };
  completedAt?: number;
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
  completedAt: number[]; // UNIX timestamps in milliseconds
  completions: number;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  provider: string;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  rewardPoints: number;
  achievements: Achievement[];
  completedTasksCount: number;
  currentStreak: number;
  bestStreak: number;
  lastLoginAt?: number;
  nutritionGoals: UserNutritionGoals;
  youtubePreferences?: {
    enabled: boolean;
    createTasks: boolean;
    createNotifications: boolean;
  };
  // Anonymous user fields
  isAnonymous?: boolean;
  anonymousCreatedAt?: number;
  lastAutoDelayCheck?: number; // Timestamp of last auto-delay check
  receiveUpdateNotifications?: boolean; // Whether to show PWA update prompts
}
export interface UserNutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: number;
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
  createdAt: number;
  readAt?: number;
  data?: Record<string, unknown>; // Additional data for the notification
  expiresAt?: number;
}

// Stored as a subcollection under users/{userId}/achievements/{achievementId}
export interface Achievement {
  type: AchievementType;
  //id: string; // `task_completionist_${milestone}`
  id: string;
  userId: string;
  unlockedAt: number;
}

export interface AnalyticsData {
  sessionDuration: number;
  pageViews: number;
  activeTime: number;

  dailyTaskCompletions: number[];
  mostProductiveHour: number;

  pointsGrowth: number[];
  pagesVisited: Record<string, number>;

  // Performance insights
  consistencyScore: number;
  productivityScore: number;

  trends: {
    sessionDurationTrend: number;
    productivityTrend: number;
    consistencyTrend: number;
  };

  allAchievements: Achievement[];
  achievementsByType: Record<string, number>;
}

export interface SessionData {
  userId: string;
  sessionStart: number;
  // This calculates the entire timespan from the moment the app is opened to the moment it's closed. This includes any time the app was left idle or was running in a background tab.
  sessionEnd?: number;
  pageViews: number;
  // User is actively engaged with the app. It excludes the idle time.
  activeTime: number;
  pagesVisited: string[];
}

export interface TaskAnalytics {
  userId: string;
  taskId: string;
  action: TaskEventType;
  timestamp: number;
  dueDate: number;
  isPriority: boolean;
  isReminder: boolean;
  isRepeating: boolean;
  delayCount?: number;
  risk?: boolean;
  hour?: number; // hour of day when action occurred
  points: number;
}
export type TaskEventType =
  | "task_completed"
  | "task_created"
  | "task_deleted"
  | "task_delayed";

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
  timestamp: number;
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
  updatedAt: number;
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
  | "SYSTEM"
  | "YOUTUBE_SUMMARY";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ActionResult<T = null> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
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

export interface SavedMeal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  producer?: string;
  nutrientsPer100g: MealNutrition;
  ingredients: string[];
  createdAt: number;
  readyInMinutes?: number;
}

export interface LoggedMeal extends SavedMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servingSize: number;
  calculatedNutrients: MealNutrition;
  loggedAt: number;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  omega3?: number;
  omega6?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminA?: number;
}

export interface DailyNutritionSummary {
  date: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  loggedMeals: LoggedMeal[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface LoggedExercise {
  id: string;
  exerciseName: string;
  order?: number;
  volume: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name?: string;
  duration?: number;
  notes?: string;
  loggedExercises: LoggedExercise[];
  liked?: boolean;
  disliked?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string[];
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  exercises: string[]; // Exercise names
  createdAt: number;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: number;
}

export interface ExerciseProgressPoint {
  date: number;
  maxWeight: number;
  maxReps: number;
  sets: number;
}

export interface ExerciseProgress {
  exerciseName: string;
  maxWeight: number;
  totalVolume: number;
  lastPerformed: number;
  personalRecord: {
    weight: number;
    reps: number;
    date: number;
  };
}

export interface LastPerformance {
  weight: number;
  reps: number;
  sets: number;
  date: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: number;
  thumbnailUrl: string;
  duration?: string;
  viewCount?: string;
}

export interface YouTubeSummary {
  id: string;
  userId: string;
  videos: YouTubeVideo[];
  summary: string;
  createdAt: number;
  processedAt: number;
}

export interface FunctionResult {
  name: string;
  result: {
    success?: boolean;
    error?: string;
    message?: string;
    tasks?: Task[];
    notes?: Array<{
      id: string;
      title: string;
      content: string;
      updatedAt: string;
    }>;
    note?: {
      id: string;
      title: string;
      content: string;
    };
    task?: Task;
    count?: number;
    totalCount?: number;
    [key: string]: unknown;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  duration?: number;
  functionResults?: FunctionResult[];
}
