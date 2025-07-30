export default function HealthSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-96 animate-pulse"></div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Food Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Meal Log Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded"
              >
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
