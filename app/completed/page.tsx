import { getServerSession } from "next-auth";
import TaskCard from "../_components/TaskCard";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getTasksByUserId } from "../_lib/tasks";
import { SquareCheckBig } from "lucide-react";

export default async function CompletedTasksPage() {
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
  const userCompletedTasks = userTasks.filter(
    (task) => task.status === "completed"
  );

  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
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
        <div className="p-6 text-center text-text-low">
          {userCompletedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCompletedTasks.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={idx}
                  showCompleted={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-gray">
              No completed tasks yet. You need to get serious now!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
