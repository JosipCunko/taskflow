import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";

export default function TodaySkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 space-y-6 overflow-y-auto animate-pulse">
      <div className="bg-background-700 p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary-500">
            Today&apos;s Plan
          </h2>
          <div className="h-10 w-24 bg-background-500 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Time Grid Section */}
          <div className="relative">
            <div className="flex flex-col space-y-0 border border-background-600 rounded-lg overflow-hidden">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="relative flex border-b border-background-600 last:border-b-0"
                  style={{ minHeight: "60px" }}
                >
                  {/* Hour Label */}
                  <div className="w-16 flex-shrink-0 p-2 text-sm text-text-gray border-r border-background-600">
                    <div className="h-4 w-10 bg-background-500 rounded"></div>
                  </div>

                  {/* Task Area */}
                  <div className="flex-1 p-2 relative">
                    {i % 3 === 0 && (
                      <div className="absolute left-2 right-2 p-2 rounded-md border-l-4 bg-background-600/50 border-background-500 h-16">
                        <div className="flex items-start gap-2">
                          <div className="h-4 w-32 bg-background-500 rounded"></div>
                          <div className="h-5 w-12 bg-background-500 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whole Day Tasks Section */}
          <div>
            <h3 className="text-md font-semibold text-text-low mb-3">
              Tasks for Today
            </h3>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <TaskCardSmallSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
