import Bone from "./Bone";

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-6 min-w-[200px] flex-1">
            <div className="flex items-center justify-between mb-4">
              <Bone className="h-5 w-32 rounded" />
              <Bone className="h-6 w-6 rounded" />
            </div>
            <Bone className="h-8 w-20 rounded mb-2" />
            <Bone className="h-4 w-36 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bone className="h-5 w-5 rounded mr-2" />
            <h3 className="text-lg font-semibold text-text-high">
              Feature Usage Analytics
            </h3>
          </div>
          <span className="text-sm text-text-low">Last 30 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center">
              <Bone className="h-8 w-12 rounded mx-auto mb-2" />
              <Bone className="h-4 w-16 rounded mx-auto" />
              <div className="w-full bg-background-600 rounded-full h-2 mt-2">
                <Bone className="h-2 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-700 rounded-lg sm:p-6 py-6 px-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Bone className="w-5 h-5 rounded" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-high">
              Weekly Points Growth
            </h2>
            <p className="text-text-low text-sm">Points earned over time</p>
          </div>
        </div>
        <Bone className="h-80 w-full rounded-lg" />
      </div>

      <div className="bg-background-700 rounded-lg p-6 relative">
        <h3 className="sm:mt-0 mt-3 text-lg font-semibold text-text-high mb-4 flex items-center">
          <Bone className="h-5 w-5 rounded mr-2" />
          All Achievements
        </h3>
        <div className="absolute top-2 right-2 hidden sm:flex items-center gap-2">
          <Bone className="h-4 w-24 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex sm:gap-0 flex-wrap gap-1 items-center justify-between py-2 px-3 rounded-lg bg-background-600"
            >
              <div className="flex items-center space-x-3">
                <Bone className="h-8 w-8 rounded" />
                <Bone className="h-4 w-32 rounded" />
              </div>
              <Bone className="h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <Bone className="h-5 w-5 rounded mr-2" />
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Bone className="h-4 w-20 rounded" />
                <Bone className="h-6 w-6 rounded" />
              </div>
              <Bone className="h-6 w-24 rounded mb-2" />
              <Bone className="h-4 w-full rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-low">
            14-Day Overview
          </h2>
          <div className="text-right">
            <div className="text-sm text-text-gray">Current Streak</div>
            <Bone className="h-6 w-16 rounded ml-auto mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="relative rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-between bg-background-600 border border-background-500"
            >
              <Bone className="h-3 w-8 rounded mx-auto" />
              <Bone className="h-6 w-8 rounded mx-auto" />
              <Bone className="h-3 w-16 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
