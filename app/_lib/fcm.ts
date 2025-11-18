//FCM utilities
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from "firebase/messaging";
import { app } from "./firebase";

/* Workflow
  Generation: User visits app → browser creates unique token
  Storage: Token saved to user's database record
  Notification Sending:
  - Your server fetches user's token
  - Sends notification to Firebase with that token
  - Firebase delivers to user's browser
  - Service worker displays notification
*/

// Initialize messaging (only in browser)
let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
  }
}

// Register service worker for background notifications
const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | void> => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Service worker registration skipped in development.");
      } else {
        console.warn("Service workers not supported");
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);

      // Wait a bit for service worker to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  };

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (!messaging) {
    console.warn("Firebase Messaging not available");
    return null;
  }

  // Check if VAPID key is configured
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error(
      "VAPID key is not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your environment variables."
    );
    throw new Error("VAPID key is not configured");
  }

  try {
    // Register service worker first
    await registerServiceWorker();

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void
) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    // Show browser notification if permission granted
    if (Notification.permission === "granted" && payload.notification) {
      new Notification(payload.notification.title || "New Notification", {
        body: payload.notification.body,
        icon: payload.notification.icon || "/icon-512.png",
        badge: "/icon-512.png",
        tag: payload.data?.type || "taskflow-notification",
        data: payload.data,
      });
    }

    callback(payload);
  });
};

// Send notification token to server for storage
export const saveNotificationToken = async (token: string): Promise<void> => {
  try {
    const response = await fetch("/api/notifications/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server response:", errorData);
      throw new Error(`Failed to save notification token: ${response.status}`);
    }

    const result = await response.json();
    console.log("Token saved successfully:", result);
  } catch (error) {
    console.error("Error saving notification token:", error);
    throw error;
  }
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    messaging !== null
  );
};

// Get current notification permission status
export const getNotificationPermission = (): NotificationPermission | null => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  return Notification.permission;
};
