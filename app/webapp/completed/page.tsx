import { getServerSession } from "next-auth";
import { SquareCheckBig } from "lucide-react";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import TaskCard from "@/app/_components/TaskCard";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export default async function CompletedTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const allUserTasks = await getTasksByUserId(userId);
  const userCompletedTasks = allUserTasks.filter(
    (task) => task.status === "completed" && !task.isRepeating
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
        <div className="p-2 sm:p-6 text-center text-text-low">
          {userCompletedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCompletedTasks.map((task, idx) => (
                <TaskCard key={task.id} task={task} index={idx} />
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
