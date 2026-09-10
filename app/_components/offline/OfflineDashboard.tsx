"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Repeat,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Task } from "@/app/_types/types";
import { generateTaskTypes } from "@/app/_utils/utils";
import TaskCardSmall from "../TaskCardSmall";
import RepeatingTaskCard from "../RepeatingTaskCard";

/**
 * Task-derived slice of the dashboard. Reward points, streaks, note counts and
 * analytics live on the user document, which is not cached, so they are left
 * out rather than shown as zero.
 */
export default function OfflineDashboard({ tasks }: { tasks: Task[] }) {
  const {
    completedTodayRegularTasks,
    completedTodayRepeatingTasks,
    todaysTasks,
    pendingTodayTasks,
    upcomingTasks,
    missedTasks,
    delayedTasks,
    repeatingTasks,
    repeatingTasksDueToday,
    pendingPriorityTasks,
  } = generateTaskTypes(tasks);

  const completedToday =
    completedTodayRegularTasks.length + completedTodayRepeatingTasks.length;

  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Dashboard</span>
        </h1>
        <p className="text-text-low mt-2">
          Showing your tasks from this device. Points, streaks and analytics
          return when you&apos;re back online.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OfflineCard
          title="Today's Tasks"
          value={`${completedToday}/${todaysTasks.length}`}
          icon={<Clock className="text-primary-500" size={24} />}
          subtitle={`${pendingTodayTasks.length} pending`}
        />
        <OfflineCard
          title="Missed Tasks"
          value={missedTasks.length}
          icon={<AlertTriangle className="text-error" size={24} />}
          subtitle="Need attention"
        />
        <OfflineCard
          title="Delayed Tasks"
          value={delayedTasks.length}
          icon={<Clock className="text-warning" size={24} />}
          subtitle="Rescheduled"
        />
        <OfflineCard
          title="Repeating Tasks"
          value={repeatingTasks.length}
          icon={<Repeat className="text-purple-400" size={24} />}
          subtitle={`${repeatingTasksDueToday.length} due today`}
        />
      </div>

      <section className="bg-background-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
          <Star className="w-5 h-5 mr-2 text-warning" />
          Priority Tasks
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {pendingPriorityTasks.length > 0 ? (
            pendingPriorityTasks
              .slice(0, 4)
              .map((task) => <TaskCardSmall key={task.id} task={task} />)
          ) : (
            <p className="text-text-gray">No priority tasks.</p>
          )}
        </div>
      </section>

      <section className="bg-background-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
          Tasks Needing Attention
        </h2>
        <div className="space-y-2">
          {missedTasks.length === 0 && delayedTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
              <p className="text-text-low">All tasks are up to date!</p>
            </div>
          ) : (
            [...missedTasks, ...delayedTasks]
              .slice(0, 6)
              .map((task) => <TaskCardSmall key={task.id} task={task} />)
          )}
        </div>
      </section>

      <section className="bg-background-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2 text-info" />
          Upcoming Tasks
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingTasks.length > 0 ? (
            upcomingTasks
              .slice(0, 5)
              .map((task) => <TaskCardSmall key={task.id} task={task} />)
          ) : (
            <p className="text-text-gray">Your schedule is clear!</p>
          )}
        </div>
      </section>

      {repeatingTasks.length > 0 && (
        <section className="bg-background-700 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
            <Repeat className="w-5 h-5 mr-2 text-purple-400" />
            Repeating Tasks
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {repeatingTasks.map((task) => (
              <RepeatingTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OfflineCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="bg-background-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-low">{value}</p>
      {subtitle && <p className="text-sm text-text-low mt-1">{subtitle}</p>}
    </div>
  );
}
