import { logEvent, setUserProperties } from "firebase/analytics";
import { analytics } from "./firebase";
import {
  AchievementType,
  NotificationPriority,
  NotificationType,
} from "../_types/types";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

export type TaskEventType =
  | "task_completed"
  | "task_created"
  | "task_deleted"
  | "task_delayed";

export type NotificationEventType =
  | "notification_clicked"
  | "notification_dismissed"
  | "notification_created";

// Analytics data interfaces
export interface AnalyticsData {
  // App usage analytics
  sessionDuration: number;
  pageViews: number;
  activeTime: number;

  // Task analytics
  dailyTaskCompletions: number[];
  weeklyTaskTrends: number[];
  mostProductiveHour: number;
  averageCompletionTime: number;

  // User behavior
  streakHistory: number[];
  pointsGrowth: number[];
  featureUsage: Record<string, number>;

  // Performance insights
  completionRateHistory: number[];
  consistencyScore: number;
  productivityScore: number;
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
  action: 'created' | 'completed' | 'delayed' | 'deleted';
  timestamp: Date;
  completionTime?: number; // seconds from creation to completion
  dueDate: Date;
  isPriority: boolean;
  isRepeating: boolean;
  delayCount?: number;
  hour: number; // hour of day when action occurred
}

export interface UserBehaviorData {
  userId: string;
  date: Date;
  featureUsed: string;
  duration: number; // time spent in seconds
  timestamp: Date;
}

export const trackTaskEvent = (
  eventType: TaskEventType,
  properties: {
    isRepeating: boolean;
    isPriority: boolean;
    completionTime: number;
    delayCount: number;
    createdAt: Date;
    completedAt: Date;
    dueDate: Date;
  }
) => {
  if (!analytics) return;

  logEvent(analytics, eventType, {
    ...properties,
    timestamp: Date.now(),
  });
};

export const trackAchievementUnlocked = (
  achievementType: AchievementType,
  value: number
) => {
  if (!analytics) return;

  logEvent(analytics, "achievement_unlocked", {
    achievement_type: achievementType,
    value,
    timestamp: Date.now(),
  });
};

export const trackNotificationEvent = (
  eventType: NotificationEventType,
  properties?: {
    notification_type?: NotificationType;
    priority?: NotificationPriority;
    action_taken?: "clicked" | "dismissed" | "completed_from_notification";
  }
) => {
  if (!analytics) return;

  logEvent(analytics, eventType, {
    ...properties,
    timestamp: Date.now(),
  });
};

export const trackUserEngagement = (
  engagementTimeMsec: number,
  pageTitle?: string
) => {
  if (!analytics) return;

  logEvent(analytics, "user_engagement", {
    engagementTimeMsec,
    pageTitle,
  });
};
export const trackPageView = (page_title: string, page_location?: string) => {
  if (!analytics) return;

  logEvent(analytics, "page_view", {
    page_title,
    page_location: page_location || window.location.pathname,
  });
};

export const trackAppOpen = () => {
  if (!analytics) return;

  logEvent(analytics, "app_open", {
    timestamp: Date.now(),
  });
};

export const setUserAnalyticsProperties = (properties: {
  currentStreak?: number;
  totalTasksCompleted?: number;
  rewardPoints?: number;
  notifyReminders?: boolean;
  notifyAchievements?: boolean;
  notificationsEnabled?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
}) => {
  if (!analytics) return;

  setUserProperties(analytics, properties);
};

// NEW: Comprehensive Analytics Data Collection Functions
// These functions store detailed analytics data in Firestore for dashboard retrieval

export const startUserSession = async (userId: string, pageTitle: string) => {
  try {
    const sessionData: SessionData = {
      userId,
      sessionStart: new Date(),
      pageViews: 1,
      activeTime: 0,
      pagesVisited: [pageTitle],
    };

    const sessionRef = adminDb.collection('userSessions').doc();
    await sessionRef.set(sessionData);
    
    // Store session ID in localStorage for tracking
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSessionId', sessionRef.id);
    }

    // Also track in Firebase Analytics
    trackAppOpen();
    trackPageView(pageTitle);
    
    return sessionRef.id;
  } catch (error) {
    console.error('Error starting user session:', error);
  }
};

export const updateUserSession = async (pageTitle: string, timeSpent: number) => {
  try {
    if (typeof window === 'undefined') return;
    
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) return;

    const sessionRef = adminDb.collection('userSessions').doc(sessionId);
    await sessionRef.update({
      pageViews: FieldValue.increment(1),
      activeTime: FieldValue.increment(timeSpent),
      pagesVisited: FieldValue.arrayUnion(pageTitle),
    });

    trackPageView(pageTitle);
    trackUserEngagement(timeSpent * 1000, pageTitle);
  } catch (error) {
    console.error('Error updating user session:', error);
  }
};

export const endUserSession = async () => {
  try {
    if (typeof window === 'undefined') return;
    
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) return;

    const sessionRef = adminDb.collection('userSessions').doc(sessionId);
    await sessionRef.update({
      sessionEnd: new Date(),
    });

    localStorage.removeItem('currentSessionId');
  } catch (error) {
    console.error('Error ending user session:', error);
  }
};

export const trackTaskAnalytics = async (
  userId: string,
  taskId: string,
  action: 'created' | 'completed' | 'delayed' | 'deleted',
  taskData: {
    dueDate: Date;
    isPriority: boolean;
    isRepeating: boolean;
    createdAt?: Date;
    completedAt?: Date;
    delayCount?: number;
  }
) => {
  try {
    const now = new Date();
    const completionTime = taskData.createdAt && taskData.completedAt 
      ? Math.floor((taskData.completedAt.getTime() - taskData.createdAt.getTime()) / 1000)
      : undefined;

    const analyticsData: TaskAnalytics = {
      userId,
      taskId,
      action,
      timestamp: now,
      completionTime,
      dueDate: taskData.dueDate,
      isPriority: taskData.isPriority,
      isRepeating: taskData.isRepeating,
      delayCount: taskData.delayCount,
      hour: now.getHours(),
    };

    await adminDb.collection('taskAnalytics').add(analyticsData);

    // Also track in Firebase Analytics
    trackTaskEvent(
      `task_${action}` as TaskEventType,
      {
        isRepeating: taskData.isRepeating,
        isPriority: taskData.isPriority,
        completionTime: completionTime || 0,
        delayCount: taskData.delayCount || 0,
        createdAt: taskData.createdAt || now,
        completedAt: taskData.completedAt || now,
        dueDate: taskData.dueDate,
      }
    );
  } catch (error) {
    console.error('Error tracking task analytics:', error);
  }
};

// Track which app features users engage with
export const trackFeatureUsage = async (
  userId: string,
  feature: string,
  duration: number = 0
) => {
  try {
    const behaviorData: UserBehaviorData = {
      userId,
      date: new Date(),
      featureUsed: feature,
      duration,
      timestamp: new Date(),
    };

    await adminDb.collection('userBehavior').add(behaviorData);
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
};

// Track when achievements are unlocked
export const trackAchievementAnalytics = async (
  userId: string,
  achievementType: AchievementType,
  value: number
) => {
  try {
    await adminDb.collection('achievementAnalytics').add({
      userId,
      achievementType,
      value,
      timestamp: new Date(),
    });

    // Also track in Firebase Analytics
    trackAchievementUnlocked(achievementType, value);
  } catch (error) {
    console.error('Error tracking achievement analytics:', error);
  }
};
