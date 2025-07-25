import { NotificationStats } from "@/app/_types/types";
import { Bell, AlertTriangle, Clock, Trophy } from "lucide-react";
import Link from "next/link";

export default function NotificationSummary({
  notificationStats,
}: {
  notificationStats: NotificationStats;
}) {
  if (!notificationStats || notificationStats.totalUnread === 0) {
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

  const urgentCount = notificationStats.unreadByPriority.URGENT;
  const highCount = notificationStats.unreadByPriority.HIGH;
  const overdueTasks = notificationStats.unreadByType.TASK_OVERDUE || 0;
  const achievements = notificationStats.unreadByType.ACHIEVEMENT_UNLOCKED || 0;

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
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-low">Total Unread</span>
          <span className="text-lg font-semibold text-blue-400">
            {notificationStats.totalUnread}
          </span>
        </div>

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

        {(overdueTasks > 0 || achievements > 0) && (
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
