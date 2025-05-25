import { Plus } from "lucide-react";

export default function TasksSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-background-500 rounded-lg"></div>
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-background-500 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-background-500" />
          </div>
          <div className="h-10 w-32 bg-background-500 rounded-lg"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-background-500 rounded-lg"></div>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 bg-background-500 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-background-500 rounded"></div>
                  <div className="h-3 w-32 bg-background-500 rounded"></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-background-500 rounded"></div>
                <div className="h-8 w-8 bg-background-500 rounded"></div>
                <div className="h-8 w-8 bg-background-500 rounded"></div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 w-16 bg-background-500 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
