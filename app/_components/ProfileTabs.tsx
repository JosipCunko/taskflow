"use client";
import {
  BarChart3,
  Bell,
  Clock,
  Settings,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ActivityLog, Task, userProfileType } from "../_types/types";
import {
  calculateConsistencyStats,
  calculateTimeManagementStats,
  generateTaskTypes,
  getTaskIconByName,
} from "../utils";
import { formatDistanceToNowStrict } from "date-fns";
import TaskCardSmall from "./TaskCardSmall";
import Checkbox from "./reusable/Checkbox";
import { updateUser } from "../_lib/user";
import { handleToast } from "../utils";

export default function ProfileTabs({
  tasks,
  activityLogs,
  userProfileData,
}: {
  tasks: Task[];
  activityLogs: ActivityLog[];
  userProfileData: userProfileType;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );
  const categorizedTasks = useMemo(() => generateTaskTypes(tasks), [tasks]);
  const timeManagementStats = useMemo(
    () => calculateTimeManagementStats(tasks || []),
    [tasks]
  );
  const consistencyStats = useMemo(
    () => calculateConsistencyStats(categorizedTasks.completedTasks),
    [categorizedTasks.completedTasks]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const getActivityDisplayInfo = (
    activityType: ActivityLog["type"]
  ): string => {
    switch (activityType) {
      case "TASK_COMPLETED":
        return "Completed task";
      case "TASK_CREATED":
        return "Created new task";
      case "TASK_UPDATED":
        return "Updated task";
      case "EXPERIENCE_RATED":
        return "Rated task experience";
      case "TASK_DELAYED":
        return "Delayed task";
      case "TASK_MISSED":
        return "Marked task as missed";
      case "TASK_DELETED":
        return "Deleted task";
      default:
        return "Activity";
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex space-x-4 border-b border-divider">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-4 px-2 flex items-center gap-2 ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-text-low hover:text-text"
          }`}
        >
          <Trophy size={20} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-4 px-2 flex items-center gap-2 ${
            activeTab === "settings"
              ? "text-primary border-b-2 border-primary"
              : "text-text-low hover:text-text"
          }`}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-text-high">
                  Task Master
                </h3>
                <Star className="text-yellow-400" size={20} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Completed Tasks</span>
                  <span className="font-semibold text-text-high">
                    {categorizedTasks.completedTasks?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Success Rate</span>
                  <span className="font-semibold text-text-high">
                    {timeManagementStats.totalRelevantTasksForTiming > 0
                      ? `${Math.round(
                          (categorizedTasks.completedTasks?.length /
                            timeManagementStats.totalRelevantTasksForTiming) *
                            100
                        )}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-text-high">
                  Time Wizard
                </h3>
                <Clock className="text-blue-400" size={20} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-low">On-time Tasks</span>
                  <span className="font-semibold text-text-high">
                    {timeManagementStats.onTimeTasksCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Average Delay</span>
                  <span className="font-semibold text-text-high">
                    {timeManagementStats.averageDelayDays > 0
                      ? `${timeManagementStats.averageDelayDays} day(s)`
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-low">On-time Rate</span>
                  <span className="font-semibold text-text-high">
                    {timeManagementStats.onTimeCompletionRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-text-high">
                  Consistency King
                </h3>
                <Zap className="text-green-400" size={20} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Current Streak</span>
                  <span className="font-semibold text-text-high">
                    {consistencyStats.currentStreakDays} day(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Best Streak</span>
                  <span className="font-semibold text-text-high">
                    {consistencyStats.bestStreakDays} day(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-low">Today&apos;s Progress</span>
                  <span className="font-semibold text-text-high">
                    {categorizedTasks.todaysTasks?.length > 0 &&
                    categorizedTasks.pendingTodayTasks?.length > 0 // Check if there are any tasks for today before calculating
                      ? `${categorizedTasks.completedTodayTasks?.length} / ${categorizedTasks.todaysTasks?.length}`
                      : categorizedTasks.todaysTasks?.length === 0
                      ? "No tasks today"
                      : "All done!"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-high">
              Recent Activity
            </h3>
            {activityLogs && activityLogs.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {" "}
                {/* Added custom-scrollbar */}
                {activityLogs.map((activity) => {
                  const IconComponent = getTaskIconByName(
                    activity.activityIcon
                  );
                  const activityTitle = getActivityDisplayInfo(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="py-2.5 border-b border-divider last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${activity.activityColor}`,
                            }}
                          >
                            <IconComponent size={16} />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-sm text-text-high">
                              {activityTitle}
                            </p>
                            {/* Render TaskCardSmall if taskSnapshot exists, otherwise general details */}
                            {activity.taskSnapshot &&
                            activity.taskSnapshot.title ? (
                              <div className="mt-1.5">
                                <TaskCardSmall
                                  task={activity.taskSnapshot as Task}
                                />
                              </div>
                            ) : (
                              activity.details && (
                                <p className="text-xs text-text-low mt-0.5">
                                  {activity.details}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-text-gray flex-shrink-0 ml-2 pt-1">
                          {formatDistanceToNowStrict(
                            new Date(activity.timestamp),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3
                  size={32}
                  className="mx-auto text-text-medium mb-2"
                />
                <p className="text-text-medium text-sm">
                  No recent activity to display.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6 animate-fadeIn">
          {/* ... (Settings sections as before, using Checkbox component) ... */}
          {/* Notification Settings */}
          <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-primary-400" />
              <h3 className="text-lg font-semibold text-text-high">
                Notification Settings
              </h3>
            </div>
            <div className="space-y-4">
              <Checkbox
                id="taskReminders"
                name="taskReminders"
                label={
                  <div>
                    <p className="font-medium text-text-high">Task Reminders</p>
                    <p className="text-sm text-text-low">
                      Get notified about upcoming tasks
                    </p>
                  </div>
                }
                checked={userProfileData.notifyReminders}
                onChange={async (e) => {
                  setIsLoading(true);
                  const res = await updateUser(userProfileData.id, {
                    notifyReminders: e.target.checked,
                  });

                  handleToast(res);
                  setIsLoading(false);
                }}
                disabled={isLoading}
              />
              <Checkbox
                id="achievementAlerts"
                name="achievementAlerts"
                label={
                  <div>
                    <p className="font-medium text-text-high">
                      Achievement Alerts
                    </p>
                    <p className="text-sm text-text-low">
                      Get notified about new achievements & reward points
                    </p>
                  </div>
                }
                checked={userProfileData.notifyAchievements}
                onChange={async (e) => {
                  setIsLoading(true);
                  const res = await updateUser(userProfileData.id, {
                    notifyAchievements: e.target.checked,
                  });

                  handleToast(res);
                  setIsLoading(false);
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={20} className="text-primary-400" />
              <h3 className="text-lg font-semibold text-text-high">
                Display Settings
              </h3>
            </div>
            <div className="space-y-4">
              <Checkbox
                id="darkMode"
                name="darkMode"
                label={
                  <div>
                    <p className="font-medium text-text-high">Dark Mode</p>
                    <p className="text-sm text-text-low">
                      App is currently in dark mode
                    </p>
                  </div>
                }
                checked={darkModeEnabled}
                onChange={(e) => {
                  setDarkModeEnabled(e.target.checked);
                }}
                disabled
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
