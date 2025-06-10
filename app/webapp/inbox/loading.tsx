import { Inbox } from "lucide-react";

export default function InboxLoading() {
  return (
    <div className="p-5 mx-auto">
      {/* Header skeleton */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Inbox className="w-8 h-8 mr-3 text-primary-500" />
          Inbox
        </h1>
        <p className="text-text-low mt-2">
          Stay on top of your tasks with smart notifications and alerts.
        </p>
      </div>

      <div className="space-y-6 animate-pulse">
        {/* Filter buttons skeleton */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-8 sm:h-9 w-16 sm:w-20 bg-background-500 rounded-lg"
              />
            ))}
          </div>

          {/* Search and Actions skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search bar skeleton */}
            <div className="flex-1 sm:max-w-xs">
              <div className="h-9 bg-background-500 rounded-lg"></div>
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="h-9 w-20 sm:w-24 bg-background-500 rounded-lg"></div>
              {/* Mark all read button */}
              <div className="h-9 w-20 sm:w-28 bg-background-500 rounded-lg"></div>
              {/* Refresh button */}
              <div className="h-9 w-16 sm:w-20 bg-background-500 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Notifications skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-background-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Notification icon skeleton */}
                <div className="w-5 h-5 bg-background-600 rounded flex-shrink-0 mt-1"></div>

                <div className="flex-1 min-w-0">
                  {/* Title and priority badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 bg-background-600 rounded w-3/4"></div>
                    <div className="h-4 w-12 bg-background-600 rounded"></div>
                  </div>

                  {/* Message */}
                  <div className="h-3 bg-background-600 rounded w-full mb-2"></div>
                  <div className="h-3 bg-background-600 rounded w-2/3 mb-3"></div>

                  {/* Action button and timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 bg-background-600 rounded"></div>
                    <div className="h-3 w-16 bg-background-600 rounded"></div>
                  </div>
                </div>

                {/* Actions menu skeleton */}
                <div className="w-8 h-8 bg-background-600 rounded flex-shrink-0"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats summary skeleton */}
        <div className="p-4 bg-background-500 rounded-lg">
          <div className="h-4 bg-background-600 rounded w-40 mb-3"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-background-600 rounded w-12"></div>
                <div className="h-4 bg-background-600 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
