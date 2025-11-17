import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import { isBefore, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import TodayPlanSection from "@/app/_components/TodayPlanSection";
import { autoDelayIncompleteTodayTasks } from "@/app/_lib/actions";

// Dynamic route - today's tasks change very frequently
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  await autoDelayIncompleteTodayTasks();
  const allUserTasks = await getTasksByUserId(userId);

  const today = startOfDay(new Date());
  const relevantTasks = allUserTasks.filter((task) => {
    // Keep all non-completed tasks
    if (task.status !== "completed") return true;

    // For completed tasks, only keep if completed today
    if (task.completedAt) {
      return !isBefore(startOfDay(task.completedAt), today);
    }

    return true;
  });

  return (
    <div className="container h-screen mx-auto p-1 sm:p-6 space-y-6 overflow-y-auto">
      <TodayPlanSection todayTasks={relevantTasks} />
    </div>
  );
}
