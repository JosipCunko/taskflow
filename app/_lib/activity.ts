import "server-only";
import { adminDb } from "./admin";
import type { ActivityLog } from "@/app/_types/types";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDuration } from "@/app/_utils/serverCache";

async function getRecentUserActivityInternal(
  userId: string,
  limitCount: number = 20
): Promise<ActivityLog[]> {
  try {
    const activitySnap = await adminDb
      .collection("userActivityLogs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limitCount)
      .get();

    if (activitySnap.empty) {
      return [];
    }

    return activitySnap.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate
        ? data.timestamp.toDate()
        : new Date(data.timestamp);

      // Ensure taskSnapshot.dueDate is also a JS Date if present
      const taskSnapshot = data.taskSnapshot
        ? {
            ...data.taskSnapshot,
            dueDate: data.taskSnapshot.dueDate?.toDate
              ? data.taskSnapshot.dueDate.toDate()
              : data.taskSnapshot.dueDate
              ? new Date(data.taskSnapshot.dueDate)
              : undefined,
          }
        : undefined;

      return {
        id: doc.id,
        ...data,
        timestamp,
        taskSnapshot,
      } as ActivityLog;
    });
  } catch (error) {
    console.error("Error fetching recent user activity:", error);
    return [];
  }
}

export async function getRecentUserActivity(
  userId: string,
  limitCount: number = 20
): Promise<ActivityLog[]> {
  const cachedGetActivity = unstable_cache(
    getRecentUserActivityInternal,
    [`activity-${userId}-${limitCount}`],
    {
      tags: [CacheTags.userActivity(userId)],
      revalidate: CacheDuration.ANALYTICS, // 10 minutes cache for activity logs
    }
  );

  return cachedGetActivity(userId, limitCount);
}

async function getUserActivityForPeriodInternal(
  userId: string,
  startTime: number,
  endTime: number
): Promise<ActivityLog[]> {
  try {
    const activitySnap = await adminDb
      .collection("userActivityLogs")
      .where("userId", "==", userId)
      .where("timestamp", ">=", startTime)
      .where("timestamp", "<=", endTime)
      .orderBy("timestamp", "desc")
      .get();

    if (activitySnap.empty) {
      return [];
    }

    return activitySnap.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp;

      const taskSnapshot = data.taskSnapshot
        ? {
            ...data.taskSnapshot,
            dueDate: data.taskSnapshot.dueDate,
          }
        : undefined;

      return {
        id: doc.id,
        ...data,
        timestamp,
        taskSnapshot,
      } as ActivityLog;
    });
  } catch (error) {
    console.error("Error fetching user activity for period:", error);
    return [];
  }
}

export async function getUserActivityForPeriod(
  userId: string,
  startTime: number,
  endTime: number
): Promise<ActivityLog[]> {
  const cachedGetActivityPeriod = unstable_cache(
    getUserActivityForPeriodInternal,
    [`activity-period-${userId}-${startTime}-${endTime}`],
    {
      tags: [CacheTags.userActivity(userId)],
      revalidate: CacheDuration.ANALYTICS, // 10 minutes cache
    }
  );

  return cachedGetActivityPeriod(userId, startTime, endTime);
}

export async function logUserActivity(
  userId: string,
  activityData: Omit<ActivityLog, "id" | "timestamp" | "userId">
): Promise<void> {
  try {
    await adminDb.collection("userActivityLogs").add({
      userId,
      timestamp: Date.now(),
      ...activityData,
    });
    console.log(`Activity logged for user ${userId}: ${activityData.type}`);
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}
