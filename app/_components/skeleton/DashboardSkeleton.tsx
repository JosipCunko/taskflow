import { Home } from "lucide-react";
import { AnalyticsLoadingSkeleton } from "./AnalyticsLoadingSkeleton";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";
import RepeatingTaskCardSkeleton from "./RepeatingTaskCardSkeleton";
import Bone from "./Bone";

function StatCardSkeleton() {
  return (
    <div className="bg-background-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Bone className="h-5 w-28 rounded" />
        <Bone className="h-6 w-6 rounded" />
      </div>
      <Bone className="h-8 w-16 rounded" />
      <Bone className="h-4 w-24 rounded mt-1" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Dashboard</span>
        </h1>
        <p className="text-text-low mt-2">
          Welcome back! Here&apos;s your productivity overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={`secondary-${i}`} />
        ))}
      </div>

      <AnalyticsLoadingSkeleton />

      <div className="bg-background-700/50 border border-background-500/30 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <Bone className="w-5 h-5 rounded shrink-0" />
          <div className="space-y-2 min-w-0">
            <Bone className="h-4 w-40 rounded" />
            <Bone className="h-3 w-56 max-w-full rounded" />
          </div>
        </div>
        <Bone className="h-9 w-20 rounded-lg shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bone className="h-5 w-5 rounded mr-2" />
              <Bone className="h-6 w-40 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full rounded-full h-2.5 bg-background-600">
              <Bone className="h-2.5 rounded-full w-1/3" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {["Completed", "Pending", "Points available"].map((label) => (
                <div key={label} className="text-center">
                  <Bone className="h-8 w-10 rounded mx-auto" />
                  <p className="text-sm text-text-low mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bone className="h-5 w-5 rounded mr-2" />
              <h2 className="text-xl font-semibold text-text-low">
                Priority Tasks
              </h2>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...Array(3)].map((_, i) => (
              <TaskCardSmallSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bone className="h-5 w-5 rounded mr-2" />
              <h3 className="text-lg font-semibold text-text-low">
                Notifications
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Bone className="h-4 w-24 rounded" />
                <Bone className="h-6 w-8 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bone className="h-5 w-5 rounded mr-2" />
            <h2 className="text-xl font-semibold text-text-low">
              Tasks Needing Attention
            </h2>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="h-4 flex items-center mb-2">
              <span className="w-2 h-2 bg-error rounded-full mr-2" />
              <Bone className="h-4 w-32 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <TaskCardSmallSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bone className="h-5 w-5 rounded mr-2" />
            <h2 className="text-xl font-semibold text-text-low">
              Upcoming Tasks
            </h2>
          </div>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[...Array(3)].map((_, i) => (
            <TaskCardSmallSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="bg-background-700 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bone className="h-5 w-5 rounded mr-2" />
            <h2 className="text-xl font-semibold text-text-low">
              Repeating Tasks
            </h2>
          </div>
          <Bone className="h-4 w-20 rounded" />
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {[...Array(3)].map((_, i) => (
            <RepeatingTaskCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
