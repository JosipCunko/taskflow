"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { onAuthStateChanged, User } from "firebase/auth";
import { NotificationStats } from "@/app/_types/types";
import { getNotificationStats } from "@/app/_lib/notifications";
import { auth } from "@/app/_lib/firebase";
import { formatNotificationCount } from "@/app/_utils/utils";
import Link from "next/link";
import { Tooltip } from "react-tooltip";

export default function NotificationBell() {
  const { data: session } = useSession();
  //NotificationBell component is trying to fetch data before the FirebaseAuthProvider has finished signing in the user to Firebase client SDK.
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      // Wait for both NextAuth session AND Firebase auth to be ready
      if (!session?.user?.id || !firebaseUser) {
        setIsLoading(false);
        return;
      }

      try {
        const notificationStats = await getNotificationStats(session.user.id);
        setStats(notificationStats);
      } catch (error) {
        console.error("Error fetching notification stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Also update when page gains focus
    const handleFocus = () => {
      if (session?.user?.id && firebaseUser) {
        fetchStats();
      }
    };
    window.addEventListener("focus", handleFocus);

    // Listen for storage events (when notifications are updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "notifications-updated" &&
        session?.user?.id &&
        firebaseUser
      ) {
        fetchStats();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [session?.user?.id, firebaseUser]);

  if (!session?.user?.id || isLoading) {
    return (
      <Link
        href="/webapp/inbox"
        className="relative p-2 rounded-lg hover:bg-background-600 transition-colors"
      >
        <Bell size={20} className="text-text-low" />
      </Link>
    );
  }

  const hasUnreadNotifications = stats && stats.totalUnread > 0;
  const urgentCount = stats?.unreadByPriority.URGENT || 0;
  const highCount = stats?.unreadByPriority.HIGH || 0;
  const priorityCount = urgentCount + highCount;

  return (
    <Link
      href="/webapp/inbox"
      className="relative p-2 rounded-lg hover:bg-background-600 transition-colors group tooltip-container"
    >
      <Bell
        size={20}
        className={`
            focus:outline-none
            transition-colors
            ${hasUnreadNotifications ? "text-blue-500" : "text-text-low"}
            ${priorityCount > 0 ? "text-orange-500" : ""}
            ${urgentCount > 0 ? "text-red-500" : ""}
            group-hover:scale-110 transition-transform
            `}
        data-tooltip-id="notification-link"
        data-tooltip-content={`${stats?.totalUnread || 0} unread notifications`}
      />

      <Tooltip
        id="notification-link"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
      />

      {/* Notification badge */}
      {hasUnreadNotifications && (
        <div
          className={`
          absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full 
          flex items-center justify-center text-xs font-bold text-white
          ${
            urgentCount > 0
              ? "bg-red-500"
              : priorityCount > 0
              ? "bg-orange-500"
              : "bg-blue-500"
          }
          animate-pulse
        `}
        >
          {formatNotificationCount(stats.totalUnread)}
        </div>
      )}

      {/* Priority indicator */}
      {priorityCount > 0 && (
        <div
          className={`
          absolute -bottom-1 -right-1 w-2 h-2 rounded-full
          ${urgentCount > 0 ? "bg-red-400" : "bg-orange-400"}
          animate-bounce
        `}
        />
      )}
    </Link>
  );
}
