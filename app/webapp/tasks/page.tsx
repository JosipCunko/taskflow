import { getServerSession } from "next-auth";
import { ChartColumn } from "lucide-react";
import { getTasksByUserId } from "@/app/_lib/tasks";
import TaskCard from "@/app/_components/TaskCard";
import { authOptions } from "@/app/_lib/auth";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    console.error("User not authenticated or user ID missing from session.");
    return {
      success: false,
      error: "User not authenticated.",
    };
  }
  const userId = session.user.id;
  const userTasks = await getTasksByUserId(userId);
  const userTasksNotCompleted = userTasks.filter(
    (task) => task.status !== "completed"
  );

  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl  font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500 " />
          Today&apos;s tasks
        </h1>
      </div>

      <div className="mt-8">
        <div className="p-6 text-center text-text-low">
          {userTasksNotCompleted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTasksNotCompleted.map((task, idx) => (
                <TaskCard key={task.id} task={task} index={idx} />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">
              No tasks for today. Add a new task to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
