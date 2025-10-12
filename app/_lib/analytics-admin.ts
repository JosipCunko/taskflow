import "server-only";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  SessionData,
  TaskAnalytics,
  TaskEventType,
  AnalyticsData,
  Achievement,
} from "../_types/types";
import { getUserById } from "./user-admin";

/**
  - start session to an user in userSessions, sets pageViews to 1, activeTime to 0 and pagesVisited to [pageTitle]
  @returns sessionRef.id
*/
export const startUserSession = async (userId: string, pageTitle: string) => {
  try {
    if (!userId) throw new Error("User ID is required");

    const sessionData: SessionData = {
      userId,
      sessionStart: Date.now(),
      pageViews: 1,
      activeTime: 0,
      pagesVisited: [pageTitle],
    };

    const sessionRef = adminDb.collection("userSessions").doc();
    await sessionRef.set(sessionData);

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
    const sessionRef = adminDb.collection("userSessions").doc(sessionId);
    await sessionRef.update({
      pageViews: FieldValue.increment(1),
      activeTime: FieldValue.increment(timeSpent),
      pagesVisited: FieldValue.arrayUnion(pageTitle),
    });
  } catch (error) {
    console.error("Error updating user session:", error);
  }
};

/**Adds sessionEnd to a corresponding session in the userSessions */
export const endUserSession = async (sessionId: string, timeSpent?: number) => {
  try {
    if (!sessionId) throw new Error("Session ID is required");

    const sessionRef = adminDb.collection("userSessions").doc(sessionId);
    const updates: {
      sessionEnd: number;
      activeTime?: FirebaseFirestore.FieldValue;
    } = {
      sessionEnd: Date.now(),
    };

    if (timeSpent && timeSpent > 0) {
      updates.activeTime = FieldValue.increment(timeSpent);
    }
    await sessionRef.update(updates);
  } catch (error) {
    console.error("Error ending user session:", error);
  }
};

export const trackTaskAnalytics = async (
  userId: string,
  taskId: string,
  action: TaskEventType,
  taskData: {
    dueDate: number;
    isPriority: boolean;
    isReminder: boolean;
    risk?: boolean;
    isRepeating: boolean;
    createdAt: number;
    completedAt?: number;
    delayCount?: number;
    points: number;
  }
) => {
  try {
    const analyticsData: TaskAnalytics = {
      userId,
      taskId,
      action,
      timestamp: Date.now(),
      ...(taskData.risk && { risk: taskData.risk }),
      dueDate: taskData.dueDate,
      isReminder: taskData.isReminder,
      isPriority: taskData.isPriority,
      isRepeating: taskData.isRepeating,
      delayCount: taskData.delayCount,
      // Use completion time for hour calculation if available, otherwise use current time
      hour: taskData.completedAt
        ? new Date(taskData.completedAt).getHours()
        : new Date().getHours(), // created, updated or delayed at the same time
      points: taskData.points,
    };

    await adminDb.collection("taskAnalytics").add(analyticsData);
  } catch (error) {
    console.error("Error tracking task analytics:", error);
  }
};

export const getAnalyticsData = async (
  userId: string
): Promise<AnalyticsData | null> => {
  try {
    const now = Date.now();
    // Calculate trends by comparing current period (last 15 days) to previous period (15-30 days ago)
    const fifteenDaysAgo = now - 15 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const sessionsSnapshot = await adminDb
      .collection("userSessions")
      .where("userId", "==", userId)
      .where("sessionStart", ">=", thirtyDaysAgo)
      .orderBy("sessionStart", "desc")
      .get();

    const taskAnalyticsSnapshot = await adminDb
      .collection("taskAnalytics")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    // Fetch user data with achievements from subcollection using getUserById
    const userData = await getUserById(userId);

    // Process session data
    const sessions: SessionData[] = sessionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        sessionStart: data.sessionStart,
        sessionEnd: data.sessionEnd,
        pageViews: data.pageViews,
        activeTime: data.activeTime,
        pagesVisited: data.pagesVisited,
      };
    });

    const totalSessionDuration = sessions.reduce((acc, session) => {
      const start = session.sessionStart;
      const end = session.sessionEnd || Date.now();
      return acc + Math.floor((end - start) / 1000);
    }, 0);

    const avgSessionDuration =
      sessions.length > 0
        ? Math.floor(totalSessionDuration / sessions.length)
        : 0;

    const totalPageViews = sessions.reduce(
      (acc, session) => acc + session.pageViews,
      0
    );

    const totalActiveTime = sessions.reduce(
      (acc, session) => acc + session.activeTime,
      0
    );

    const taskAnalytics: TaskAnalytics[] = taskAnalyticsSnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          taskId: data.taskId,
          action: data.action,
          timestamp: data.timestamp,
          dueDate: data.dueDate,
          isPriority: data.isPriority,
          isReminder: data.isReminder,
          isRepeating: data.isRepeating,
          delayCount: data.delayCount,
          risk: data.risk,
          hour: data.hour,
          points: data.points,
        };
      }
    );

    /** Each number is the total completed tasks for a specific day.
     * length: 14
     */
    const dailyTaskCompletions = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      return taskAnalytics.filter((task) => {
        const taskDate = task.timestamp;
        return (
          task.action === "task_completed" &&
          taskDate >= dayStart.getTime() &&
          taskDate <= dayEnd.getTime()
        );
      }).length;
    }).reverse();

    /** Each number is the total completed tasks for a specific week.
     * Dynamic length based on available data
     */
    const weeksWithData =
      taskAnalytics.length > 0
        ? Math.ceil(
            Math.max(
              ...taskAnalytics.map((task) =>
                Math.ceil((now - task.timestamp) / (7 * 24 * 60 * 60 * 1000))
              ),
              1
            )
          )
        : 1;

    /** Each number is the total points earned for a specific week.
     * Dynamic length based on available data, no fixed limit
     */
    const weeklyPointsGrowth = Array.from({ length: weeksWithData }, (_, i) => {
      const weekEnd = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);

      return taskAnalytics
        .filter((task) => {
          const taskDate = task.timestamp;
          return (
            task.action === "task_completed" &&
            taskDate >= weekStart.getTime() &&
            taskDate <= weekEnd.getTime() &&
            task.points > 0
          );
        })
        .reduce((totalPoints, task) => totalPoints + task.points, 0);
    }).reverse();

    // Calculate most productive hour (hour when most tasks are completed)
    const completedTasksWithHour = taskAnalytics.filter(
      (task) => task.action === "task_completed" && task.hour !== undefined
    );
    const hourCounts = Array.from({ length: 24 }, () => 0);
    completedTasksWithHour.forEach((task) => {
      if (task.hour !== undefined) {
        hourCounts[task.hour]++;
      }
    });
    const mostProductiveHour =
      completedTasksWithHour.length > 0
        ? hourCounts.indexOf(Math.max(...hourCounts))
        : -1; // no data available

    // Derive from session pagesVisited data
    const pagesVisited = sessions.reduce((acc, session) => {
      session.pagesVisited?.forEach((page) => {
        acc[page] = (acc[page] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate consistency score based on session frequency
    const daysWithSessions = new Set(
      sessions.map((session) => new Date(session.sessionStart).toDateString())
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

    const productivityScore = Math.round(
      (completionRate * 0.6 + (consistencyScore / 100) * 0.4) * 100
    );

    // Get all achievements from user data (already fetched from subcollection via getUserById)
    const allAchievements = (userData?.achievements || [])
      .map((achievement: Achievement) => ({
        type: achievement.type,
        id: achievement.id,
        userId: achievement.userId,
        unlockedAt: achievement.unlockedAt,
      }))
      .sort((a: Achievement, b: Achievement) => b.unlockedAt - a.unlockedAt);

    // Calculate achievements by type
    const achievementsByType = allAchievements.reduce(
      (acc: Record<string, number>, achievement: Achievement) => {
        acc[achievement.type] = (acc[achievement.type] || 0) + 1;
        return acc;
      },
      {}
    );

    // Split sessions into current and previous periods
    const currentPeriodSessions = sessions.filter(
      (s) => s.sessionStart >= fifteenDaysAgo
    );
    const previousPeriodSessions = sessions.filter(
      (s) => s.sessionStart >= thirtyDaysAgo && s.sessionStart < fifteenDaysAgo
    );

    // Calculate current and previous period metrics
    const currentAvgSessionDuration =
      currentPeriodSessions.length > 0
        ? currentPeriodSessions.reduce((acc, s) => {
            const duration = s.sessionEnd
              ? Math.floor((s.sessionEnd - s.sessionStart) / 1000)
              : Math.floor((Date.now() - s.sessionStart) / 1000);
            return acc + duration;
          }, 0) / currentPeriodSessions.length
        : 0;

    const previousAvgSessionDuration =
      previousPeriodSessions.length > 0
        ? previousPeriodSessions.reduce((acc, s) => {
            const duration = s.sessionEnd
              ? Math.floor((s.sessionEnd - s.sessionStart) / 1000)
              : Math.floor((Date.now() - s.sessionStart) / 1000);
            return acc + duration;
          }, 0) / previousPeriodSessions.length
        : 0;

    // Calculate productivity trends
    const currentCompletions = taskAnalytics.filter(
      (t) => t.action === "task_completed" && t.timestamp >= fifteenDaysAgo
    ).length;
    const currentCreations = taskAnalytics.filter(
      (t) => t.action === "task_created" && t.timestamp >= fifteenDaysAgo
    ).length;
    const currentProductivity =
      currentCreations > 0 ? (currentCompletions / currentCreations) * 100 : 0;

    const previousCompletions = taskAnalytics.filter(
      (t) =>
        t.action === "task_completed" &&
        t.timestamp >= thirtyDaysAgo &&
        t.timestamp < fifteenDaysAgo
    ).length;
    const previousCreations = taskAnalytics.filter(
      (t) =>
        t.action === "task_created" &&
        t.timestamp >= thirtyDaysAgo &&
        t.timestamp < fifteenDaysAgo
    ).length;
    const previousProductivity =
      previousCreations > 0
        ? (previousCompletions / previousCreations) * 100
        : 0;

    // Calculate consistency trends
    const currentActiveDays = new Set(
      currentPeriodSessions.map((s) => new Date(s.sessionStart).toDateString())
    ).size;
    const previousActiveDays = new Set(
      previousPeriodSessions.map((s) => new Date(s.sessionStart).toDateString())
    ).size;

    const currentConsistency = (currentActiveDays / 15) * 100;
    const previousConsistency = (previousActiveDays / 15) * 100;

    // Calculate percentage changes (trends)
    const sessionDurationTrend =
      previousAvgSessionDuration > 0
        ? Math.round(
            ((currentAvgSessionDuration - previousAvgSessionDuration) /
              previousAvgSessionDuration) *
              100
          )
        : 0;

    const productivityTrend =
      previousProductivity > 0
        ? Math.round(
            ((currentProductivity - previousProductivity) /
              previousProductivity) *
              100
          )
        : 0;

    const consistencyTrend =
      previousConsistency > 0
        ? Math.round(
            ((currentConsistency - previousConsistency) / previousConsistency) *
              100
          )
        : 0;

    return {
      sessionDuration: avgSessionDuration,
      pageViews: totalPageViews,
      activeTime: totalActiveTime,
      dailyTaskCompletions,
      mostProductiveHour,
      pointsGrowth: weeklyPointsGrowth,
      pagesVisited,
      consistencyScore,
      productivityScore,
      trends: {
        sessionDurationTrend,
        productivityTrend,
        consistencyTrend,
      },
      allAchievements,
      achievementsByType,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);

    return null;
  }
};
