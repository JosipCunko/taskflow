export default function HealthSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Action Bar */}
      <div className="flex justify-end items-center gap-4">
        <div className="h-10 w-32 bg-background-500 rounded"></div>
        <div className="h-10 w-24 bg-background-500 rounded"></div>
        <div className="h-10 w-32 bg-background-500 rounded"></div>
        <div className="h-10 w-32 bg-background-500 rounded"></div>
      </div>

      {/* Daily Summary */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-background-500 rounded"></div>
          <div className="h-6 bg-background-500 rounded w-80"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 bg-background-500 rounded"></div>
                <div className="h-6 bg-background-500 rounded w-20"></div>
              </div>
              <div className="mb-2">
                <div className="h-8 w-16 bg-background-500 rounded inline-block"></div>
                <div className="h-4 w-24 bg-background-500 rounded inline-block ml-1"></div>
              </div>
              <div className="w-full bg-background-500 rounded-full h-3 mb-2"></div>
              <div className="h-4 w-24 bg-background-500 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Logged Meals Section */}
      <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-background-500 rounded"></div>
          <div className="h-6 bg-background-500 rounded w-64"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded"
            >
              <div className="flex-1">
                <div className="h-4 bg-background-500 rounded w-32 mb-1"></div>
                <div className="h-3 bg-background-500 rounded w-48"></div>
              </div>
              <div className="h-8 bg-background-500 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
