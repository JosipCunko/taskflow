import { ChartColumn } from "lucide-react";

function TaskCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg shadow-md border-l-4 border-background-500 animate-pulse">
      {/* Header: Icon, Title, Options */}
      <div className="p-4 flex items-start justify-between border-b border-divider">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-md w-10 h-10 flex items-center justify-center shrink-0 bg-background-600">
            <div className="w-5 h-5 bg-background-500 rounded" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="h-5 w-32 bg-background-500 rounded" />
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="w-8 h-8 bg-background-500 rounded-md" />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-background-500 rounded" />
          <div className="h-3 w-3/4 bg-background-500 rounded" />
        </div>

        {/* Time and Date Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-12 bg-background-500 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-16 bg-background-500 rounded" />
          </div>
        </div>

        {/* Status and Tags */}
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, j) => (
            <div
              key={j}
              className="h-6 w-16 bg-background-500 rounded-full"
            ></div>
          ))}
        </div>

        {/* Duration/Priority indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-12 bg-background-500 rounded" />
          </div>
          <div className="h-8 w-24 bg-background-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function TasksSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 h-full overflow-auto animate-pulse">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500" />
          Your tasks
        </h1>
      </div>

      <div className="mt-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
