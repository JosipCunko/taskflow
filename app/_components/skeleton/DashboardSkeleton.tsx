import { Home } from "lucide-react";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500" />
          Dashboard
        </h1>
        <div className="h-4 w-80 bg-background-500 rounded mt-2"></div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-2"></div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-2"></div>
          </div>
        ))}
      </div>

      {/* Today's Progress and Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Progress */}
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
              <div className="h-6 w-40 bg-background-500 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full bg-background-600 rounded-full h-2.5">
              <div className="bg-background-500 h-2.5 rounded-full w-1/3"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-12 bg-background-500 rounded mx-auto"></div>
                  <div className="h-4 w-16 bg-background-500 rounded mx-auto mt-2"></div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-background-600 rounded-md">
              <div className="h-4 w-48 bg-background-500 rounded"></div>
            </div>
          </div>
        </section>

        {/* Priority Tasks */}
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
              <div className="h-6 w-32 bg-background-500 rounded"></div>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...Array(4)].map((_, i) => (
              <TaskCardSmallSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>

      {/* Performance Insights */}
      <section className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-40 bg-background-500 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-background-500 rounded"></div>
                <div className="h-4 w-4 bg-background-500 rounded"></div>
              </div>
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-background-500 rounded"></div>
                    <div className="h-4 w-12 bg-background-500 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
