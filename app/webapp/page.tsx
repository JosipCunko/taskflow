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
  Award,
  Brain,
} from "lucide-react";
import { ReactNode } from "react";
import { getTasksByUserId } from "@/app/_lib/tasks";
import { authOptions } from "../_lib/auth";
import { getServerSession } from "next-auth";
import TaskCardSmall from "../_components/TaskCardSmall";
import {
  calculateTaskPoints,
  calculatePotentialTaskPoints,
  generateTaskTypes,
  calculateTimeManagementStats,
  calculateConsistencyStats,
} from "../utils";
import { Task } from "../_types/types";
import RepeatingTaskCardSmall from "../_components/RepeatingTaskCardSmall";
import { loadNotesByUserId } from "../_lib/notes";
import { isTaskDueOn } from "../utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const userId = session.user.id;

  const [allTasks, notes] = await Promise.all([
    getTasksByUserId(userId),
    loadNotesByUserId(userId),
  ]);

  const regularTasks = allTasks.filter((task) => !task.isRepeating);
  const repeatingTasks = allTasks.filter((task) => task.isRepeating);
  const priorityTasks = regularTasks.filter(
    (task) => task.isPriority && task.status !== "completed"
  );

  const {
    todaysTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    completedTasks,
    completedTodayTasks,
    pendingTodayTasks,
  } = generateTaskTypes(regularTasks);

  // Repeating tasks due today
  const repeatingTasksDueToday = repeatingTasks.filter((task) =>
    isTaskDueOn(task, new Date())
  );

  const timeManagementStats = calculateTimeManagementStats(regularTasks);
  const consistencyStats = calculateConsistencyStats(completedTasks);

  const totalPoints = session.user.rewardPoints;
  const todayPoints = todaysTasks.reduce(
    (acc: number, task: Task) => acc + calculateTaskPoints(task),
    0
  );

  // Calculate potential points available today (for incomplete tasks)
  const potentialTodayPoints = [...todaysTasks, ...repeatingTasksDueToday]
    .filter((task) => task.status !== "completed")
    .reduce(
      (acc: number, task: Task) => acc + calculatePotentialTaskPoints(task),
      0
    );

  return (
    <div className="p-6 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500" />
          Dashboard
        </h1>
        <p className="text-text-low mt-2">
          Welcome back! Here&apos;s your productivity overview for today.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Today's Tasks"
          value={`${completedTodayTasks.length}/${
            todaysTasks.length + repeatingTasksDueToday.length
          }`}
          icon={<Clock className="text-primary" size={24} />}
          subtitle={`${
            pendingTodayTasks.length + repeatingTasksDueToday.length
          } pending`}
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
        />
        <DashboardCard
          title="Current Streak"
          value={`${consistencyStats.currentStreakDays} days`}
          icon={<Zap className="text-warning" size={24} />}
          subtitle={`Best: ${consistencyStats.bestStreakDays} days`}
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
          value={completedTasks.length}
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

      {/* Today's Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-low flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-success" />
              Today&apos;s Progress
            </h2>
          </div>
          <div className="space-y-4">
            {todaysTasks.length > 0 || repeatingTasksDueToday.length > 0 ? (
              <>
                <div className="w-full bg-background-600 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (completedTodayTasks.length /
                          (todaysTasks.length +
                            repeatingTasksDueToday.length)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {completedTodayTasks.length}
                    </p>
                    <p className="text-sm text-text-low">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {pendingTodayTasks.length + repeatingTasksDueToday.length}
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
                {repeatingTasksDueToday.length > 0 && (
                  <div className="mt-4 p-3 bg-background-600 rounded-md">
                    <p className="text-sm text-text-low mb-2">
                      <Repeat className="w-4 h-4 inline mr-1" />
                      {repeatingTasksDueToday.length} repeating task(s) due
                      today
                    </p>
                  </div>
                )}
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
            {priorityTasks.length > 0 ? (
              priorityTasks
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
      </div>

      {/* Performance Insights */}
      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            Performance Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">
                Time Management
              </h3>
              <Clock className="w-4 h-4 text-info" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">On-time Tasks</span>
                <span className="font-medium text-success">
                  {timeManagementStats.onTimeTasksCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Avg. Delay</span>
                <span className="font-medium text-warning">
                  {timeManagementStats.averageDelayDays > 0
                    ? `${timeManagementStats.averageDelayDays} days`
                    : "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">Task Health</h3>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Completion Rate</span>
                <span className="font-medium text-success">
                  {regularTasks.length > 0
                    ? `${Math.round(
                        (completedTasks.length / regularTasks.length) * 100
                      )}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Missed Tasks</span>
                <span className="font-medium text-error">
                  {missedTasks.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">Consistency</h3>
              <Zap className="w-4 h-4 text-warning" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Current Streak</span>
                <span className="font-medium text-warning">
                  {consistencyStats.currentStreakDays} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Best Streak</span>
                <span className="font-medium text-success">
                  {consistencyStats.bestStreakDays} days
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-low">
                Productivity
              </h3>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">Total Points</span>
                <span className="font-medium text-accent">{totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-low">
                  Today&apos;s Impact
                </span>
                <span
                  className={`font-medium ${
                    todayPoints >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {todayPoints >= 0 ? "+" : ""}
                  {todayPoints}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-info" />
            Upcoming Tasks
          </h2>
          <span className="text-sm text-text-low">Next 7 days</span>
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
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-low flex items-center">
              <Repeat className="w-5 h-5 mr-2 text-purple-400" />
              Repeating Tasks
            </h2>
            <span className="text-sm text-text-low">
              {repeatingTasksDueToday.length} due today
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {repeatingTasks.map((task: Task) => (
              <RepeatingTaskCardSmall key={task.id} notProcessedTask={task} />
            ))}
          </div>
        </section>
      )}
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
    <div className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-high">{value}</p>
      {subtitle && <p className="text-sm text-text-low mt-1">{subtitle}</p>}
    </div>
  );
}
