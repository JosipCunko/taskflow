"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Notification,
  NotificationStats,
  NotificationType,
} from "@/app/_types/types";
import NotificationCard from "@/app/_components/NotificationCard";
import {
  markAsReadAction,
  markAllAsReadAction,
  archiveNotificationAction,
  deleteNotificationAction,
  generateNotificationsAction,
} from "@/app/_lib/notificationActions";
import { handleToast } from "@/app/utils";
import {
  CheckCircle2,
  RefreshCw,
  Search,
  Bell,
  AlertTriangle,
  Clock,
  Trophy,
} from "lucide-react";
import Button from "./reusable/Button";

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

  // Auto-generate notifications when component mounts
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

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter((notification) => {
      // Search filter
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
      // Type filter
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
    startTransition(async () => {
      const result = await markAsReadAction(notificationId);
      handleToast(result);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        updateStats();
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    startTransition(async () => {
      const result = await markAllAsReadAction(unreadIds);
      handleToast(result);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        updateStats();
      }
    });
  };

  const handleArchive = async (notificationId: string) => {
    startTransition(async () => {
      const result = await archiveNotificationAction(notificationId);
      handleToast(result);

      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        updateStats();
      }
    });
  };

  const handleDelete = async (notificationId: string) => {
    startTransition(async () => {
      const result = await deleteNotificationAction(notificationId);
      handleToast(result);

      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        updateStats();
      }
    });
  };

  const handleRefresh = async () => {
    startTransition(async () => {
      const result = await generateNotificationsAction();
      if (result.success) {
        // Refresh the page to get updated notifications
        window.location.reload();
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
      value: "TASK_AT_RISK" as FilterType,
      label: "At Risk",
      icon: AlertTriangle,
    },
    {
      value: "ACHIEVEMENT_UNLOCKED" as FilterType,
      label: "Achievements",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Filter buttons */}
          {filterOptions.map((option) => {
            const Icon = option.icon;
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
                  text-nowrap gap-2 px-3 py-2 rounded-lg text-sm
                  ${
                    filter === option.value
                      ? "bg-primary-500/90 text-white"
                      : " text-text-low "
                  }
                `}
              >
                <Icon size={16} />
                {option.label}
                {count > 0 && (
                  <span
                    className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${
                      filter === option.value
                        ? "bg-white/20"
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

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-low"
              size={16}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background-700 border border-background-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </select>

          {/* Actions */}
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isPending || stats.totalUnread === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed text-nowrap "
          >
            <CheckCircle2 size={16} />
            Mark All Read
          </Button>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 bg-background-700 text-text-low rounded-lg text-sm font-medium hover:bg-background-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
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
