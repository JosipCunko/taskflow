import admin from "firebase-admin";
import { adminDb } from "./admin";

export async function sendNotificationToUser(
  userId: string,
  notification: {
    title: string;
    body: string;
    actionUrl?: string;
  }
) {
  // 1. Get user's FCM token from database
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const fcmToken = userDoc.data()?.fcmToken;

  if (!fcmToken) {
    console.log("User has no FCM token");
    return;
  }

  // 2. Send push notification using FCM Admin SDK
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      actionUrl: notification.actionUrl || "/webapp",
      type: "TASK_REMINDER",
    },
    token: fcmToken, // This is where the FCM token is used!
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
