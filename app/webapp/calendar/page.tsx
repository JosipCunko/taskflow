import { CalendarDays } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import Calendar from "./Calendar";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  const allTasks = await getTasksByUserId(session.user.id);

  return (
    <div className="container mx-auto max-h-full text-text-high p-1 sm:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <CalendarDays className="w-8 h-8 mr-3 text-primary-500" />
          My Calendar
        </h1>
        <p className="text-text-low mt-1 text-sm sm:text-base">
          Manage your schedule and tasks efficiently.
        </p>
      </div>

      <Calendar tasks={allTasks.filter((t) => !t.isRepeating)} />
    </div>
  );
}
