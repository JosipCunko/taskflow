import { getServerSession } from "next-auth";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import CompletedTasksClient from "./CompletedTasksClient";

export const dynamic = "force-dynamic";

export default async function CompletedTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const allUserTasks = await getTasksByUserId(userId);

  return <CompletedTasksClient tasks={allUserTasks} />;
}
