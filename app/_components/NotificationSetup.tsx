"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, BellOff, Settings } from "lucide-react";
import {
  requestNotificationPermission,
  onForegroundMessage,
  saveNotificationToken,
  isNotificationSupported,
  getNotificationPermission,
} from "@/app/_lib/fcm";
import { trackNotificationEvent } from "@/app/_lib/analytics";
import { customToast } from "@/app/_utils/toasts";
import { NotificationType } from "../_types/types";

//Permission request and notification setup
export default function NotificationSetup() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());

    // Set up foreground message listener
    if (isNotificationSupported()) {
      const unsubscribe = onForegroundMessage((payload) => {
        console.log("Received foreground notification:", payload);

        // Track notification received
        trackNotificationEvent("notification_clicked", {
          notification_type: payload.data?.type as NotificationType,
          action_taken: "clicked",
        });

        if (payload.notification?.title) {
          customToast(
            "Info",
            `${payload.notification.title}: ${payload.notification.body}`
          );
        }
      });

      return unsubscribe;
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported) {
      customToast(
        "Error",
        "Push notifications are not supported in this browser"
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("Requesting notification permission...");
      const token = await requestNotificationPermission();
      console.log("Permission granted, token received:", !!token);

      if (token) {
        console.log("Saving token to backend...");
        // Save token to backend
        await saveNotificationToken(token);
        setPermission("granted");

        // Track analytics
        trackNotificationEvent("notification_clicked", {
          action_taken: "clicked",
        });

        customToast("Success", "🔔 Push notifications enabled!");
      } else {
        setPermission("denied");
        customToast("Error", "Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);

      if (error instanceof Error) {
        if (error.message.includes("VAPID key")) {
          customToast("Error", "Configuration error: VAPID key missing");
        } else if (error.message.includes("save notification token")) {
          customToast("Error", "Failed to save notification settings");
        } else {
          customToast(
            "Error",
            `Failed to set up notifications: ${error.message}`
          );
        }
      } else {
        customToast("Error", "Failed to set up notifications");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    // For now, we'll just show instructions since we can't programmatically revoke permissions
    customToast(
      "Info",
      "To disable notifications, go to your browser settings and block notifications for this site"
    );
  };

  if (!session?.user?.id || !isSupported) {
    return null;
  }

  if (permission === "granted") {
    return (
      <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="text-success" size={20} />
          <div>
            <h3 className="font-medium text-success">Notifications Enabled</h3>
            <p className="text-sm text-text-low">
              You&apos;ll receive push notifications for important tasks
            </p>
          </div>
        </div>
        <button
          onClick={handleDisableNotifications}
          className="px-3 py-1 text-sm bg-background-600 hover:bg-background-500 rounded-md transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellOff className="text-warning" size={20} />
          <div>
            <h3 className="font-medium text-warning">Notifications Blocked</h3>
            <p className="text-sm text-text-low">
              Enable notifications in browser settings to get task reminders
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-sm bg-warning/20 hover:bg-warning/30 text-warning rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Bell className="text-primary" size={20} />
        <div>
          <h3 className="font-medium text-primary">
            Enable Push Notifications
          </h3>
          <p className="text-sm text-text-low">
            Get notified about important tasks and deadlines
          </p>
        </div>
      </div>
      <button
        onClick={handleRequestPermission}
        disabled={isLoading}
        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Bell size={16} />
        )}
        <span>{isLoading ? "Setting up..." : "Enable"}</span>
      </button>
    </div>
  );
}
