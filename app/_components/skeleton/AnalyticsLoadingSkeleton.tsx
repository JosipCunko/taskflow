export function AnalyticsLoadingSkeleton() {
  return (
    <>
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-48 bg-background-500 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-background-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-background-500 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-background-500 rounded mx-auto mb-2"></div>
              <div className="w-full bg-background-600 rounded-full h-2">
                <div className="bg-background-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-40 bg-background-500 rounded"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-12 bg-background-500 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-background-600 rounded-full h-2">
                    <div className="bg-background-500 h-2 rounded-full w-3/5"></div>
                  </div>
                  <div className="h-3 w-8 bg-background-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-32 bg-background-500 rounded"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-12 bg-background-500 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-background-600 rounded-full h-2">
                    <div className="bg-background-500 h-2 rounded-full w-4/5"></div>
                  </div>
                  <div className="h-3 w-6 bg-background-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
          <div className="h-6 w-32 bg-background-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-background-500 rounded"></div>
                <div className="h-6 w-6 bg-background-500 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-background-500 rounded mb-2"></div>
              <div className="h-3 w-full bg-background-500 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-background-500 rounded"></div>
          <div className="h-8 w-8 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-background-500 rounded"></div>
          <div className="h-4 w-3/4 bg-background-500 rounded"></div>
          <div className="h-10 w-32 bg-background-500 rounded mt-4"></div>
        </div>
      </div>
    </>
  );
}
