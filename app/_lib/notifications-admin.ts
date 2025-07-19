import "server-only";

import { Timestamp, FieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import {
  AchievementType,
  CampaignNotification,
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
  isPast,
  endOfDay,
} from "date-fns";
import {
  canCompleteRepeatingTaskNow,
  getStartAndEndTime,
} from "../_utils/utils";
import { getUserById, getUserPreferences } from "./user-admin";
import admin from "firebase-admin";

// Add FCM push notification sending
const sendPushNotification = async (
  fcmToken: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
  },
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || "/icon.png",
      },
      data: {
        actionUrl: data?.actionUrl || "/webapp",
        type: data?.type || "SYSTEM",
        ...data,
      },
      token: fcmToken,
      webpush: {
        notification: {
          icon: notification.icon || "/icon.png",
          badge: "/icon.png",
          requireInteraction: true,
          actions: [
            {
              action: "view",
              title: "View Task",
              icon: "/icon.png",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent push notification:", response);
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
};

// Enhanced notification creation with optional push notification
export const createNotificationWithPush = async (
  notificationData: Omit<
    Notification,
    "id" | "createdAt" | "isRead" | "isArchived"
  >,
  sendPush: boolean = true
): Promise<Notification> => {
  try {
    // Create the database notification
    const notification = await createNotification(notificationData);

    // Send push notification if requested
    if (sendPush) {
      // Get FCM token from user document directly
      const userDoc = await adminDb
        .collection("users")
        .doc(notificationData.userId)
        .get();
      const userData = userDoc.data();

      if (userData?.fcmToken) {
        await sendPushNotification(
          userData.fcmToken,
          {
            title: notificationData.title,
            body: notificationData.message,
          },
          {
            actionUrl: notificationData.actionUrl || "/webapp",
            type: notificationData.type,
            notificationId: notification.id,
          }
        );
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification with push:", error);
    throw error;
  }
};

export const sendCampaignNotification = async (
  userIds: string[],
  campaign: CampaignNotification
): Promise<{ sent: number; failed: number }> => {
  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      await createNotificationWithPush(
        {
          userId,
          type: campaign.type,
          priority: campaign.priority,
          title: campaign.title,
          message: campaign.message,
          actionText: "View",
          actionUrl: campaign.actionUrl,
          data: { campaign: true },
          expiresAt: addDays(new Date(), 7),
        },
        true
      );
      sent++;
    } catch (error) {
      console.error(
        `Failed to send campaign notification to user ${userId}:`,
        error
      );
      failed++;
    }
  }

  return { sent, failed };
};

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
 * Gets all notifications for a user
 * @param userId - The ID of the user to get notifications for
 * @param includeArchived - Whether to include archived notifications
 * @param limitCount - The maximum number of notifications to return
 * @returns An array of notifications of the ones that are not expired
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
      .collection("notifications")
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
    };

    const docRef = await adminDb
      .collection("notifications")
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

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection("notifications")
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

export const markNotificationsAsRead = async (
  notificationIds: string[]
): Promise<void> => {
  try {
    const batch: WriteBatch = adminDb.batch();
    const now = Timestamp.now();

    notificationIds.forEach((id) => {
      const notificationRef = adminDb.collection("notifications").doc(id);
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

export const archiveNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection("notifications")
      .doc(notificationId);
    await notificationRef.update({
      isArchived: true,
    });
  } catch (error) {
    console.error("Error archiving notification:", error);
    throw error;
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = adminDb
      .collection("notifications")
      .doc(notificationId);
    await notificationRef.delete();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 Generates notifications for overdue tasks
 - Identifies which tasks are overdue, and calls createNotification for them
 - Expires in 1 day
 - If the user has not enabled reminders, this function will do nothing
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
      task.isReminder && task.status !== "completed" && isPast(task.dueDate)
  );

  overdueTasks.forEach(async (task) => {
    const daysOverdue = differenceInDays(now, task.dueDate);
    const priority: NotificationPriority = task.isPriority
      ? "URGENT"
      : daysOverdue > 7
      ? "HIGH"
      : daysOverdue > 3
      ? "MEDIUM"
      : "LOW";

    let overdueMessage: string;
    if (daysOverdue < 1) {
      const hoursOverdue = differenceInHours(now, task.dueDate);
      if (hoursOverdue < 1) {
        const minutesOverdue = differenceInMinutes(now, task.dueDate);
        overdueMessage = `is ${minutesOverdue} minute${
          minutesOverdue > 1 ? "s" : ""
        } overdue`;
      } else {
        overdueMessage = `is ${hoursOverdue} hour${
          hoursOverdue > 1 ? "s" : ""
        } overdue`;
      }
    } else {
      overdueMessage = `is ${daysOverdue} day${
        daysOverdue > 1 ? "s" : ""
      } overdue`;
    }

    const existingNotifications = await getNotificationsByUserIdAdmin(userId);
    const hasRecentNotification = existingNotifications.some(
      (n) =>
        n.type === "TASK_OVERDUE" &&
        n.taskId === task.id &&
        differenceInHours(now, n.createdAt) < 24
    );

    if (!hasRecentNotification) {
      await createNotification({
        userId,
        type: "TASK_OVERDUE",
        priority,
        title: "⏰ Task Overdue",
        message: `"${task.title}" ${overdueMessage}`,
        actionText: "Complete Now",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        data: { daysOverdue },
        expiresAt: addDays(now, 1),
      });
    }
  });
};

/**
  Generates notifications for tasks due soon
 - Identifies which tasks are due today or tomorrow, and calls createNotification for them
 - Expires in 1 day
 - If the user has not enabled reminders, this function will do nothing
 */
export const generateDueSoonNotifications = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyReminders) {
    return;
  }
  const now = new Date();
  const tomorrow = endOfDay(addDays(now, 1));
  const dueSoonTasks = tasks.filter(
    (task) =>
      task.isReminder &&
      task.status !== "completed" &&
      isBefore(task.dueDate, tomorrow) &&
      isAfter(task.dueDate, now)
  );

  dueSoonTasks.forEach(async (task) => {
    const priority: NotificationPriority = task.isPriority ? "HIGH" : "MEDIUM";
    const existingNotifications = await getNotificationsByUserIdAdmin(userId);
    const hasRecentNotification = existingNotifications.some(
      (n) =>
        n.type === "TASK_DUE_SOON" &&
        n.taskId === task.id &&
        differenceInHours(now, n.createdAt) < 12
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
        expiresAt: addDays(now, 1),
      });
    }
  });
};

/**
 ** NEEDS FIXES WITH STARTTIME AND ENDTIME
  Generates urgent notifications for time-sensitive repeating tasks.
 - Identifies which tasks have a specified startTime or endTime, and calls createNotification 15, 5 and 1 minute before the task startTime.
 - Expires in 1 day.
 - If the user has not enabled reminders, this function will do nothing.
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
      !task.startTime?.hour ||
      !task.startTime?.minute ||
      !task.duration?.hours ||
      !task.duration?.minutes ||
      (task.dueDate.getHours() !== 23 && task.dueDate.getMinutes() !== 59) //Default endTime
    ) {
      return false;
    }
    const { isDueToday } = canCompleteRepeatingTaskNow(task);
    return isDueToday;
  });

  timeWindowTasks.forEach(async (task) => {
    if (
      !task.startTime?.hour ||
      !task.startTime?.minute ||
      !task.duration?.hours ||
      !task.duration?.minutes
    ) {
      return;
    }

    const { startTime, endTime } = getStartAndEndTime(task);
    const startTimeInMinutes = task.startTime.hour * 60 + task.startTime.minute;
    const durationInMinutes = task.duration.hours * 60 + task.duration.minutes;

    let notificationType = "";
    let title = "";
    let message = "";
    const priority: NotificationPriority = "URGENT";

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
          differenceInMinutes(now, n.createdAt) < 24
      );

      if (!hasRecentNotification) {
        await createNotification({
          userId,
          type: notificationType as "TASK_DUE_SOON",
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
          expiresAt: addDays(now, 1),
        });
      }
    }
  });
};

/**
  Generates achievement notification with a provided milestone type and milestone.
 - Expires in 30 days.
 - If the user has not enabled achievements, this function will do nothing.
 */
export const generateAchievementNotification = async (
  userId: string,
  achievementType: AchievementType,
  achievementData: { achievementId: string }
): Promise<void> => {
  const user = await getUserById(userId);
  if (!user?.notifyAchievements) {
    return;
  }

  // Check if a notification for this specific achievement already exists
  const existingNotifications = await getNotificationsByUserIdAdmin(userId);
  const hasExistingNotification = existingNotifications.some(
    (notification) =>
      notification.type === "ACHIEVEMENT_UNLOCKED" &&
      notification.data?.achievementId === achievementData.achievementId
  );

  if (hasExistingNotification) {
    return; // Prevent duplicate notifications
  }

  const achievementTitles: Record<string, string> = {
    streak_milestone: "🔥 Streak Milestone!",
    points_milestone: "🏆 Points Milestone!",
    task_completionist: "✅ Task Completionist!",
  };

  const numberMilestone = achievementData.achievementId.split("_").at(-1);
  const achievementMessages: Record<string, string> = {
    streak_milestone:
      "You've achieved a new streak milestone! You've completed a new streak of ",
    points_milestone:
      "You've achieved a new points milestone! You've earned a total of ",
    task_completionist:
      "You've achieved a new task completionist milestone! You've completed a total of  ",
  };

  // Create notification regardless of user.achievements check to avoid race conditions
  await createNotification({
    userId,
    type: "ACHIEVEMENT_UNLOCKED",
    priority: "LOW",
    title: achievementTitles[achievementType],
    message: `${achievementMessages[achievementType]} ${numberMilestone}`,
    actionText: "View Achievement",
    actionUrl: "/webapp/profile",
    data: achievementData,
    expiresAt: addDays(new Date(), 30),
  });
};

/**
  Generates a weekly summary notification
 - Needs weeklyStats object
 - Expires in 7 days
 - If the user has not enabled reminders, this function will do nothing
 */
export const generateWeeklySummaryNotification = async (
  userId: string,
  weeklyStats: {
    completedTasks: number;
    totalTasks: number;
    pointsEarned: number;
  }
): Promise<void> => {
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs?.notifyReminders) {
    return;
  }

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
    expiresAt: addDays(new Date(), 7),
  });
};

/**
 * Cleans up expired notifications from Firestore
 */
export const cleanupExpiredNotifications = async (
  userId: string
): Promise<void> => {
  try {
    const notificationsRef = adminDb.collection("notifications");
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
 * Master function to generate all notifications for a user
 - overdue, dueSoon and timeWindow notifs
 */
export const generateNotificationsForUser = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  try {
    await Promise.all([
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
  Returns the statistics of unread notifs
 - totalUnread, unreadByPriority, unreadByType
  May be used later to get other stats as well
  @returns NotificationStats 
 */
export const getNotificationStats = async (
  userId: string
): Promise<NotificationStats> => {
  try {
    const notificationsRef = adminDb.collection("notifications");
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
        id: doc.id,
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
        createdAt: (data.createdAt as Timestamp).toDate(),
        readAt: data.readAt ? (data.readAt as Timestamp).toDate() : undefined,
        data: data.data || {},
        expiresAt: data.expiresAt
          ? (data.expiresAt as Timestamp).toDate()
          : undefined,
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
