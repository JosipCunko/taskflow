"use client";

import { useState, useEffect } from "react";
import { NotificationStats } from "@/app/_types/types";
import { getNotificationStats } from "@/app/_lib/notifications";
import { Bell, AlertTriangle, Clock, Trophy } from "lucide-react";
import Link from "next/link";

interface NotificationSummaryProps {
  userId: string;
}

export default function NotificationSummary({
  userId,
}: NotificationSummaryProps) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const notificationStats = await getNotificationStats(userId);
        setStats(notificationStats);
      } catch (error) {
        console.error("Error fetching notification stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-background-700 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-background-600 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-background-600 rounded w-1/2"></div>
          <div className="h-3 bg-background-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalUnread === 0) {
    return (
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-low flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-400" />
            Notifications
          </h3>
        </div>
        <div className="text-center py-4">
          <Bell className="mx-auto h-8 w-8 text-text-low mb-2 opacity-50" />
          <p className="text-sm text-text-low">All caught up!</p>
          <p className="text-xs text-text-low mt-1">No new notifications</p>
        </div>
      </div>
    );
  }

  const urgentCount = stats.unreadByPriority.URGENT;
  const highCount = stats.unreadByPriority.HIGH;
  const overdueTasks = stats.unreadByType.TASK_OVERDUE || 0;
  const atRiskTasks = stats.unreadByType.TASK_AT_RISK || 0;
  const achievements = stats.unreadByType.ACHIEVEMENT_UNLOCKED || 0;

  return (
    <div className="bg-background-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-low flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-400" />
          Notifications
        </h3>
        <Link
          href="/webapp/inbox"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {/* Total unread */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-low">Total Unread</span>
          <span className="text-lg font-semibold text-blue-400">
            {stats.totalUnread}
          </span>
        </div>

        {/* Priority breakdown */}
        {(urgentCount > 0 || highCount > 0) && (
          <div className="border-t border-background-600 pt-3">
            <div className="text-xs text-text-low mb-2">Priority Alerts</div>
            {urgentCount > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-red-400 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </span>
                <span className="text-sm font-medium text-red-400">
                  {urgentCount}
                </span>
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-400 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  High
                </span>
                <span className="text-sm font-medium text-orange-400">
                  {highCount}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Key notification types */}
        {(overdueTasks > 0 || atRiskTasks > 0 || achievements > 0) && (
          <div className="border-t border-background-600 pt-3">
            <div className="text-xs text-text-low mb-2">Key Alerts</div>
            {overdueTasks > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-orange-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Overdue Tasks
                </span>
                <span className="text-sm font-medium text-orange-400">
                  {overdueTasks}
                </span>
              </div>
            )}
            {atRiskTasks > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-red-400 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  At Risk Tasks
                </span>
                <span className="text-sm font-medium text-red-400">
                  {atRiskTasks}
                </span>
              </div>
            )}
            {achievements > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-400 flex items-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  New Achievements
                </span>
                <span className="text-sm font-medium text-yellow-400">
                  {achievements}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="pt-3">
          <Link
            href="/webapp/inbox"
            className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Manage Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
