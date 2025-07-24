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
 * Track feature usage via API route
 * @param userId - User ID
 * @param feature - Feature name (e.g., 'tasks', 'notes', 'calendar')
 * @param duration - Optional duration in seconds
 */
export const trackFeatureUsage = async (
  userId: string,
  feature: string,
  duration?: number
) => {
  try {
    await fetch("/api/analytics/feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        feature,
        duration: duration || 0,
      }),
    });
  } catch (error) {
    console.error("Error tracking feature usage:", error);
  }
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

// Maybe combine AnalyticsData and SessionData
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
