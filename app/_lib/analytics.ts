"use client";
//Client side
import { logEvent, setUserProperties } from "firebase/analytics";
import { analytics } from "./firebase";
import {
  AchievementType,
  NotificationEventType,
  NotificationPriority,
  NotificationType,
  TaskEventType,
} from "../_types/types";

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
