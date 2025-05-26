import {
  BarChart4,
  Clock,
  CheckCircle2,
  Home,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Trophy,
  Star,
} from "lucide-react";
import { ReactNode } from "react";
import { getTasksByUserId } from "@/app/_lib/tasks";
import { authOptions } from "../_lib/auth";
import { getServerSession } from "next-auth";
import TaskCardSmall from "../_components/TaskCardSmall";
import { calculateTaskPoints, generateTaskTypes } from "../utils";
import { Task } from "../_types/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const userId = session.user.id;

  const allTasks = await getTasksByUserId(userId);

  const {
    todaysTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    completedTasks,
    completedTodayTasks,
    pendingTodayTasks,
  } = generateTaskTypes(allTasks);

  const averageDelayCount =
    delayedTasks.length > 0
      ? allTasks.reduce((acc, task) => acc + (task.delayCount || 0), 0) /
        delayedTasks.length
      : 0;

  const totalPoints = allTasks.reduce(
    (acc, task) => acc + calculateTaskPoints(task),
    0
  );
  const todayPoints = todaysTasks.reduce(
    (acc: number, task: Task) => acc + calculateTaskPoints(task),
    0
  );

  return (
    <div className="p-6 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500" />
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Today's Tasks"
          value={`${completedTodayTasks.length}/${todaysTasks.length}`}
          icon={<Clock className="text-primary" size={24} />}
          subtitle={`${pendingTodayTasks.length} pending`}
        />
        <DashboardCard
          title="Completed Tasks"
          value={completedTasks.length}
          icon={<CheckCircle2 className="text-success" size={24} />}
          subtitle="All time"
        />
        <DashboardCard
          title="Experience Points"
          value={totalPoints}
          icon={<BarChart4 className="text-accent" size={24} />}
          subtitle={`+${todayPoints} today`}
        />
        <DashboardCard
          title="Upcoming Tasks"
          value={upcomingTasks.length}
          icon={<Calendar className="text-info" size={24} />}
          subtitle="Next 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <h3 className="text-sm font-medium text-text-low mb-2">
                  Missed Tasks ({missedTasks.length})
                </h3>
                <div className="space-y-2">
                  {missedTasks.slice(0, 3).map((task: Task) => (
                    <TaskCardSmall key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            {delayedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-low mb-2">
                  Delayed Tasks ({delayedTasks.length})
                </h3>
                <div className="space-y-2">
                  {delayedTasks.slice(0, 3).map((task: Task) => (
                    <TaskCardSmall key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            {missedTasks.length === 0 && delayedTasks.length === 0 && (
              <p className="text-center text-text-low py-4">
                All tasks are up to date!
              </p>
            )}
          </div>
        </section>

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
                <div className="w-full bg-background-600 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${
                        (completedTodayTasks.length / todaysTasks.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {completedTodayTasks.length}
                    </p>
                    <p className="text-sm text-text-low">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {pendingTodayTasks.length}
                    </p>
                    <p className="text-sm text-text-low">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{todaysTasks.length}</p>
                    <p className="text-sm text-text-low">Total today</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-text-low py-4">
                No tasks for today
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-accent" />
            Task Performance
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">
                Task Efficiency
              </h3>
              <Star className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Completion Rate</span>
                <span className="font-medium">
                  {allTasks.length > 0
                    ? `${Math.round(
                        (completedTasks.length / allTasks.length) * 100
                      )}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Average Delays</span>
                <span className="font-medium">
                  {averageDelayCount.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">
                Points Overview
              </h3>
              <BarChart4 className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Total Points</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">
                  Today&apos;s Points
                </span>
                <span className="font-medium">{todayPoints}</span>
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">Task Health</h3>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Delayed Tasks</span>
                <span className="font-medium">{delayedTasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Success Rate</span>
                <span className="font-medium">
                  {allTasks.length > 0
                    ? `${Math.round(
                        (completedTasks.length /
                          (completedTasks.length + missedTasks.length)) *
                          100
                      )}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low">
            Upcoming Tasks
          </h2>
          <span className="text-sm text-text-low">Next 7 days</span>
        </div>
        <div className="space-y-4">
          {upcomingTasks.length > 0 ? (
            upcomingTasks
              .slice(0, 5)
              .map((task: Task) => <TaskCardSmall key={task.id} task={task} />)
          ) : (
            <p className="text-center text-text-low py-4">No upcoming tasks</p>
          )}
        </div>
      </section>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
}

function DashboardCard({ title, value, icon, subtitle }: DashboardCardProps) {
  return (
    <div className="bg-background-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-sm text-text-low mt-1">{subtitle}</p>}
    </div>
  );
}
