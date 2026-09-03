import { ChartColumn, Clock, ListFilter, Plus, Repeat } from "lucide-react";
import TaskCardSkeleton from "./TaskCardSkeleton";
import RepeatingTaskCardSkeleton from "./RepeatingTaskCardSkeleton";

export default function TasksSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8">
      <div className="mb-6 md:mb-8 flex items-center justify-between sm:flex-row flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Your tasks</span>
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative isolate px-4 py-1 rounded-md flex items-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50">
            <ListFilter className="w-5 h-5" />
            Filter
          </div>
          <div className="sm:hidden block">
            <div className="relative isolate px-4 py-1 rounded-md flex items-center gap-2 text-sm font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50">
              <Plus size={18} />
              <span>New Task</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-primary-500" />
            Regular Tasks
          </h2>
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
            <Repeat className="w-5 h-5 mr-2 text-primary-500" />
            Repeating Tasks
          </h2>
          <p className="text-sm text-text-low">
            These tasks repeat automatically based on your schedule
          </p>
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <RepeatingTaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
