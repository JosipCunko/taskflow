"use client";
//Needs to be client side
import { logEvent, setUserProperties } from "firebase/analytics";
import { analytics } from "./firebase";
import { TaskEventType, TaskAnalytics } from "../_types/types";

/** Logs "task_completed" | "task_created" | "task_deleted" | "task_delayed" event to Firebase Analytics with a whole data */
export const trackTaskEvent = (
  eventType: TaskEventType,
  data: TaskAnalytics
) => {
  if (!analytics) return;
  logEvent(analytics, eventType, data);
};

/** 
 - Logs achievement_unlocked event to Firebase Analytics with an achievementId and unlockedAt
 - Firebase Analytics automatically associates events with the current user session, so userId attached to the log is unnecessary**
 */
export const trackAchievementUnlocked = (achievementId: string) => {
  if (!analytics) return;

  logEvent(analytics, "achievement_unlocked", {
    achievementId,
    unlockedAt: new Date(),
  });
};

// It was part of the previous analytics setup. Its functionality has been replaced by the more robust session tracking system we just implemented, which now correctly calculates active time on the server.
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

// Removed from AnalyticsTracker as part of the new session tracking implementation to avoid duplicate page view events.
export const trackPageView = (pageTitle: string, pagePath?: string) => {
  if (!analytics) return;

  logEvent(analytics, "page_view", {
    pageTitle,
    pagePath: pagePath || window.location.pathname,
  });
};

export const trackAppOpen = () => {
  if (!analytics) return;

  logEvent(analytics, "app_open", {
    timestamp: Date.now(),
  });
};

// Enhanced setUserProperties combining AnalyticsData, SessionData, and user data
export const setUserAnalyticsProperties = (properties: {
  // User profile data
  currentStreak?: number;
  totalTasksCompleted?: number;
  rewardPoints?: number;
  notifyReminders?: boolean;
  notifyAchievements?: boolean;
  notificationsEnabled?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  
  // Analytics data
  sessionDuration?: number;
  pageViews?: number;
  activeTime?: number;
  productivityScore?: number;
  consistencyScore?: number;
  averageCompletionTime?: number;
  
  // Session data
  totalSessions?: number;
  averageSessionDuration?: number;
  
  // Trends
  sessionDurationTrend?: number;
  productivityTrend?: number;
  consistencyTrend?: number;
  
  // Feature usage (top 3 most used features)
  topFeatures?: string[];
  
  // Achievement data
  totalAchievements?: number;
  recentAchievementCount?: number;
}) => {
  if (!analytics) return;

  // Convert Date objects to timestamps for Firebase Analytics
  const processedProperties = {
    ...properties,
    lastLoginAt: properties.lastLoginAt?.getTime(),
    createdAt: properties.createdAt?.getTime(),
  };

  setUserProperties(analytics, processedProperties);
};

// Helper function to combine user data and analytics data for Firebase Analytics
export const updateUserPropertiesFromData = (
  userData: {
    currentStreak?: number;
    completedTasksCount?: number;
    rewardPoints?: number;
    notifyReminders?: boolean;
    notifyAchievements?: boolean;
    createdAt?: Date;
    achievements?: any[];
  },
  analyticsData?: {
    sessionDuration?: number;
    pageViews?: number;
    activeTime?: number;
    productivityScore?: number;
    consistencyScore?: number;
    averageCompletionTime?: number;
    featureUsage?: Record<string, number>;
    trends?: {
      sessionDurationTrend?: number;
      productivityTrend?: number;
      consistencyTrend?: number;
    };
    recentAchievements?: any[];
  },
  sessionCount?: number
) => {
  // Get top 3 most used features
  const topFeatures = analyticsData?.featureUsage
    ? Object.entries(analyticsData.featureUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([feature]) => feature)
    : [];

  setUserAnalyticsProperties({
    // User profile data
    currentStreak: userData.currentStreak,
    totalTasksCompleted: userData.completedTasksCount,
    rewardPoints: userData.rewardPoints,
    notifyReminders: userData.notifyReminders,
    notifyAchievements: userData.notifyAchievements,
    createdAt: userData.createdAt,
    
    // Analytics data
    sessionDuration: analyticsData?.sessionDuration,
    pageViews: analyticsData?.pageViews,
    activeTime: analyticsData?.activeTime,
    productivityScore: analyticsData?.productivityScore,
    consistencyScore: analyticsData?.consistencyScore,
    averageCompletionTime: analyticsData?.averageCompletionTime,
    
    // Session data
    totalSessions: sessionCount,
    averageSessionDuration: analyticsData?.sessionDuration,
    
    // Trends
    sessionDurationTrend: analyticsData?.trends?.sessionDurationTrend,
    productivityTrend: analyticsData?.trends?.productivityTrend,
    consistencyTrend: analyticsData?.trends?.consistencyTrend,
    
    // Feature usage
    topFeatures,
    
    // Achievement data
    totalAchievements: userData.achievements?.length || 0,
    recentAchievementCount: analyticsData?.recentAchievements?.length || 0,
  });
};
