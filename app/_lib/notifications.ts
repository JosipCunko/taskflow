import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
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
} from "date-fns";
import { getUserPreferences } from "./user";

const NOTIFICATIONS_COLLECTION = "notifications";

// Helper to convert Firestore doc to Notification object
const fromFirestore = (
  snapshot: QueryDocumentSnapshot<DocumentData>
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
    createdAt: data.createdAt
      ? (data.createdAt as Timestamp).toDate()
      : new Date(),
    readAt: data.readAt ? (data.readAt as Timestamp).toDate() : undefined,
    data: data.data || {},
    expiresAt: data.expiresAt
      ? (data.expiresAt as Timestamp).toDate()
      : undefined,
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
      createdAt: serverTimestamp(),
      ...(notificationData.expiresAt && {
        expiresAt: Timestamp.fromDate(notificationData.expiresAt),
      }),
      ...(notificationData.readAt && {
        readAt: Timestamp.fromDate(notificationData.readAt),
      }),
    };

    const docRef = await addDoc(
      collection(db, NOTIFICATIONS_COLLECTION),
      notificationToCreate
    );

    // Fetch the created document to return
    const createdDoc = await getDoc(docRef);
    return fromFirestore(createdDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Gets all notifications for a user
 */
export const getNotificationsByUserId = async (
  userId: string,
  includeArchived = false,
  limitCount = 50
): Promise<Notification[]> => {
  if (!userId) {
    console.warn("getNotificationsByUserId called without a userId.");
    return [];
  }

  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    let q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (!includeArchived) {
      q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("isArchived", "==", false),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = querySnapshot.docs.map(
      (docSnapshot) => fromFirestore(docSnapshot)
    );

    // Filter out expired notifications
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
 * Marks a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp(),
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
    const batch = writeBatch(db);

    notificationIds.forEach((id) => {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
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
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
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
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notificationRef);
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
    const notifications = await getNotificationsByUserId(userId, false);
    const unreadNotifications = notifications.filter((n) => !n.isRead);

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

/**
 * Notification Generation Functions
 */

/**
 * Generates notifications for tasks at risk (repeating tasks missed multiple times)
 */
export const generateTaskAtRiskNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const repeatingTasks = tasks.filter(
    (task) =>
      task.isRepeating && task.delayCount >= 3 && task.status !== "completed"
  );

  for (const task of repeatingTasks) {
    const existingNotifications = await getNotificationsByUserId(userId);
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
        message: `"${task.title}" has been delayed ${task.delayCount} times. Your consistency streak is at risk!`,
        actionText: "Complete Now",
        actionUrl: `/webapp/tasks/${task.id}`,
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
    (task) =>
      task.status === "pending" &&
      task.isReminder &&
      isBefore(task.dueDate, now) &&
      !isToday(task.dueDate)
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

    // Check if we already have a recent notification for this task
    const existingNotifications = await getNotificationsByUserId(userId);
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
        actionUrl: `/webapp/tasks/${task.id}`,
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
      ((task.status === "pending" && isToday(task.dueDate)) ||
        (isBefore(task.dueDate, tomorrow) && isAfter(task.dueDate, new Date())))
  );

  for (const task of dueSoonTasks) {
    const priority: NotificationPriority = task.isPriority ? "HIGH" : "MEDIUM";

    const existingNotifications = await getNotificationsByUserId(userId);
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
        actionUrl: `/webapp/tasks/${task.id}`,
        taskId: task.id,
        expiresAt: addDays(task.dueDate, 1),
      });
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
    priority: "MEDIUM",
    title: achievementTitles[achievementType] || "🎉 Achievement Unlocked!",
    message: `You've achieved a new milestone! Check your profile to see your progress.`,
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
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const now = new Date();

    const expiredQuery = query(
      notificationsRef,
      where("userId", "==", userId),
      where("expiresAt", "<=", Timestamp.fromDate(now))
    );

    const expiredSnapshot = await getDocs(expiredQuery);
    const batch = writeBatch(db);

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
