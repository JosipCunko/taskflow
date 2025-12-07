import { ChartColumn, Clock, Repeat } from "lucide-react";

function TaskCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg shadow-md border-l-4 border-background-500 animate-pulse flex flex-col h-full">
      {/* Header: Icon, Title, Options */}
      <div className="p-4 flex items-start justify-between border-b border-divider">
        <div className="flex items-start space-x-3 w-full">
          <div className="p-2.5 rounded-md w-10 h-10 flex items-center justify-center shrink-0 bg-background-600">
            <div className="w-5 h-5 bg-background-500 rounded" />
          </div>
          <div className="grow min-w-0 mt-1">
            <div className="h-5 w-3/4 bg-background-500 rounded" />
          </div>
        </div>
        <div className="relative shrink-0 ml-2">
          <div className="w-8 h-8 bg-background-500 rounded-md" />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 grow">
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-background-500 rounded" />
          <div className="h-3 w-3/4 bg-background-500 rounded" />
        </div>

        {/* Time and Date Info (Due Date Badge) */}
        <div className="flex items-center space-x-2 bg-background-500/20 rounded-md w-fit p-1">
          <div className="w-4 h-4 bg-background-500 rounded" />
          <div className="h-3 w-24 bg-background-500 rounded" />
        </div>

        {/* Status, Priority, Reminder Badges */}
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-24 bg-background-500 rounded-md" />
          <div className="h-7 w-20 bg-background-500 rounded-md" />
          <div className="h-7 w-20 bg-background-500 rounded-md" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="h-6 w-16 bg-background-500 rounded-full" />
          <div className="h-6 w-20 bg-background-500 rounded-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-background-main/50 border-t border-divider text-xs space-y-2 rounded-b-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-background-500 rounded" />
            <div className="h-3 w-20 bg-background-500 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-24 bg-background-500 rounded" />
            <div className="h-3 w-8 bg-background-500 rounded" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="h-3 w-32 bg-background-500 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TasksSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 max-h-full overflow-auto animate-pulse">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Your tasks</span>
        </h1>
        {/* Filter Button Placeholder */}
        <div className="w-24 h-10 bg-background-600 rounded-lg border border-primary-500/30" />
      </div>

      {/* Regular Tasks Section */}
      <div className="mt-8">
        <div className="mb-6">
          <div className="text-xl font-semibold text-text-high flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-primary-500" />
            <div className="h-6 w-40 bg-background-500 rounded" />
          </div>
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Repeating Tasks Section */}
      <div className="my-12">
        <div className="mb-6">
          <div className="text-xl font-semibold text-text-high flex items-center mb-4">
            <Repeat className="w-5 h-5 mr-2 text-primary-500" />
            <div className="h-6 w-48 bg-background-500 rounded" />
          </div>
          <div className="h-4 w-80 bg-background-500 rounded" />
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
