import "server-only";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  SessionData,
  TaskAnalytics,
  UserBehaviorData,
  TaskEventType,
  AnalyticsData,
  Achievement,
} from "../_types/types";
import { trackTaskEvent } from "./analytics";

/**
 * - Session duration (average time per session)
 * - Page views (total pages visited)
 * - Active time (actual engagement time)
 */
export const startUserSession = async (userId: string, pageTitle: string) => {
  try {
    if (!userId) throw new Error("User ID is required");

    const sessionData: SessionData = {
      userId,
      sessionStart: new Date(),
      pageViews: 1,
      activeTime: 0,
      pagesVisited: [pageTitle],
    };

    const sessionRef = adminDb.collection("userSessions").doc();
    await sessionRef.set(sessionData);

    /*
    // Store session ID in localStorage for tracking
    if (typeof window !== "undefined") {
      localStorage.setItem("currentSessionId", sessionRef.id);
    }
    // Also track in Firebase Analytics
    trackAppOpen();
    trackPageView(pageTitle);
    */

    return sessionRef.id;
  } catch (error) {
    console.error("Error starting user session:", error);
  }
};

export const updateUserSession = async (
  sessionId: string,
  pageTitle: string,
  timeSpent: number
) => {
  if (!sessionId) throw new Error("Session ID is required");

  try {
    /*
    if (typeof window === "undefined") return;
    const sessionId = localStorage.getItem("currentSessionId");
    if (!sessionId) return;
    */

    const sessionRef = adminDb.collection("userSessions").doc(sessionId);
    await sessionRef.update({
      pageViews: FieldValue.increment(1),
      activeTime: FieldValue.increment(timeSpent),
      pagesVisited: FieldValue.arrayUnion(pageTitle),
    });

    /*
    trackPageView(pageTitle);
    trackUserEngagement(timeSpent * 1000, pageTitle);
    */
  } catch (error) {
    console.error("Error updating user session:", error);
  }
};

export const endUserSession = async (sessionId: string) => {
  try {
    if (!sessionId) throw new Error("Session ID is required");

    const sessionRef = adminDb.collection("userSessions").doc(sessionId);
    await sessionRef.update({
      sessionEnd: new Date(),
    });
  } catch (error) {
    console.error("Error ending user session:", error);
  }
};

/**
 * Daily task completions (last 7 days)
 * Weekly task trends (last 4 weeks)
 * Most productive hour (when you complete most tasks)
 * Average completion time (from creation to completion)
 */
export const trackTaskAnalytics = async (
  userId: string,
  taskId: string,
  action: TaskEventType,
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
    const completionTime =
      taskData.createdAt && taskData.completedAt
        ? Math.floor(
            (taskData.completedAt.getTime() - taskData.createdAt.getTime()) /
              1000
          )
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

    await adminDb.collection("taskAnalytics").add(analyticsData);

    // Also track in Firebase Analytics
    trackTaskEvent(`task_${action}` as TaskEventType, analyticsData);
  } catch (error) {
    console.error("Error tracking task analytics:", error);
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

    await adminDb.collection("userBehavior").add(behaviorData);
  } catch (error) {
    console.error("Error tracking feature usage:", error);
  }
};

/*

Task Analytics:
  Daily task completions (last 7 days)
  Weekly task trends (last 4 weeks)
  Most productive hour (when you complete most tasks)
  Average completion time (from creation to completion)
User Behavior:
  Streak history (consecutive days with activity)
  Points growth (progression over time)
  Feature usage (tasks, calendar, notes, inbox, profile)
Performance Insights:
  Completion rate history (% of tasks completed)
  Consistency score (how regularly you use the app)
  Productivity score (based on completion patterns)

🚀 How It Works
App Launch: When user opens the app, AnalyticsTracker automatically starts a session
Task Actions: Every task creation, completion, delay, or deletion is tracked with detailed metadata
Page Navigation: Firebase Analytics tracks page views and feature usage
Achievement Unlocks: Achievement awards are logged for analysis
*/
export const getAnalyticsData = async (
  userId: string
): Promise<AnalyticsData | null> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get session data for the last 30 days
    const sessionsSnapshot = await adminDb
      .collection("userSessions")
      .where("userId", "==", userId)
      .where("sessionStart", ">=", thirtyDaysAgo)
      .orderBy("sessionStart", "desc")
      .get();

    // Get task analytics for the last 30 days
    const taskAnalyticsSnapshot = await adminDb
      .collection("taskAnalytics")
      .where("userId", "==", userId)
      .where("timestamp", ">=", thirtyDaysAgo)
      .orderBy("timestamp", "desc")
      .get();

    // Get user behavior data for the last 30 days
    const behaviorSnapshot = await adminDb
      .collection("userBehavior")
      .where("userId", "==", userId)
      .where("date", ">=", thirtyDaysAgo)
      .orderBy("date", "desc")
      .get();

    // Get user data for current streak and points
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Process session data
    const sessions: SessionData[] = sessionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        sessionStart: data.sessionStart.toDate(),
        sessionEnd: data.sessionEnd?.toDate(),
        pageViews: data.pageViews,
        activeTime: data.activeTime,
        pagesVisited: data.pagesVisited,
      };
    });

    const totalSessionDuration = sessions.reduce((acc, session) => {
      const start = session.sessionStart;
      const end = session.sessionEnd || new Date();
      return acc + Math.floor((end.getTime() - start.getTime()) / 1000);
    }, 0);

    const avgSessionDuration =
      sessions.length > 0
        ? Math.floor(totalSessionDuration / sessions.length)
        : 0;

    const totalPageViews = sessions.reduce(
      (acc, session) => acc + (session.pageViews || 0),
      0
    );

    const totalActiveTime = sessions.reduce(
      (acc, session) => acc + (session.activeTime || 0),
      0
    );

    // Process task analytics
    const taskAnalytics: TaskAnalytics[] = taskAnalyticsSnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          taskId: data.taskId,
          action: data.action,
          timestamp: data.timestamp.toDate(),
          completionTime: data.completionTime,
          dueDate: data.dueDate.toDate(),
          isPriority: data.isPriority,
          isRepeating: data.isRepeating,
          delayCount: data.delayCount,
          hour: data.hour,
        };
      }
    );

    // Calculate daily task completions for last 7 days
    const dailyTaskCompletions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      return taskAnalytics.filter((task) => {
        const taskDate = task.timestamp;
        return (
          task.action === "task_completed" &&
          taskDate >= dayStart &&
          taskDate <= dayEnd
        );
      }).length;
    }).reverse();

    // Calculate weekly task trends for last 4 weeks
    const weeklyTaskTrends = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);

      return taskAnalytics.filter((task) => {
        const taskDate = task.timestamp;
        return (
          task.action === "task_completed" &&
          taskDate >= weekStart &&
          taskDate <= weekEnd
        );
      }).length;
    }).reverse();

    // Calculate average completion time from actual data
    const completedTasks = taskAnalytics.filter(
      (task) => task.action === "task_completed" && task.completionTime
    );
    const avgCompletionTime =
      completedTasks.length > 0
        ? Math.floor(
            completedTasks.reduce(
              (acc, task) => acc + (task.completionTime || 0),
              0
            ) / completedTasks.length
          )
        : 0;

    // Process user behavior data for feature usage
    const behaviorData: UserBehaviorData[] = behaviorSnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          date: data.date.toDate(),
          featureUsed: data.featureUsed,
          duration: data.duration,
          timestamp: data.timestamp.toDate(),
        };
      }
    );

    const featureUsage = behaviorData.reduce((acc, behavior) => {
      acc[behavior.featureUsed] = (acc[behavior.featureUsed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ensure we have default feature usage structure
    const defaultFeatureUsage = {
      tasks: 0,
      calendar: 0,
      notes: 0,
      inbox: 0,
      profile: 0,
      ...featureUsage,
    };

    // Calculate points growth using actual gainedPoints data
    const pointsGrowth = userData?.gainedPoints || [];

    // Calculate completion rate history for last 7 days
    const completionRateHistory = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayCompletions = taskAnalytics.filter((task) => {
        const taskDate = task.timestamp;
        return (
          task.action === "task_completed" &&
          taskDate >= dayStart &&
          taskDate <= dayEnd
        );
      }).length;

      const dayCreations = taskAnalytics.filter((task) => {
        const taskDate = task.timestamp;
        return (
          task.action === "task_created" &&
          taskDate >= dayStart &&
          taskDate <= dayEnd
        );
      }).length;

      return dayCreations > 0
        ? Math.round((dayCompletions / dayCreations) * 100)
        : 0;
    }).reverse();

    // Calculate consistency score based on session frequency
    const daysWithSessions = new Set(
      sessions.map((session) => session.sessionStart.toDateString())
    ).size;
    const consistencyScore = Math.round((daysWithSessions / 30) * 100);

    // Calculate productivity score based on completion rates and session activity
    const totalCompletions = taskAnalytics.filter(
      (task) => task.action === "task_completed"
    ).length;
    const totalCreations = taskAnalytics.filter(
      (task) => task.action === "task_created"
    ).length;
    const completionRate =
      totalCreations > 0 ? totalCompletions / totalCreations : 0;

    //(completionRate * 0.6 + (consistencyScore / 100) * 0.4) * 100
    const productivityScore = Math.round(
      (completionRate * 0.6 + (consistencyScore / 100) * 0.4) * 100
    );

    // Process achievement analytics from user's achievements array
    const userAchievements = userData?.achievements || [];

    // Helper function to convert achievement date to Date object
    const getAchievementDate = (dateValue: unknown): Date => {
      if (dateValue instanceof Date) {
        return dateValue;
      }
      if (
        dateValue &&
        typeof dateValue === "object" &&
        "toDate" in dateValue &&
        typeof dateValue.toDate === "function"
      ) {
        return dateValue.toDate();
      }
      return new Date(dateValue as string);
    };

    // Helper type for achievement data from Firestore

    // Get recent achievements (last 30 days)
    const recentAchievements = userAchievements
      .filter((achievement: Achievement) => {
        const unlockedDate = getAchievementDate(achievement.unlockedAt);
        return unlockedDate >= thirtyDaysAgo;
      })
      .map((achievement: Achievement) => ({
        type: achievement.type,
        id: achievement.id,
        unlockedAt: getAchievementDate(achievement.unlockedAt),
      }))
      .sort(
        (a: { unlockedAt: Date }, b: { unlockedAt: Date }) =>
          b.unlockedAt.getTime() - a.unlockedAt.getTime()
      );

    // Calculate achievements by type
    const achievementsByType = userAchievements.reduce(
      (acc: Record<string, number>, achievement: Achievement) => {
        acc[achievement.type] = (acc[achievement.type] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate trends by comparing current period (last 15 days) to previous period (15-30 days ago)
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    // Split sessions into current and previous periods
    const currentPeriodSessions = sessions.filter(s => s.sessionStart >= fifteenDaysAgo);
    const previousPeriodSessions = sessions.filter(s => s.sessionStart < fifteenDaysAgo);
    
    // Calculate current and previous period metrics
    const currentAvgSessionDuration = currentPeriodSessions.length > 0 
      ? currentPeriodSessions.reduce((acc, s) => {
          const duration = s.sessionEnd 
            ? Math.floor((s.sessionEnd.getTime() - s.sessionStart.getTime()) / 1000)
            : Math.floor((new Date().getTime() - s.sessionStart.getTime()) / 1000);
          return acc + duration;
        }, 0) / currentPeriodSessions.length
      : 0;
    
    const previousAvgSessionDuration = previousPeriodSessions.length > 0
      ? previousPeriodSessions.reduce((acc, s) => {
          const duration = s.sessionEnd 
            ? Math.floor((s.sessionEnd.getTime() - s.sessionStart.getTime()) / 1000)
            : Math.floor((new Date().getTime() - s.sessionStart.getTime()) / 1000);
          return acc + duration;
        }, 0) / previousPeriodSessions.length
      : 0;
    
    // Calculate productivity trends
    const currentCompletions = taskAnalytics.filter(t => 
      t.action === "task_completed" && t.timestamp >= fifteenDaysAgo
    ).length;
    const currentCreations = taskAnalytics.filter(t => 
      t.action === "task_created" && t.timestamp >= fifteenDaysAgo
    ).length;
    const currentProductivity = currentCreations > 0 ? (currentCompletions / currentCreations) * 100 : 0;
    
    const previousCompletions = taskAnalytics.filter(t => 
      t.action === "task_completed" && t.timestamp < fifteenDaysAgo
    ).length;
    const previousCreations = taskAnalytics.filter(t => 
      t.action === "task_created" && t.timestamp < fifteenDaysAgo
    ).length;
    const previousProductivity = previousCreations > 0 ? (previousCompletions / previousCreations) * 100 : 0;
    
    // Calculate consistency trends
    const currentActiveDays = new Set(
      currentPeriodSessions.map(s => s.sessionStart.toDateString())
    ).size;
    const previousActiveDays = new Set(
      previousPeriodSessions.map(s => s.sessionStart.toDateString())
    ).size;
    
    const currentConsistency = (currentActiveDays / 15) * 100;
    const previousConsistency = (previousActiveDays / 15) * 100;
    
    // Calculate percentage changes (trends)
    const sessionDurationTrend = previousAvgSessionDuration > 0 
      ? Math.round(((currentAvgSessionDuration - previousAvgSessionDuration) / previousAvgSessionDuration) * 100)
      : 0;
    
    const productivityTrend = previousProductivity > 0 
      ? Math.round(((currentProductivity - previousProductivity) / previousProductivity) * 100)
      : 0;
    
    const consistencyTrend = previousConsistency > 0 
      ? Math.round(((currentConsistency - previousConsistency) / previousConsistency) * 100)
      : 0;

    // Return analytics data with calculated values and trends
    return {
      sessionDuration: avgSessionDuration,
      pageViews: totalPageViews,
      activeTime: totalActiveTime,
      dailyTaskCompletions,
      weeklyTaskTrends,
      averageCompletionTime: avgCompletionTime,
      pointsGrowth,
      featureUsage: defaultFeatureUsage,
      completionRateHistory,
      consistencyScore,
      productivityScore,
      trends: {
        sessionDurationTrend,
        productivityTrend,
        consistencyTrend,
      },
      recentAchievements,
      achievementsByType,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);

    return null;
  }
};
