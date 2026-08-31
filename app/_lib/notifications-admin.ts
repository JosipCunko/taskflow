import "server-only";

import { WriteBatch } from "firebase-admin/firestore";
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
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import {
  canCompleteRepeatingTaskNow,
  getStartAndEndTime,
} from "../_utils/utils";
import { getUserById, getUserPreferences } from "./user-admin";
import admin from "firebase-admin";

const generateNotificationsInFlight = new Map<string, Promise<void>>();

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
        icon: notification.icon || "/icon-512.png",
      },
      data: {
        actionUrl: data?.actionUrl || "/webapp",
        type: data?.type || "SYSTEM",
        ...data,
      },
      token: fcmToken,
      webpush: {
        notification: {
          icon: notification.icon || "/icon-512.png",
          badge: "/icon-512.png",
          requireInteraction: true,
          actions: [
            {
              action: "view",
              title: "View Task",
              icon: "/icon-512.png",
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
          expiresAt: addDays(new Date(), 7).getTime(),
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
    createdAt: data.createdAt,
    readAt: data.readAt ? data.readAt : undefined,
    data: data.data || {},
    expiresAt: data.expiresAt ? data.expiresAt : undefined,
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

    const now = Date.now();
    const active = notifications.filter(
      (notification) => !notification.expiresAt || notification.expiresAt > now
    );
    return dedupeNotifications(active);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

function notificationDedupeKey(notification: Notification): string {
  if (notification.taskId) {
    return `${notification.type}:${notification.taskId}`;
  }
  const achievementId = notification.data?.achievementId;
  if (notification.type === "ACHIEVEMENT_UNLOCKED" && achievementId) {
    return `${notification.type}:${achievementId}`;
  }
  return notification.id;
}

function taskNotificationDocId(taskId: string, type: string): string {
  return `task_${taskId}_${type}`;
}

/** Keep the newest notification per task/type (or achievement). */
function dedupeNotifications(notifications: Notification[]): Notification[] {
  const newestByKey = new Map<string, Notification>();
  for (const notification of notifications) {
    const key = notificationDedupeKey(notification);
    const existing = newestByKey.get(key);
    if (!existing || notification.createdAt > existing.createdAt) {
      newestByKey.set(key, notification);
    }
  }
  return Array.from(newestByKey.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

async function cleanupDuplicateNotifications(userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    const grouped = new Map<
      string,
      admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[]
    >();
    snapshot.docs.forEach((docSnapshot) => {
      const notification = fromFirestore(docSnapshot);
      if (notification.isArchived) return;
      const key = notificationDedupeKey(notification);
      const group = grouped.get(key) ?? [];
      group.push(docSnapshot);
      grouped.set(key, group);
    });

    const batch = adminDb.batch();
    let deleteCount = 0;
    grouped.forEach((docs) => {
      if (docs.length < 2) return;
      const sorted = [...docs].sort((a, b) => {
        const aCreated = (a.data().createdAt as number) || 0;
        const bCreated = (b.data().createdAt as number) || 0;
        return bCreated - aCreated;
      });
      sorted.slice(1).forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        deleteCount++;
      });
    });

    if (deleteCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error cleaning up duplicate notifications:", error);
  }
}

export const createNotification = async (
  notificationData: Omit<
    Notification,
    "id" | "createdAt" | "isRead" | "isArchived"
  >,
  options?: { id?: string }
): Promise<Notification> => {
  try {
    const notificationToCreate = {
      ...notificationData,
      isRead: false,
      isArchived: false,
      createdAt: Date.now(),
      ...(notificationData.expiresAt && {
        expiresAt: notificationData.expiresAt,
      }),
    };

    if (options?.id) {
      const docRef = adminDb.collection("notifications").doc(options.id);
      const existing = await docRef.get();
      if (existing.exists) {
        const existingNotification = fromFirestore(
          existing as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
        );
        const expired =
          existingNotification.expiresAt &&
          existingNotification.expiresAt <= Date.now();
        if (!expired && !existingNotification.isArchived) {
          return existingNotification;
        }
      }
      await docRef.set(notificationToCreate);
      const createdDoc = await docRef.get();
      return fromFirestore(
        createdDoc as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
      );
    }

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
      readAt: Date.now(),
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
    const now = Date.now();

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
  const now = Date.now();
  const overdueTasks = tasks.filter(
    (task) =>
      task.isReminder && task.status !== "completed" && isPast(task.dueDate)
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

    // Add repeating task indicator to the message
    const repeatingIndicator = task.isRepeating ? " (Repeating Task)" : "";

    await createNotification(
      {
        userId,
        type: "TASK_OVERDUE",
        priority,
        title: "⏰ Task Overdue",
        message: `"${task.title}" ${overdueMessage}${repeatingIndicator}`,
        actionText: "Complete Now",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        data: { daysOverdue, isRepeating: task.isRepeating },
        expiresAt: addDays(new Date(), 7).getTime(),
      },
      { id: taskNotificationDocId(task.id, "TASK_OVERDUE") }
    );
  }
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
  const now = Date.now();
  const tomorrow = endOfDay(addDays(new Date(), 1));
  const dueSoonTasks = tasks.filter(
    (task) =>
      task.isReminder &&
      task.status !== "completed" &&
      isBefore(task.dueDate, tomorrow) &&
      isAfter(task.dueDate, now)
  );

  for (const task of dueSoonTasks) {
    const priority: NotificationPriority = task.isPriority ? "HIGH" : "MEDIUM";

    // Add repeating task indicator to the message
    const repeatingIndicator = task.isRepeating ? " (Repeating Task)" : "";

    await createNotification(
      {
        userId,
        type: "TASK_DUE_SOON",
        priority,
        title: "📅 Task Due Soon",
        message: `"${task.title}" is due ${
          isToday(task.dueDate) ? "today" : "tomorrow"
        }${repeatingIndicator}`,
        actionText: "View Task",
        actionUrl: `/webapp/tasks`,
        taskId: task.id,
        data: { isRepeating: task.isRepeating },
        expiresAt: addDays(now, 7).getTime(),
      },
      { id: taskNotificationDocId(task.id, "TASK_DUE_SOON") }
    );
  }
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
      (new Date(task.dueDate).getHours() !== 23 &&
        new Date(task.dueDate).getMinutes() !== 59) //Default endTime
    ) {
      return false;
    }
    const { isDueToday } = canCompleteRepeatingTaskNow(task);
    return isDueToday;
  });

  for (const task of timeWindowTasks) {
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
      await createNotification(
        {
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
          expiresAt: addDays(new Date(), 1).getTime(),
        },
        { id: taskNotificationDocId(task.id, notificationType) }
      );
    }
  }
};

/**
  Generates achievement notification with a provided milestone type and milestone.
 - Expires in 30 days.
 - If the user has not enabled achievements, this function will do nothing.
 */
export const generateAchievementNotification = async (
  userId: string,
  achievementType: AchievementType,
  achievementId: string
): Promise<void> => {
  const user = await getUserById(userId);
  if (!user?.notifyAchievements) {
    return;
  }

  // Check if a notification for this specific achievement already exists
  // Include archived notifications in the check to prevent duplicates even if user archived it
  const existingNotifications = await getNotificationsByUserIdAdmin(
    userId,
    true,
    100
  );
  const hasExistingNotification = existingNotifications.some(
    (notification) =>
      notification.type === "ACHIEVEMENT_UNLOCKED" &&
      notification.data?.achievementId === achievementId
  );

  if (hasExistingNotification) {
    console.log(
      `Achievement notification for ${achievementId} already exists for user ${userId}. Skipping.`
    );
    return; // Prevent duplicate notifications
  }

  const achievementTitles: Record<string, string> = {
    streak_milestone: "🔥 Streak Milestone!",
    points_milestone: "🏆 Points Milestone!",
    task_completionist: "✅ Task Completionist!",
  };

  const numberMilestone = achievementId.split("_").at(-1);
  const achievementMessages: Record<string, string> = {
    streak_milestone: `You've achieved a new streak milestone! You've completed a new streak of ${numberMilestone}.`,
    points_milestone: `You've achieved a new points milestone! You've earned a total of ${numberMilestone} points.`,
    task_completionist: `You've achieved a new task completionist milestone! You've completed a total of ${numberMilestone} tasks.`,
  };

  // Create notification regardless of user.achievements check to avoid race conditions
  await createNotification(
    {
      userId,
      type: "ACHIEVEMENT_UNLOCKED",
      priority: "LOW",
      title: achievementTitles[achievementType],
      message: achievementMessages[achievementType],
      actionText: "View Achievement",
      actionUrl: "/webapp/profile",
      data: { achievementId },
      expiresAt: addDays(new Date(), 30).getTime(),
    },
    { id: `achievement_${userId}_${achievementId}` }
  );
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

  const now = new Date();
  const weekId = `${getISOWeekYear(now)}-${getISOWeek(now)}`;

  await createNotification(
    {
      userId,
      type: "WEEKLY_SUMMARY",
      priority: "LOW",
      title: "📊 Weekly Summary",
      message: `This week: ${weeklyStats.completedTasks}/${weeklyStats.totalTasks} tasks completed (${completionRate}%), ${weeklyStats.pointsEarned} points earned`,
      actionText: "View Dashboard",
      actionUrl: "/webapp",
      data: weeklyStats,
      expiresAt: addDays(new Date(), 7).getTime(),
    },
    { id: `weekly_${userId}_${weekId}` }
  );
};

/**
 * Cleans up expired notifications from Firestore
 */
export const cleanupExpiredNotifications = async (
  userId: string
): Promise<void> => {
  try {
    const notificationsRef = adminDb.collection("notifications");
    const now = Date.now();

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
  const inFlight = generateNotificationsInFlight.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const run = (async () => {
    try {
      await cleanupDuplicateNotifications(userId);
      await Promise.all([
        generateOverdueTaskNotifications(userId, tasks),
        generateDueSoonNotifications(userId, tasks),
        generateTimeWindowNotifications(userId, tasks),
      ]);
    } catch (error) {
      console.error("Error generating notifications for user:", error);
      throw error;
    }
  })().finally(() => {
    generateNotificationsInFlight.delete(userId);
  });

  generateNotificationsInFlight.set(userId, run);
  return run;
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

    const now = Date.now();
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
        createdAt: data.createdAt,
        readAt: data.readAt ? data.readAt : undefined,
        data: data.data || {},
        expiresAt: data.expiresAt ? data.expiresAt : undefined,
      } as Notification;

      if (!notification.expiresAt || notification.expiresAt > now) {
        unreadNotifications.push(notification);
      }
    });

    const uniqueUnread = dedupeNotifications(unreadNotifications);

    const stats: NotificationStats = {
      totalUnread: uniqueUnread.length,
      unreadByPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
      unreadByType: {},
    };

    uniqueUnread.forEach((notification) => {
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
