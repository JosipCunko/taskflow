import "server-only";

import { Timestamp, FieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import {
  Notification,
  NotificationPriority,
  NotificationStats,
  Task,
} from "../_types/types";
import {
  isAfter,
  isToday,
  isBefore,
  addDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addMinutes,
  isPast,
} from "date-fns";
import {
  canCompleteRepeatingTaskNow,
  getStartAndEndTime,
} from "../_utils/utils";
import { getUserPreferences } from "./user-admin";
import admin from "firebase-admin";

const NOTIFICATIONS_COLLECTION = "notifications";

// Helper to convert Firestore doc to Notification object
const fromFirestore = (
  snapshot: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
): Notification => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    type: data.type,
    priority: data.priority,
    title: data.title,
    message: data.message,
    actionText: data.actionText,
    actionUrl: data.actionUrl,
    taskId: data.taskId,
    isRead: data.isRead || false,
    isArchived: data.isArchived || false,
    createdAt: data.createdAt.toDate(),
    readAt: data.readAt ? data.readAt.toDate() : undefined,
    data: data.data || {},
    expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
  } as Notification;
};

/**
 * Creates a new notification
 */
export const createNotification = async (
  notificationData: Omit<
    Notification,
    "id" | "createdAt" | "isRead" | "isArchived"
  >
): Promise<Notification> => {
  try {
    const notificationToCreate = {
      ...notificationData,
      isRead: false,
      isArchived: false,
      createdAt: FieldValue.serverTimestamp(),
      ...(notificationData.expiresAt && {
        expiresAt: Timestamp.fromDate(notificationData.expiresAt),
      }),
      ...(notificationData.readAt && {
        readAt: Timestamp.fromDate(notificationData.readAt),
      }),
    };

    const docRef = await adminDb
      .collection(NOTIFICATIONS_COLLECTION)
      .add(notificationToCreate);

    const createdDoc = await docRef.get();
    return fromFirestore(
      createdDoc as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Gets all notifications for a user - ADMIN version
 */
export const getNotificationsByUserIdAdmin = async (
  userId: string,
  includeArchived = false,
  limitCount = 50
): Promise<Notification[]> => {
  if (!userId) {
    return [];
  }

  try {
    let q = adminDb
      .collection(NOTIFICATIONS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    if (!includeArchived) {
      q = q.where("isArchived", "==", false);
    }

    const querySnapshot = await q.get();
    const notifications: Notification[] = querySnapshot.docs.map(
      (docSnapshot) => fromFirestore(docSnapshot)
    );

    const now = new Date();
    return notifications.filter(
      (notification) =>
        !notification.expiresAt || isAfter(notification.expiresAt, now)
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Generates notifications for tasks at risk
 */
export const generateTaskAtRiskNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const repeatingTasks = tasks.filter((task) => task.isRepeating && task.risk);

  for (const task of repeatingTasks) {
    const existingNotifications = await getNotificationsByUserIdAdmin(userId);
    const hasRecentNotification = existingNotifications.some(
      (n) =>
        n.type === "TASK_AT_RISK" &&
        n.taskId === task.id &&
        differenceInHours(new Date(), n.createdAt) < 24
    );

    if (!hasRecentNotification) {
      await createNotification({
        userId,
        type: "TASK_AT_RISK",
        priority: "HIGH",
        title: "🚨 Task at Risk",
        message: `"${task.title}" is at risk. Your consistency streak is in danger!`,
        actionText: "Complete Now",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        data: { delayCount: task.delayCount },
        expiresAt: addDays(new Date(), 7),
      });
    }
  }
};

/**
 * Generates notifications for overdue tasks
 */
export const generateOverdueTaskNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyReminders) {
    return;
  }
  const now = new Date();
  const overdueTasks = tasks.filter(
    (task) => task.status === "pending" && isPast(task.dueDate)
  );

  for (const task of overdueTasks) {
    const daysOverdue = differenceInDays(now, task.dueDate);
    const priority: NotificationPriority = task.isPriority
      ? "URGENT"
      : daysOverdue > 7
      ? "HIGH"
      : daysOverdue > 3
      ? "MEDIUM"
      : "LOW";

    const existingNotifications = await getNotificationsByUserIdAdmin(userId);
    const hasRecentNotification = existingNotifications.some(
      (n) =>
        n.type === "TASK_OVERDUE" &&
        n.taskId === task.id &&
        differenceInHours(new Date(), n.createdAt) < 24
    );

    if (!hasRecentNotification) {
      await createNotification({
        userId,
        type: "TASK_OVERDUE",
        priority,
        title: "⏰ Task Overdue",
        message: `"${task.title}" is ${daysOverdue} day${
          daysOverdue > 1 ? "s" : ""
        } overdue`,
        actionText: "Complete Now",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        data: { daysOverdue },
        expiresAt: addDays(new Date(), 14),
      });
    }
  }
};

/**
 * Generates notifications for tasks due soon
 */
export const generateDueSoonNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyReminders) {
    return;
  }

  const tomorrow = addDays(new Date(), 1);
  const dueSoonTasks = tasks.filter(
    (task) =>
      task.isReminder &&
      task.status === "pending" &&
      isBefore(task.dueDate, tomorrow) &&
      isAfter(task.dueDate, new Date())
  );

  for (const task of dueSoonTasks) {
    const priority: NotificationPriority = task.isPriority ? "HIGH" : "MEDIUM";
    const existingNotifications = await getNotificationsByUserIdAdmin(userId);
    const hasRecentNotification = existingNotifications.some(
      (n) =>
        n.type === "TASK_DUE_SOON" &&
        n.taskId === task.id &&
        differenceInHours(new Date(), n.createdAt) < 8
    );

    if (!hasRecentNotification) {
      await createNotification({
        userId,
        type: "TASK_DUE_SOON",
        priority,
        title: "📅 Task Due Soon",
        message: `"${task.title}" is due ${
          isToday(task.dueDate) ? "today" : "tomorrow"
        }`,
        actionText: "View Task",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        expiresAt: addDays(task.dueDate, 1),
      });
    }
  }
};

/**
 * Generates urgent notifications for time-sensitive repeating tasks
 */
export const generateTimeWindowNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyReminders) {
    return;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeWindowTasks = tasks.filter((task) => {
    if (
      !task.isReminder ||
      !task.isRepeating ||
      !task.startTime ||
      !task.duration
    ) {
      return false;
    }
    const { isDueToday } = canCompleteRepeatingTaskNow(task);
    return isDueToday;
  });

  for (const task of timeWindowTasks) {
    if (!task.startTime || !task.duration) continue;
    const { startTime, endTime } = getStartAndEndTime(task);
    const startTimeInMinutes = task.startTime.hour * 60 + task.startTime.minute;
    const durationInMinutes = task.duration.hours * 60 + task.duration.minutes;

    let notificationType = "";
    let title = "";
    let message = "";
    const priority: NotificationPriority = "URGENT";

    // Determine which notification to send
    if (
      currentTime >= startTimeInMinutes - 15 &&
      currentTime <= startTimeInMinutes - 10
    ) {
      notificationType = "TIME_WINDOW_15MIN";
      title = "⏰ Task Starting in 15 Mins";
      message = `"${task.title}" starts at ${startTime}`;
    } else if (
      currentTime >= startTimeInMinutes - 5 &&
      currentTime < startTimeInMinutes
    ) {
      notificationType = "TIME_WINDOW_5MIN";
      title = "🚨 Task Starting Soon";
      message = `"${task.title}" starts in 5 minutes!`;
    } else if (
      currentTime >= startTimeInMinutes &&
      currentTime <= startTimeInMinutes + durationInMinutes
    ) {
      notificationType = "TIME_WINDOW_NOW";
      title = "🔴 Task Available NOW";
      message = `"${task.title}" is available. Complete by ${endTime}.`;
    }

    if (notificationType) {
      const existingNotifications = await getNotificationsByUserIdAdmin(userId);
      const hasRecentNotification = existingNotifications.some(
        (n) =>
          n.type === notificationType &&
          n.taskId === task.id &&
          differenceInMinutes(new Date(), n.createdAt) < 10
      );

      if (!hasRecentNotification) {
        await createNotification({
          userId,
          type: notificationType as "TASK_DUE_SOON", // This type is loose, but okay for data
          priority,
          title,
          message,
          actionText: "View Task",
          actionUrl: `/webapp/tasks`,
          taskId: task.id,
          data: {
            startTime,
            endTime,
            durationMinutes: durationInMinutes,
          },
          expiresAt: addMinutes(new Date(), durationInMinutes + 30),
        });
      }
    }
  }
};

/**
 * Generates achievement notifications
 */
export const generateAchievementNotification = async (
  userId: string,
  achievementType: string,
  achievementData: Record<string, unknown>
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyAchievements) {
    return;
  }

  const achievementTitles: Record<string, string> = {
    streak_milestone: "🔥 Streak Milestone!",
    points_milestone: "🏆 Points Milestone!",
    consistency_master: "🎯 Consistency Master!",
    task_completionist: "✅ Task Completionist!",
  };

  await createNotification({
    userId,
    type: "ACHIEVEMENT_UNLOCKED",
    priority: "LOW",
    title: achievementTitles[achievementType] || "🎉 Achievement Unlocked!",
    message: `You've achieved a new milestone! Check your profile.`,
    actionText: "View Achievement",
    actionUrl: "/webapp/profile",
    data: achievementData,
    expiresAt: addDays(new Date(), 30),
  });
};

/**
 * Generates a weekly summary notification
 */
export const generateWeeklySummaryNotification = async (
  userId: string,
  weeklyStats: {
    completedTasks: number;
    totalTasks: number;
    pointsEarned: number;
    streakDays: number;
  }
): Promise<void> => {
  const completionRate = Math.round(
    (weeklyStats.completedTasks / Math.max(weeklyStats.totalTasks, 1)) * 100
  );

  await createNotification({
    userId,
    type: "WEEKLY_SUMMARY",
    priority: "LOW",
    title: "📊 Weekly Summary",
    message: `This week: ${weeklyStats.completedTasks}/${weeklyStats.totalTasks} tasks completed (${completionRate}%), ${weeklyStats.pointsEarned} points earned`,
    actionText: "View Dashboard",
    actionUrl: "/webapp",
    data: weeklyStats,
    expiresAt: addDays(new Date(), 14),
  });
};

/**
 * Master function to generate all notifications for a user
 */
export const generateNotificationsForUser = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  try {
    await Promise.all([
      generateTaskAtRiskNotifications(userId, tasks),
      generateOverdueTaskNotifications(userId, tasks),
      generateDueSoonNotifications(userId, tasks),
      generateTimeWindowNotifications(userId, tasks),
    ]);
  } catch (error) {
    console.error("Error generating notifications for user:", error);
    throw error;
  }
};

/**
 * Cleans up expired notifications
 */
export const cleanupExpiredNotifications = async (
  userId: string
): Promise<void> => {
  try {
    const notificationsRef = adminDb.collection(NOTIFICATIONS_COLLECTION);
    const now = Timestamp.now();

    const expiredQuery = notificationsRef
      .where("userId", "==", userId)
      .where("expiresAt", "<=", now);

    const expiredSnapshot = await expiredQuery.get();
    const batch: WriteBatch = adminDb.batch();

    expiredSnapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });

    if (expiredSnapshot.docs.length > 0) {
      await batch.commit();
      console.log(
        `Cleaned up ${expiredSnapshot.docs.length} expired notifications for user ${userId}`
      );
    }
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error);
    throw error;
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection(NOTIFICATIONS_COLLECTION)
      .doc(notificationId);
    await notificationRef.update({
      isRead: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Marks multiple notifications as read
 */
export const markNotificationsAsRead = async (
  notificationIds: string[]
): Promise<void> => {
  try {
    const batch: WriteBatch = adminDb.batch();
    const now = Timestamp.now();

    notificationIds.forEach((id) => {
      const notificationRef = adminDb
        .collection(NOTIFICATIONS_COLLECTION)
        .doc(id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: now,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

/**
 * Archives a notification
 */
export const archiveNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection(NOTIFICATIONS_COLLECTION)
      .doc(notificationId);
    await notificationRef.update({
      isArchived: true,
    });
  } catch (error) {
    console.error("Error archiving notification:", error);
    throw error;
  }
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection(NOTIFICATIONS_COLLECTION)
      .doc(notificationId);
    await notificationRef.delete();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Gets notification statistics for a user
 */
export const getNotificationStats = async (
  userId: string
): Promise<NotificationStats> => {
  try {
    const notificationsRef = adminDb.collection(NOTIFICATIONS_COLLECTION);
    const querySnapshot = await notificationsRef
      .where("userId", "==", userId)
      .where("isRead", "==", false)
      .where("isArchived", "==", false)
      .get();

    const now = new Date();
    const unreadNotifications: Notification[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const notification = {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate(),
        readAt: (data.readAt as Timestamp)?.toDate(),
        expiresAt: (data.expiresAt as Timestamp)?.toDate(),
      } as Notification;

      if (!notification.expiresAt || isAfter(notification.expiresAt, now)) {
        unreadNotifications.push(notification);
      }
    });

    const stats: NotificationStats = {
      totalUnread: unreadNotifications.length,
      unreadByPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
      unreadByType: {},
    };

    unreadNotifications.forEach((notification) => {
      stats.unreadByPriority[notification.priority]++;
      stats.unreadByType[notification.type] =
        (stats.unreadByType[notification.type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Error getting notification stats:", error);
    throw error;
  }
};
