export default function HealthSkeleton() {
  return (
    <div className="min-h-screen bg-background-600">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-background-500 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-background-500 rounded w-96 animate-pulse"></div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-6 bg-background-500 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-8 bg-background-500 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-4 bg-background-500 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Food Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="h-6 bg-background-500 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-12 bg-background-500 rounded w-full mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-background-500 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Meal Log Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 bg-background-500 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div className="flex-1">
                  <div className="h-4 bg-background-500 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-background-500 rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-8 bg-background-500 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
