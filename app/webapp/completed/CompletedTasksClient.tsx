"use client";

import { Clock, Repeat, SquareCheckBig } from "lucide-react";
import type { Task } from "@/app/_types/types";
import TaskCard from "@/app/_components/TaskCard";
import RepeatingTaskCard from "@/app/_components/RepeatingTaskCard";
import { useHydratedTasks } from "@/app/_store/taskStore";

export default function CompletedTasksClient({ tasks }: { tasks: Task[] }) {
  const allTasks = useHydratedTasks(tasks);
  const completedRegular = allTasks.filter(
    (task) => task.status === "completed" && !task.isRepeating,
  );
  const completedRepeating = allTasks.filter(
    (task) => task.status === "completed" && task.isRepeating,
  );

  return (
    <div className="container mx-auto p-2 sm:p-6 pb-8">
      <div className="mb-8 ">
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
            Regular Tasks ({completedRegular.length})
          </h2>
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          {completedRegular.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedRegular.map((task, idx) => (
                <TaskCard key={task.id} task={task} index={idx} />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">No completed regular tasks yet.</p>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
            <Repeat className="w-5 h-5 mr-2 text-primary-500" />
            Repeating Tasks ({completedRepeating.length})
          </h2>
          <p className="text-sm text-text-low">
            These stay here until their next occurrence comes around
          </p>
        </div>

        <div className="p-1 sm:p-6 text-center text-text-low">
          {completedRepeating.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedRepeating.map((task) => (
                <RepeatingTaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">No completed repeating tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
