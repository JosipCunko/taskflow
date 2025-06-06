import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getTasksByUserId } from "@/app/_lib/tasks";
import TaskCardSmall from "@/app/_components/TaskCardSmall";
import { isTaskDueOn } from "@/app/utils";
import { Clock, Star } from "lucide-react";
import Link from "next/link";

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

  const todaysTasks = allUserTasks.filter((task) =>
    isTaskDueOn(task, new Date())
  );
  const scheduledTasks = todaysTasks.filter(
    (task) => task.startTime && task.status !== "completed"
  );
  const otherTasks = todaysTasks.filter(
    (task) => !task.startTime || task.isRepeating
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
    nextUpcomingTask || otherTasks.find((t) => t.isPriority) || otherTasks[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-background-800 text-text-high min-h-screen">
      <div className="lg:w-2/5 xl:w-1/3 space-y-6">
        {focusTask && (
          <div className="bg-background-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-400">
              Today&apos;s Focus
            </h2>
            <div
              className="p-4 rounded-lg border-l-4"
              style={{ borderLeftColor: focusTask.color }}
            >
              <h3 className="font-bold text-lg text-text-high truncate">
                {focusTask.title}
              </h3>
              <p className="text-sm text-text-gray mt-1 truncate">
                {focusTask.description || "No description."}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-low mt-3">
                {focusTask.startTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {`${String(focusTask.startTime.hour).padStart(
                      2,
                      "0"
                    )}:${String(focusTask.startTime.minute).padStart(2, "0")}`}
                  </span>
                )}
                {focusTask.isPriority && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Star size={14} />
                    Priority
                  </span>
                )}
              </div>
            </div>
            <Link href="/webapp/tasks">
              <button className="w-full mt-4 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 text-sm font-semibold py-2 rounded-md transition-colors">
                View All Tasks
              </button>
            </Link>
          </div>
        )}

        <div className="bg-background-700 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary-500">
            Other Tasks
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-420px)]">
            {otherTasks.length > 0 ? (
              otherTasks
                .filter((t) => t.id !== focusTask?.id)
                .map((task) => <TaskCardSmall key={task.id} task={task} />)
            ) : (
              <p className="text-text-low p-2">No other tasks for today.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-3/5 xl:w-2/3 bg-background-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-primary-500">
          Today&apos;s Schedule
        </h2>
        <div className="grid grid-rows-24 gap-px bg-background-600 border border-background-500 rounded h-[calc(100vh-120px)] overflow-y-auto">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              className="h-20 relative border-b border-background-500 p-1 flex items-start"
              style={{ gridRow: `${hour + 1} / span 1` }}
            >
              <span className="text-xs text-text-low absolute top-1 left-1">
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`}
              </span>
              {scheduledTasks
                .filter((task) => task.startTime?.hour === hour)
                .map((task) => {
                  const durationMinutesTotal =
                    (task.duration?.hours || 0) * 60 +
                    (task.duration?.minutes || 0);
                  const startMinute = task.startTime?.minute || 0;
                  const taskHeight =
                    Math.max(durationMinutesTotal, 15) * (80 / 60); // min height 20px (for 15min)
                  const taskTop = startMinute * (80 / 60);

                  return (
                    <div
                      key={task.id}
                      className="absolute rounded-md p-2 overflow-hidden text-xs w-[calc(100%-4rem)] left-12"
                      style={{
                        top: `${taskTop}px`,
                        height: `${taskHeight}px`,
                        backgroundColor: task.color,
                        opacity: 0.85,
                      }}
                    >
                      <p className="font-semibold text-white truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-gray-200 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
