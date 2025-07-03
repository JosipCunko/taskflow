"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  markNotificationAsRead,
  markNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  generateNotificationsForUser,
  cleanupExpiredNotifications,
} from "./notifications-admin";
import { getTasksByUserId } from "./tasks-admin";
import { ActionResult } from "../_types/types";
import { revalidatePath } from "next/cache";

export async function markAsReadAction(
  notificationId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await markNotificationAsRead(notificationId);
    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");

    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsReadAction(
  notificationIds: string[]
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await markNotificationsAsRead(notificationIds);
    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");
    return { success: true, message: "All notifications marked as read" };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}

export async function archiveNotificationAction(
  notificationId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await archiveNotification(notificationId);
    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");
    return { success: true, message: "Notification archived" };
  } catch (error) {
    console.error("Error archiving notification:", error);
    return { success: false, error: "Failed to archive notification" };
  }
}

export async function deleteNotificationAction(
  notificationId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteNotification(notificationId);
    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");
    return { success: true, message: "Notification deleted" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function generateNotificationsAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const tasks = await getTasksByUserId(session.user.id);
    await generateNotificationsForUser(session.user.id, tasks);
    await cleanupExpiredNotifications(session.user.id);

    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");

    return { success: true, message: "Notifications updated" };
  } catch (error) {
    console.error("Error generating notifications:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}
