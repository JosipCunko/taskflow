import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";

export default function TodaySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6 p-1 sm:p-6 bg-background-800 text-text-high container mx-auto max-h-full overflow-auto animate-pulse">
      {/* Today's First Focus */}
      <div className="bg-background-700 p-6 rounded-lg shadow max-h-fit">
        <h2 className="text-xl font-semibold mb-4 text-primary-400">
          Today&apos;s First Focus
        </h2>
        <div className="p-4 rounded-lg border-l-4 border-background-500 bg-background-600">
          <div className="flex items-center gap-2">
            <div className="h-5 w-3/4 bg-background-500 rounded"></div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-background-500">
              <div className="h-3 w-3 bg-background-400 rounded"></div>
              <div className="h-3 w-12 bg-background-400 rounded"></div>
            </div>
          </div>
        </div>
        <div className="w-full mt-4 h-8 bg-background-500 rounded-md"></div>
      </div>

      {/* Other Tasks */}
      <div className="bg-background-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-primary-500">
          Other Tasks
        </h2>
        <div className="space-y-3 max-h-[24rem] overflow-y-auto">
          {[...Array(3)].map((_, i) => (
            <TaskCardSmallSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-background-700 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6 text-primary-500">
          Today&apos;s Schedule
        </h2>
        <div className="space-y-3 max-h-[24rem] overflow-y-auto">
          {[...Array(4)].map((_, i) => (
            <TaskCardSmallSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Repeating Tasks Due Today */}
      <div className="bg-background-700 p-6 rounded-lg shadow -mt-24">
        <h2 className="text-xl font-semibold mb-6 text-primary-500">
          Repeating Tasks Due Today
        </h2>
        <div className="space-y-3 max-h-[24rem] overflow-y-auto">
          {[...Array(2)].map((_, i) => (
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
      </div>
    </div>
  );
}
