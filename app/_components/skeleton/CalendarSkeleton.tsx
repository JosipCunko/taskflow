import { CalendarDays } from "lucide-react";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";

export default function CalendarSkeleton() {
  return (
    <div className="container mx-auto max-h-full text-text-high p-1 sm:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <CalendarDays className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">My Calendar</span>
        </h1>
        <p className="text-text-low mt-1 text-sm sm:text-base">
          Manage your schedule and tasks efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 animate-pulse">
        {/* Calendar picker skeleton */}
        <div className="lg:col-span-4 bg-background-600 py-2 mx-auto w-fit rounded-xl shadow-xl">
          <div className="space-y-4 ">
            {/* Calendar header skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-background-500 rounded"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-background-500 rounded"></div>
                <div className="h-8 w-8 bg-background-500 rounded"></div>
              </div>
            </div>

            {/* Calendar weekdays skeleton */}
            <div className="grid grid-cols-7 gap-3 mb-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="h-5 aspect-square bg-background-500 rounded mx-auto"
                ></div>
              ))}
            </div>

            {/* Calendar days skeleton */}
            <div className="grid grid-cols-7 gap-3">
              {[...Array(42)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 aspect-square bg-background-500 rounded mx-auto"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks panel skeleton */}
        <div className="lg:col-span-3 bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl">
          {/* Tasks panel header skeleton */}
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-6 h-6 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-40 bg-background-500 rounded"></div>
          </div>

          {/* Tasks list skeleton */}
          <div className="space-y-3 max-h-[60vh] pr-1">
            {[...Array(3)].map((_, i) => (
              <TaskCardSmallSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
