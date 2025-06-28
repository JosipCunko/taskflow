import { getServerSession } from "next-auth";
import { ChartColumn, Repeat, Clock } from "lucide-react";
import { getTasksByUserId } from "@/app/_lib/tasks";
import TaskCard from "@/app/_components/TaskCard";
import RepeatingTaskCard from "@/app/_components/RepeatingTaskCard";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const userTasks = await getTasksByUserId(userId);

  const regularTasks = userTasks.filter(
    (task) => !task.isRepeating && task.status !== "completed"
  );
  const repeatingTasks = userTasks.filter((task) => task.isRepeating);

  return (
    <div className="container mx-auto p-1 sm:p-6 h-full overflow-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500" />
          Your tasks
        </h1>
      </div>

      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-primary-500" />
            Regular Tasks ({regularTasks.length})
          </h2>
        </div>

        <div className="p-6 text-center text-text-low">
          {regularTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularTasks.map((task, idx) => (
                <TaskCard key={task.id} task={task} index={idx} />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">
              No regular tasks found. Create a new task to get started.
            </p>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center mb-4">
            <Repeat className="w-5 h-5 mr-2 text-primary-500" />
            Repeating Tasks ({repeatingTasks.length})
          </h2>
          <p className="text-sm text-text-low">
            These tasks repeat automatically based on your schedule
          </p>
        </div>

        <div className="p-6 text-center text-text-low">
          {repeatingTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repeatingTasks.map((task) => (
                <RepeatingTaskCard key={task.id} notProcessedTask={task} />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">
              No repeating tasks found. Create a repeating task to automate your
              routine.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
