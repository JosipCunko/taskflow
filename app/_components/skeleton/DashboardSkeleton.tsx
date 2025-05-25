import { Home } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
            <Home className="w-8 h-8 mr-3 text-primary-500" />
            Dashboard
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Needing Attention */}
        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 bg-background-500 rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-background-600 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-background-500 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-background-500 rounded"></div>
                    <div className="h-3 w-1/2 bg-background-500 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 bg-background-500 rounded"></div>
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
          </div>
        </div>
      </div>

      {/* Task Performance */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-background-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-background-500 rounded"></div>
          <div className="h-4 w-24 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-background-500 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-background-500 rounded"></div>
                  <div className="h-3 w-1/2 bg-background-500 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
