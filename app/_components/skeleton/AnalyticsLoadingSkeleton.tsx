export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Analytics Cards */}
      <div className="flex items-center flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-1 min-w-[200px] bg-background-700 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-24 bg-background-500 rounded" />
              <div className="h-6 w-6 bg-background-500 rounded" />
            </div>
            <div className="h-8 w-20 bg-background-500 rounded mb-2" />
            <div className="h-3 w-32 bg-background-500 rounded" />
          </div>
        ))}
      </div>

      {/* Feature Usage Analytics */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-background-500 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-background-500 rounded mx-auto mb-2" />
              <div className="h-3 w-20 bg-background-500 rounded mx-auto mb-2" />
              <div className="w-full bg-background-600 rounded-full h-2">
                <div className="bg-background-500 h-2 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Points Growth Chart */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-background-500 rounded" />
        </div>
        <div className="h-80 bg-background-600 rounded-lg" />
      </div>

      {/* All Achievements */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-background-500 rounded" />
          <div className="h-4 w-32 bg-background-500 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-background-600"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-background-500 rounded" />
                <div className="h-4 w-32 bg-background-500 rounded" />
              </div>
              <div className="h-3 w-20 bg-background-500 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="h-6 w-32 bg-background-500 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-20 bg-background-500 rounded" />
                <div className="h-6 w-6 bg-background-500 rounded" />
              </div>
              <div className="h-7 w-24 bg-background-500 rounded mb-2" />
              <div className="h-3 w-full bg-background-500 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 14-Day Overview */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-40 bg-background-500 rounded" />
          <div className="h-10 w-24 bg-background-500 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="bg-background-600 rounded-lg p-3 min-h-[80px] flex flex-col justify-between"
            >
              <div className="h-3 w-8 bg-background-500 rounded" />
              <div className="h-6 w-8 bg-background-500 rounded self-center" />
              <div className="h-3 w-16 bg-background-500 rounded self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
