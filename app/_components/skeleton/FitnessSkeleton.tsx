import { Calendar, Dumbbell, Plus, TrendingUp } from "lucide-react";
import Bone from "./Bone";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function FitnessSkeleton({
  includePageChrome = false,
}: {
  includePageChrome?: boolean;
}) {
  const content = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-background-600 rounded-lg p-4 border border-background-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <Bone className="h-4 w-20 rounded mb-2" />
                <Bone className="h-7 w-12 rounded" />
              </div>
              <Bone className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50">
          <Plus className="size-5" />
          <span className="p-3">Start New Workout</span>
        </div>
        <div className="flex-1 relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-background-500/50 text-text-low border border-primary-500/10">
          <TrendingUp className="size-5" />
          <span className="p-3">View Progress</span>
        </div>
      </div>

      <div className="bg-background-600 rounded-lg sm:p-6 py-6 px-2 border border-background-500">
        <div className="flex flex-col gap-2 items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Overview
          </h2>
          <div className="flex items-center gap-2">
            <Bone className="h-9 w-10 rounded-md" />
            <Bone className="h-5 w-28 rounded" />
            <Bone className="h-9 w-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-text-low mb-2">
                {day}
              </div>
              <div className="h-16 rounded-lg border-2 border-dashed border-background-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <h2 className="text-xl font-semibold text-text-high mb-4">
          Recent Workouts
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-background-700 rounded-lg border border-background-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Bone className="h-5 w-36 rounded mb-2" />
                  <Bone className="h-4 w-28 rounded" />
                </div>
                <Bone className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-high">
            My Workout Templates
          </h2>
          <div className="relative isolate px-4 py-1 rounded-md flex items-center gap-2 text-sm font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50">
            <Plus className="size-5 min-w-5" />
            Create <span className="sm:inline hidden">Template</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-background-700 rounded-lg p-4 border border-background-500"
            >
              <div className="flex items-center justify-between mb-3">
                <Bone className="h-5 w-32 rounded" />
                <Bone className="h-3 w-20 rounded" />
              </div>
              <div className="mb-4 flex flex-wrap gap-1">
                <Bone className="h-6 w-16 rounded" />
                <Bone className="h-6 w-20 rounded" />
                <Bone className="h-6 w-14 rounded" />
              </div>
              <Bone className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!includePageChrome) return content;

  return (
    <div className="container mx-auto p-0 sm:p-6 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
            <Dumbbell className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
            <span className="text-glow">Fitness Dashboard</span>
          </h1>
          <p className="text-text-low">
            Track your workouts, monitor progress, and achieve your fitness
            goals
          </p>
        </div>
        {content}
      </div>
    </div>
  );
}
