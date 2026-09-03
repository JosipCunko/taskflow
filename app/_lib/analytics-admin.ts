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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function resolveTimeZone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return tz;
  } catch {
    return "UTC";
  }
}

function getZonedHour(timestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return hour === 24 ? 0 : hour;
}

function getZonedDateKey(timestamp: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

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
      ...(taskData.risk !== undefined && { risk: taskData.risk }),
      dueDate: taskData.dueDate,
      isReminder: taskData.isReminder,
      isPriority: taskData.isPriority,
      isRepeating: taskData.isRepeating,
      ...(taskData.delayCount !== undefined && {
        delayCount: taskData.delayCount,
      }),
      // UTC hour for storage only. Dashboard derives local hour from timestamp.
      hour: new Date(taskData.completedAt ?? Date.now()).getUTCHours(),
      points: taskData.points,
    };

    await adminDb.collection("taskAnalytics").add(analyticsData);
  } catch (error) {
    console.error("Error tracking task analytics:", error);
  }
};

export const getAnalyticsData = async (
  userId: string,
  timeZone: string = "UTC"
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

    const todayKey = getZonedDateKey(now, timeZone);
    const last14DateKeys = Array.from({ length: 14 }, (_, i) =>
      addDaysToDateKey(todayKey, -(13 - i))
    );

    const completedTasks = taskAnalytics.filter(
      (task) => task.action === "task_completed"
    );

    const completionsByDate = new Map<string, number>();
    completedTasks.forEach((task) => {
      const key = getZonedDateKey(task.timestamp, timeZone);
      completionsByDate.set(key, (completionsByDate.get(key) || 0) + 1);
    });

    const dailyTaskCompletions = last14DateKeys.map(
      (key) => completionsByDate.get(key) || 0
    );

    const completedWithPoints = completedTasks.filter((task) => task.points > 0);

    let weeklyPointsGrowth: number[] = [];
    if (completedWithPoints.length > 0) {
      const oldestKey = completedWithPoints.reduce((min, task) => {
        const key = getZonedDateKey(task.timestamp, timeZone);
        return key < min ? key : min;
      }, todayKey);
      const daySpan =
        Math.round(
          (Date.parse(todayKey) - Date.parse(oldestKey)) / MS_PER_DAY
        ) + 1;
      const weeksWithData = Math.max(1, Math.ceil(daySpan / 7));

      weeklyPointsGrowth = Array.from({ length: weeksWithData }, (_, i) => {
        const weeksFromEnd = weeksWithData - 1 - i;
        const weekEndKey = addDaysToDateKey(todayKey, -weeksFromEnd * 7);
        const weekStartKey = addDaysToDateKey(weekEndKey, -6);
        return completedWithPoints
          .filter((task) => {
            const key = getZonedDateKey(task.timestamp, timeZone);
            return key >= weekStartKey && key <= weekEndKey;
          })
          .reduce((totalPoints, task) => totalPoints + task.points, 0);
      });

      const firstNonZero = weeklyPointsGrowth.findIndex((value) => value > 0);
      weeklyPointsGrowth =
        firstNonZero === -1 ? [] : weeklyPointsGrowth.slice(firstNonZero);
    }

    const completedLast30 = completedTasks.filter(
      (task) => task.timestamp >= thirtyDaysAgo
    );
    const hourDistribution = Array.from({ length: 24 }, () => 0);
    const latestByHour = Array.from({ length: 24 }, () => 0);
    completedLast30.forEach((task) => {
      const hour = getZonedHour(task.timestamp, timeZone);
      hourDistribution[hour]++;
      if (task.timestamp > latestByHour[hour]) {
        latestByHour[hour] = task.timestamp;
      }
    });

    let mostProductiveHour = -1;
    if (completedLast30.length > 0) {
      let bestCount = 0;
      let bestLatest = 0;
      hourDistribution.forEach((count, hour) => {
        if (
          count > bestCount ||
          (count === bestCount && count > 0 && latestByHour[hour] > bestLatest)
        ) {
          bestCount = count;
          bestLatest = latestByHour[hour];
          mostProductiveHour = hour;
        }
      });
    }

    // Derive from session pagesVisited data
    const pagesVisited = sessions.reduce((acc, session) => {
      session.pagesVisited?.forEach((page) => {
        acc[page] = (acc[page] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const daysWithSessions = new Set(
      sessions.map((session) => getZonedDateKey(session.sessionStart, timeZone))
    ).size;
    const accountAgeDays = Math.max(
      1,
      Math.ceil((now - (userData?.createdAt ?? now)) / MS_PER_DAY)
    );
    const consistencyWindowDays = Math.min(30, accountAgeDays);
    const consistencyScore = Math.round(
      (daysWithSessions / consistencyWindowDays) * 100
    );

    const recentTaskAnalytics = taskAnalytics.filter(
      (task) => task.timestamp >= thirtyDaysAgo
    );
    const totalCompletions = recentTaskAnalytics.filter(
      (task) => task.action === "task_completed"
    ).length;
    const totalCreations = recentTaskAnalytics.filter(
      (task) => task.action === "task_created"
    ).length;
    const completionRate =
      totalCreations > 0
        ? Math.min(totalCompletions / totalCreations, 1)
        : totalCompletions > 0
          ? 1
          : 0;

    const productivityScore = Math.min(
      100,
      Math.round(
        (completionRate * 0.6 + (consistencyScore / 100) * 0.4) * 100
      )
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
      currentPeriodSessions.map((s) =>
        getZonedDateKey(s.sessionStart, timeZone)
      )
    ).size;
    const previousActiveDays = new Set(
      previousPeriodSessions.map((s) =>
        getZonedDateKey(s.sessionStart, timeZone)
      )
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
      hourDistribution,
      recentCompletionTimestamps: completedLast30.map((task) => task.timestamp),
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
