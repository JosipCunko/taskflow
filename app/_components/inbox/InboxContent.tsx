"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Notification,
  NotificationStats,
  NotificationType,
} from "@/app/_types/types";
import NotificationCard from "@/app/_components/inbox/NotificationCard";
import {
  markAsReadAction,
  markAllAsReadAction,
  archiveNotificationAction,
  deleteNotificationAction,
  generateNotificationsAction,
} from "@/app/_lib/notificationActions";
import { handleToast } from "@/app/_utils/utils";
import {
  CheckCircle2,
  RefreshCw,
  Search,
  Bell,
  AlertTriangle,
  Clock,
  Trophy,
} from "lucide-react";
import Button from "../reusable/Button";

interface InboxContentProps {
  initialNotifications: Notification[];
  initialStats: NotificationStats;
}

type FilterType = "all" | "unread" | "priority" | NotificationType;
type SortType = "newest" | "oldest" | "priority";

export default function InboxContent({
  initialNotifications,
  initialStats,
}: InboxContentProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [stats, setStats] = useState(initialStats);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const generateNotifications = async () => {
      try {
        await generateNotificationsAction();
      } catch (error) {
        console.error("Error auto-generating notifications:", error);
      }
    };

    generateNotifications();
  }, []);

  const filteredNotifications = notifications
    .filter((notification) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((notification) => {
      switch (filter) {
        case "all":
          return true;
        case "unread":
          return !notification.isRead;
        case "priority":
          return (
            notification.priority === "HIGH" ||
            notification.priority === "URGENT"
          );
        default:
          return notification.type === filter;
      }
    })
    .sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "priority":
          const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update first
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      )
    );
    updateStats();

    startTransition(async () => {
      try {
        localStorage.setItem("notifications-updated", Date.now().toString());
        await markAsReadAction(notificationId);
        updateStats();
      } catch (error) {
        console.error("Error marking notification as read:", error);
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: false, readAt: undefined }
              : n
          )
        );
        updateStats();
        // Maybe trigger notification bell update again after revert
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update first
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
    );
    updateStats();

    startTransition(async () => {
      try {
        localStorage.setItem("notifications-updated", Date.now().toString());
        await markAllAsReadAction(unreadIds);
        updateStats();
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((n) =>
            unreadIds.includes(n.id)
              ? { ...n, isRead: false, readAt: undefined }
              : n
          )
        );
        updateStats();
      }
    });
  };

  const handleArchive = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    updateStats();

    startTransition(async () => {
      try {
        await archiveNotificationAction(notificationId);

        // We would need to revert, but since we removed it from the list,
        // it's better to just refresh the data
        //window.location.reload(); => revalidatePath already happens in SA
      } catch (error) {
        console.error("Error archiving notification:", error);
        window.location.reload();
      }
    });
  };

  const handleDelete = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    updateStats();

    startTransition(async () => {
      try {
        const result = await deleteNotificationAction(notificationId);
        handleToast(result);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting notification:", error);
        window.location.reload();
      }
    });
  };

  const handleRefresh = async () => {
    startTransition(async () => {
      try {
        await generateNotificationsAction();
        window.location.reload(); // Keep reload only for refresh since we're generating new notifications
      } catch (error) {
        console.error("Error refreshing notifications:", error);
        handleToast({
          success: false,
          error: "Failed to refresh notifications",
        });
      }
    });
  };

  const updateStats = () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const newStats: NotificationStats = {
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
      newStats.unreadByPriority[notification.priority]++;
      newStats.unreadByType[notification.type] =
        (newStats.unreadByType[notification.type] || 0) + 1;
    });

    setStats(newStats);
  };

  const filterOptions = [
    { value: "all" as FilterType, label: "All", icon: Bell },
    { value: "unread" as FilterType, label: "Unread", icon: Bell },
    { value: "priority" as FilterType, label: "Priority", icon: AlertTriangle },
    { value: "TASK_OVERDUE" as FilterType, label: "Overdue", icon: Clock },
    {
      value: "ACHIEVEMENT_UNLOCKED" as FilterType,
      label: "Achievements",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 pb-2">
          {filterOptions.map((option) => {
            const count =
              option.value === "all"
                ? notifications.length
                : option.value === "unread"
                ? stats.totalUnread
                : option.value === "priority"
                ? stats.unreadByPriority.HIGH + stats.unreadByPriority.URGENT
                : stats.unreadByType[option.value as NotificationType] || 0;

            return (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                variant="secondary"
                className={`
                  flex-shrink-0 text-nowrap gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm min-w-fit
                  ${
                    filter === option.value
                      ? "bg-primary-500/90 text-white hover:bg-primary-500/70"
                      : " text-text-low "
                  }
                `}
              >
                <option.icon
                  size={14}
                  className="sm:w-4 sm:h-4 flex-shrink-0"
                />

                <span className="whitespace-nowrap">{option.label}</span>
                {count > 0 && (
                  <span
                    className={`
                    px-1 sm:px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap
                    ${
                      filter === option.value
                        ? "bg-red-500/20"
                        : "bg-background-600"
                    }
                  `}
                  >
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-low"
              size={16}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-700 border border-background-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="flex-shrink-0 px-2 sm:px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-fit"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
            </select>

            <Button
              onClick={handleMarkAllAsRead}
              disabled={isPending || stats.totalUnread === 0}
              className="flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed text-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm gap-1 sm:gap-2 min-w-fit"
            >
              <CheckCircle2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Mark All Read</span>
              <span className="sm:hidden">Read All</span>
            </Button>

            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-background-700 text-text-low rounded-lg text-xs sm:text-sm font-medium hover:bg-background-600 disabled:opacity-50 transition-colors min-w-fit"
            >
              <RefreshCw
                size={14}
                className={`sm:w-4 sm:h-4 flex-shrink-0 ${
                  isPending ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-text-low mb-4" />
            <h3 className="text-lg font-medium text-text-low mb-2">
              {searchQuery
                ? "No matching notifications"
                : filter === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </h3>
            <p className="text-text-low">
              {searchQuery
                ? "Try adjusting your search terms"
                : filter === "unread"
                ? "You're all caught up!"
                : "Notifications will appear here when you have task alerts and updates."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Stats summary */}
      {notifications.length > 0 && (
        <div className="mt-8 p-4 bg-background-700 rounded-lg">
          <h3 className="text-sm font-medium text-text-low mb-2">
            Notification Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-low">Total:</span>
              <span className="ml-2 font-medium">{notifications.length}</span>
            </div>
            <div>
              <span className="text-text-low">Unread:</span>
              <span className="ml-2 font-medium text-blue-400">
                {stats.totalUnread}
              </span>
            </div>
            <div>
              <span className="text-text-low">High Priority:</span>
              <span className="ml-2 font-medium text-orange-400">
                {stats.unreadByPriority.HIGH}
              </span>
            </div>
            <div>
              <span className="text-text-low">Urgent:</span>
              <span className="ml-2 font-medium text-red-400">
                {stats.unreadByPriority.URGENT}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
