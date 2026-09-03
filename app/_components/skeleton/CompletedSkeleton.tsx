import { Clock, Repeat, SquareCheckBig } from "lucide-react";
import TaskCardSkeleton from "./TaskCardSkeleton";
import RepeatingTaskCardSkeleton from "./RepeatingTaskCardSkeleton";

export default function CompletedSkeleton() {
  return (
    <div className="container mx-auto p-2 sm:p-6 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <SquareCheckBig className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Completed tasks</span>
        </h1>
        <p className="text-text-low mt-1 text-sm sm:text-base">
          Manage and review your completed tasks.
        </p>
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
            These stay here until their next occurrence comes around
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
