import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Notification, NotificationStats } from "../_types/types";
import { isAfter } from "date-fns";

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
 * Gets all notifications for a user
 */
export const getNotificationsByUserId = async (
  userId: string,
  includeArchived = false,
  limitCount = 50
): Promise<Notification[]> => {
  if (!userId) {
    console.warn("Invalid userId in getNotificationsByUserId");
    return [];
  }

  try {
    const notificationsRef = collection(db, "notifications");
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
