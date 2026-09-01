import { getServerSession } from "next-auth";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import TasksPageClient from "./TasksPageClient";

// Dynamic route - tasks change frequently
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const userTasks = await getTasksByUserId(userId);

  return <TasksPageClient tasks={userTasks} />;
}
