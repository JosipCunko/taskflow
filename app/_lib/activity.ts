import { adminDb } from "./admin";
import type { ActivityLog } from "@/app/_types/types";

export async function getRecentUserActivity(
  userId: string,
  limitCount: number = 7
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

export async function logUserActivity(
  userId: string,
  activityData: Omit<ActivityLog, "id" | "timestamp" | "userId">
): Promise<void> {
  try {
    await adminDb.collection("userActivityLogs").add({
      userId,
      timestamp: new Date(),
      ...activityData,
    });
    console.log(`Activity logged for user ${userId}: ${activityData.type}`);
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}

// Example of logging task completion
// logUserActivity(userId, {
//   type: "TASK_COMPLETED",
//   taskId: task.id,
//   taskSnapshot: { title: task.title, description: task.description, color: task.color, icon: task.icon },
//   activityIcon: 'CheckCircle2',
//   activityColor: 'var(--color-success)',
// });
