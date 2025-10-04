"use client";
//Needs to be client side
import { logEvent, setUserProperties } from "firebase/analytics";
import { analytics } from "./firebase";
import {
  TaskEventType,
  TaskAnalytics,
  Achievement,
  AnalyticsData,
} from "../_types/types";

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

/**Logs app_open event to Firebase Analytics with a timestamp */
export const trackAppOpen = () => {
  if (!analytics) return;

  logEvent(analytics, "app_open", {
    timestamp: Date.now(),
  });
};

export const setUserAnalyticsProperties = (
  userData: {
    currentStreak: number;
    bestStreak: number;
    completedTasksCount: number;
    rewardPoints: number;
    createdAt: Date;
    lastLoginAt?: Date;
    achievements: Achievement[];
  },
  analyticsData?: AnalyticsData,
  sessionsCount?: number
) => {
  if (!analytics) return;

  const properties = {
    currentStreak: userData.currentStreak,
    bestStreak: userData.bestStreak,
    completedTasksCount: userData.completedTasksCount,
    rewardPoints: userData.rewardPoints,
    createdAt: userData.createdAt,
    lastLoginAt: userData.lastLoginAt,
    achievements: userData.achievements,
    ...analyticsData,
    sessionsCount,
  };

  const processedProperties = {
    ...properties,
    lastLoginAt: properties.lastLoginAt?.getTime
      ? properties.lastLoginAt.getTime()
      : properties.lastLoginAt,
    createdAt: properties.createdAt?.getTime
      ? properties.createdAt.getTime()
      : properties.createdAt,
  };

  setUserProperties(analytics, processedProperties);
};
