import {
  Clock,
  CheckCircle2,
  Home,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Trophy,
  Star,
  Repeat,
  FileText,
  Zap,
  Target,
} from "lucide-react";
import { Task } from "../_types/types";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  generateTaskTypes,
  calculateTimeManagementStats,
} from "../_utils/utils";
import { authOptions } from "../_lib/auth";
import { loadNotesByUserId } from "../_lib/notes";
import { getUserById } from "../_lib/user-admin";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import { getNotificationStats } from "../_lib/notifications-admin";

import NotificationSummary from "../_components/inbox/NotificationSummary";
import TaskCardSmall from "../_components/TaskCardSmall";
import RepeatingTaskCard from "../_components/RepeatingTaskCard";
import AnalyticsDashboard from "../_components/AnalyticsDashboard";
import NotificationSetup from "../_components/NotificationSetup";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [user, allTasks, notes, notificationStats] = await Promise.all([
    getUserById(userId),
    getTasksByUserId(userId),
    loadNotesByUserId(userId),
    getNotificationStats(userId),
  ]);
  if (!user) {
    redirect("/login");
  }

  const {
    regularTasks,
    completedTodayRegularTasks,
    incompleteRegularTodayTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    todaysTasks,
    //pendingTasks,
    pendingTodayTasks,
    repeatingTasks,
    incompleteRepeatingTodayTasks,
    repeatingTasksDueToday,
    completedTodayRepeatingTasks,
    //completedPriorityTasks,
    pendingPriorityTasks,
    //completedTasks,
  } = generateTaskTypes(allTasks);

  const timeManagementStats = calculateTimeManagementStats(regularTasks);
  const totalPoints = user.rewardPoints;

  const todayPoints = [
    ...completedTodayRegularTasks,
    ...completedTodayRepeatingTasks,
  ].reduce((acc: number, task: Task) => acc + task.points, 0);

  const potentialTodayPoints = [
    ...incompleteRegularTodayTasks,
    ...incompleteRepeatingTodayTasks,
  ].reduce((acc: number, task: Task) => acc + task.points, 0);

  return (
    <div className="container h-full mx-auto p-1 sm:p-6 space-y-8 overflow-y-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Dashboard</span>
        </h1>
        <p className="text-text-low mt-2">
          Welcome back! Here&apos;s your productivity overview for today.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Today's Tasks"
          value={`${
            completedTodayRegularTasks.length +
            completedTodayRepeatingTasks.length
          }/${todaysTasks.length}`}
          icon={<Clock className="text-primary-500" size={24} />}
          subtitle={`${pendingTodayTasks.length} pending`}
        />
        <DashboardCard
          title="Reward Points"
          value={totalPoints}
          icon={<Trophy className="text-accent" size={24} />}
          subtitle={
            potentialTodayPoints > 0
              ? `${potentialTodayPoints} pts available today`
              : "No points available today"
          }
          extra={
            <div className="flex justify-between items-center text-xs">
              <span className=" text-text-low">Today&apos;s Impact: </span>
              <span
                className={`ml-1 ${
                  todayPoints >= 0 ? "text-success" : "text-error"
                }`}
              >
                {todayPoints >= 0 ? "+" : ""}
                {todayPoints}
              </span>
            </div>
          }
        />
        <DashboardCard
          title="Current Streak"
          value={`${user.currentStreak} days`}
          icon={<Zap className="text-warning" size={24} />}
          subtitle={`Best: ${user.bestStreak} days`}
        />
        <DashboardCard
          title="Success Rate"
          value={`${timeManagementStats.onTimeCompletionRate}%`}
          icon={<Target className="text-success" size={24} />}
          subtitle="On-time completion"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Completed Tasks"
          value={user.completedTasksCount}
          icon={<CheckCircle2 className="text-success" size={24} />}
          subtitle="All time"
        />
        <DashboardCard
          title="Notes Created"
          value={notes.length}
          icon={<FileText className="text-info" size={24} />}
          subtitle="Knowledge base"
        />
        <DashboardCard
          title="Missed Tasks"
          value={missedTasks.length}
          icon={<AlertTriangle className="text-error" size={24} />}
          subtitle="Need attention"
        />
        <DashboardCard
          title="Repeating Tasks"
          value={repeatingTasks.length}
          icon={<Repeat className="text-purple-400" size={24} />}
          subtitle={`${repeatingTasksDueToday.length} due today`}
        />
      </div>

      <AnalyticsDashboard user={user} />

      <NotificationSetup />

      {/* Today's Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-low flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-success" />
              Today&apos;s Progress
            </h2>
          </div>
          <div className="space-y-4">
            {todaysTasks.length > 0 ? (
              <>
                <div className="w-full rounded-full h-2.5">
                  <div
                    className="bg-success h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((completedTodayRegularTasks.length +
                          completedTodayRepeatingTasks.length) /
                          todaysTasks.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {completedTodayRegularTasks.length +
                        completedTodayRepeatingTasks.length}
                    </p>
                    <p className="text-sm text-text-low">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {pendingTodayTasks.length}
                    </p>
                    <p className="text-sm text-text-low">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {potentialTodayPoints}
                    </p>
                    <p className="text-sm text-text-low">Points available</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="text-text-low">No tasks scheduled for today</p>
                <p className="text-sm text-text-gray">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-low flex items-center">
              <Star className="w-5 h-5 mr-2 text-warning" />
              Priority Tasks
            </h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingPriorityTasks.length > 0 ? (
              pendingPriorityTasks
                .slice(0, 4)
                .map((task: Task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="text-text-low">No priority tasks</p>
                <p className="text-sm text-text-gray">
                  Great job staying on top of things!
                </p>
              </div>
            )}
          </div>
        </section>

        <NotificationSummary notificationStats={notificationStats} />
      </div>

      {/* Tasks Needing Attention */}
      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
            Tasks Needing Attention
          </h2>
        </div>
        <div className="space-y-4">
          {missedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-error mb-2 flex items-center">
                <span className="w-2 h-2 bg-error rounded-full mr-2"></span>
                Missed Tasks ({missedTasks.length})
              </h3>
              <div className="space-y-2">
                {missedTasks.slice(0, 3).map((task: Task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))}
                {missedTasks.length > 3 && (
                  <p className="text-sm text-text-gray px-3">
                    +{missedTasks.length - 3} more missed tasks
                  </p>
                )}
              </div>
            </div>
          )}
          {delayedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-warning mb-2 flex items-center">
                <span className="w-2 h-2 bg-warning rounded-full mr-2"></span>
                Delayed Tasks ({delayedTasks.length})
              </h3>
              <div className="space-y-2">
                {delayedTasks.slice(0, 3).map((task: Task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))}
                {delayedTasks.length > 3 && (
                  <p className="text-sm text-text-gray px-3">
                    +{delayedTasks.length - 3} more delayed tasks
                  </p>
                )}
              </div>
            </div>
          )}
          {missedTasks.length === 0 && delayedTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
              <p className="text-text-low">All tasks are up to date!</p>
              <p className="text-sm text-text-gray">
                There are no missed or delayed tasks! You&apos;re doing great!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Tasks */}
      <section className="bg-background-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-info" />
            Upcoming Tasks
          </h2>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingTasks.length > 0 ? (
            upcomingTasks
              .slice(0, 5)
              .map((task: Task) => <TaskCardSmall key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-info mx-auto mb-2" />
              <p className="text-text-low">No upcoming tasks</p>
              <p className="text-sm text-text-gray">Your schedule is clear!</p>
            </div>
          )}
        </div>
      </section>

      {/* Repeating Tasks */}
      {repeatingTasks.length > 0 && (
        <section className="bg-background-700 rounded-lg p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-low flex items-center">
              <Repeat className="w-5 h-5 mr-2 text-purple-400" />
              Repeating Tasks
            </h2>
            <span className="text-sm text-text-low">
              {repeatingTasksDueToday.length} due today
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-background-500 scrollbar-track-transparent">
            {repeatingTasks.map((task: Task) => (
              <RepeatingTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  subtitle,
  extra,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-low">{value}</p>
      {subtitle && <p className="text-sm text-text-low mt-1">{subtitle}</p>}
      {extra && <div className="absolute bottom-0 right-0">{extra}</div>}
    </div>
  );
}
