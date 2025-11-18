import { Home } from "lucide-react";
import { AnalyticsLoadingSkeleton } from "./AnalyticsLoadingSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="container h-full mx-auto p-1 sm:p-6 space-y-8 overflow-auto animate-pulse">
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
          <div
            key={i}
            className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-1"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-1"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-1"></div>
          </div>
        ))}
      </div>

      <AnalyticsLoadingSkeleton />

      {/* Today's Progress and Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
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
              <div key={i} className="bg-background-600 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-background-500 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-background-500 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-background-500 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notification Summary */}
        <section className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
              <div className="h-6 w-40 bg-background-500 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-background-500 rounded"></div>
                <div className="h-6 w-8 bg-background-500 rounded"></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Performance Insights */}
      <section className="w-full bg-background-700 rounded-lg p-6">
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

      {/* Tasks Needing Attention */}
      <section className="w-full bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-48 bg-background-500 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="h-4 w-32 bg-background-500 rounded mb-2"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-background-600 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-background-500 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-background-500 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-background-500 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Tasks */}
      <section className="bg-background-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-32 bg-background-500 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-background-500 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-background-500 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-background-500 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Repeating Tasks */}
      <section className="bg-background-700 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-32 bg-background-500 rounded"></div>
          </div>
          <div className="h-4 w-24 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-background-500 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-background-500 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-background-500 rounded mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-12 bg-background-500 rounded"></div>
                    <div className="h-5 w-16 bg-background-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
