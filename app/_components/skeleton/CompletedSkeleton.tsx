import { SquareCheckBig } from "lucide-react";

function CompletedTaskCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg shadow-md border-l-4 border-background-500 animate-pulse">
      {/* Header: Icon, Title, Options */}
      <div className="p-4 flex items-start justify-between border-b border-divider">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-md w-10 h-10 flex items-center justify-center shrink-0 bg-background-600">
            <div className="w-5 h-5 bg-background-500 rounded" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="h-5 w-36 bg-background-500 rounded" />
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
          <div className="h-3 w-2/3 bg-background-500 rounded" />
        </div>

        {/* Completed info and experience */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-20 bg-background-500 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-12 bg-background-500 rounded" />
          </div>
        </div>

        {/* Status badges for completed task */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-green-500/20 rounded-full" />
          <div className="h-6 w-16 bg-background-500 rounded-full" />
          <div className="h-6 w-14 bg-background-500 rounded-full" />
        </div>

        {/* Completion details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-background-500 rounded" />
            <div className="h-3 w-16 bg-background-500 rounded" />
          </div>
          <div className="h-6 w-16 bg-background-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function CompletedSkeleton() {
  return (
    <div className="container mx-auto p-6 h-full overflow-auto animate-pulse">
      <div className="mb-8 md:mb-8">
        <h1 className="text-3xl sm:text-4xl  font-bold text-primary-400 flex items-center">
          <SquareCheckBig className="w-8 h-8 mr-3 text-primary-500 " />
          Completed tasks
        </h1>
        <p className="text-text-low mt-1 text-sm sm:text-base">
          Manage and review your completed tasks.
        </p>
      </div>

      <div className="mt-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
              <CompletedTaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
