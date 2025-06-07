import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getTasksByUserId } from "@/app/_lib/tasks";
import TaskCardSmall from "@/app/_components/TaskCardSmall";
import { CardSpecificIcons, isTaskDueOn } from "@/app/utils";
import { Clock } from "lucide-react";
import Link from "next/link";
import RepeatingTaskCardSmall from "@/app/_components/RepeatingTaskCardSmall";

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="p-4 text-text-high">
        Please log in to see your tasks for today.
      </div>
    );
  }

  const userId = session.user.id;
  const allUserTasks = await getTasksByUserId(userId);

  const regularTasks = allUserTasks.filter((task) => !task.isRepeating);
  const repeatingTasks = allUserTasks.filter((task) => task.isRepeating);

  const todaysTasks = regularTasks.filter((task) =>
    isTaskDueOn(task, new Date())
  );

  // Include repeating tasks that are due today
  const todaysRepeatingTasks = repeatingTasks.filter((task) =>
    isTaskDueOn(task, new Date())
  );

  const allTodaysTasks = [...todaysTasks, ...todaysRepeatingTasks];

  const scheduledTasks = allTodaysTasks.filter(
    (task) => task.startTime && task.status !== "completed"
  );
  const otherTasks = allTodaysTasks.filter(
    (task) => !task.startTime && task.status !== "completed"
  );

  const now = new Date();
  const nextUpcomingTask = scheduledTasks
    .filter((task) => {
      if (!task.startTime) return false;
      const taskTime = new Date();
      taskTime.setHours(task.startTime.hour, task.startTime.minute, 0, 0);
      return taskTime >= now;
    })
    .sort((a, b) => {
      const timeA = new Date();
      timeA.setHours(a.startTime!.hour, a.startTime!.minute);
      const timeB = new Date();
      timeB.setHours(b.startTime!.hour, b.startTime!.minute);
      return timeA.getTime() - timeB.getTime();
    })[0];

  const focusTask =
    nextUpcomingTask ||
    allTodaysTasks.find((t) => t.isPriority && t.status !== "completed") ||
    allTodaysTasks.find((t) => t.status !== "completed");

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-background-800 text-text-high min-h-screen">
      <div className="lg:w-2/5 xl:w-1/3 space-y-6">
        {focusTask ? (
          <div className="bg-background-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-400">
              Today&apos;s First Focus
            </h2>
            <div
              className="p-4 rounded-lg border-l-4 flex items-center gap-2"
              style={{ borderLeftColor: focusTask.color }}
            >
              <h3 className="font-bold text-lg text-text-high truncate">
                {focusTask.title}
              </h3>

              <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-orange-500/10 text-orange-400">
                <CardSpecificIcons.Priority size={14} />
                <span>Priority</span>
              </div>
            </div>
            <Link href="/webapp/tasks">
              <button className="w-full mt-4 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 text-sm font-semibold py-2 rounded-md transition-colors">
                View All Tasks
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-background-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-primary-500">
              Today&apos;s First Focus
            </h2>
            <p className="text-text-low ">No task is in focus for today</p>
            <Link href="/webapp/tasks">
              <button className="w-full mt-4 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 text-sm font-semibold py-2 rounded-md transition-colors">
                View All Tasks
              </button>
            </Link>
          </div>
        )}

        {/* Other Tasks - Only show if there are tasks */}
        {otherTasks.filter((t) => t.id !== focusTask?.id).length > 0 && (
          <div className="bg-background-700 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-500">
              Other Tasks
            </h2>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-420px)]">
              {otherTasks
                .filter((t) => t.id !== focusTask?.id)
                .map((task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:w-3/5 xl:w-2/3 space-y-6">
        {/* Schedule View */}
        <div className="bg-background-700 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6 text-primary-500">
            Today&apos;s Schedule
          </h2>
          {scheduledTasks.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {scheduledTasks
                .sort((a, b) => {
                  const timeA = a.startTime!.hour * 60 + a.startTime!.minute;
                  const timeB = b.startTime!.hour * 60 + b.startTime!.minute;
                  return timeA - timeB;
                })
                .map((task) => (
                  <TaskCardSmall key={task.id} task={task} />
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-text-gray mx-auto mb-3" />
              <p className="text-text-low">No scheduled tasks for today</p>
              <p className="text-sm text-text-gray">Your schedule is clear!</p>
            </div>
          )}
        </div>

        {/* Repeating Tasks Today */}
        {todaysRepeatingTasks.length > 0 && (
          <div className="bg-background-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-500">
              Repeating Tasks Due Today
            </h2>
            <div className="space-y-3">
              {todaysRepeatingTasks
                .filter((task) => task.status !== "completed")
                .map((task) => (
                  <RepeatingTaskCardSmall
                    key={task.id}
                    notProcessedTask={task}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
