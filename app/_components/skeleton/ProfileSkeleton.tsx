export default function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="h-24 w-24 bg-background-500 rounded-full"></div>
        <div className="space-y-3">
          <div className="h-6 w-48 bg-background-500 rounded"></div>
          <div className="h-4 w-32 bg-background-500 rounded"></div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-background-500 rounded-full"></div>
            <div className="h-8 w-24 bg-background-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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

      {/* Settings Sections */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-background-500 rounded"></div>
              <div className="h-8 w-8 bg-background-500 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-background-500 rounded"></div>
                    <div className="h-3 w-48 bg-background-500 rounded"></div>
                  </div>
                  <div className="h-6 w-12 bg-background-500 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-background-500 rounded"></div>
          <div className="h-8 w-24 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-background-500 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-background-500 rounded"></div>
                <div className="h-3 w-1/2 bg-background-500 rounded"></div>
              </div>
              <div className="h-4 w-20 bg-background-500 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
