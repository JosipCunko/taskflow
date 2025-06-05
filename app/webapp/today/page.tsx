/*
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getTasksByUserId } from "@/app/_lib/tasks";
import { Task } from "@/app/_types/types";
import TaskCardSmall from "@/app/_components/TaskCardSmall";

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
  // Fetch all tasks and then filter, or have specific fetchers.
  // getTodaysTasksByUserId likely fetches non-repeating tasks due today based on dueDate.
  // For repeating tasks, we need to evaluate their rules against today.
  const allUserTasks = await getTasksByUserId(userId); // Fetch all tasks to process repeating ones

  // Separate tasks for left (timed schedule) and right (other/all-day/repeating)
  const leftBlockTasks: Task[] = [];
  const rightBlockTasks: Task[] = [];

  allUserTasks.forEach((task) => {
    if (
      task.startTime &&
      task.duration &&
      (task.duration.hours > 0 || task.duration.minutes > 0) &&
      !task.isRepeating
    ) {
      // Ensure it is actually due on this specific date for non-repeating tasks.
      // For repeating, isTaskRepeatingAndDueToday already confirmed it for the current iteration.
      if (!task.isRepeating && isTaskDueOn(task, new Date())) {
        leftBlockTasks.push(task);
      } else if (
        task.isRepeating &&
        isTaskRepeatingAndDueToday(task, new Date())
      ) {
        // This logic path for repeating tasks might be redundant if primary filter is robust
        // but ensures repeating tasks with startime/duration if any, go to right.
        rightBlockTasks.push(task);
      }
    } else {
      rightBlockTasks.push(task);
    }
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-background-800 text-text-high min-h-screen">
      <div className="lg:w-3/5 xl:w-2/3 bg-background-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-primary-500">
          Todays Schedule
        </h2>
        <div className="grid grid-rows-24 gap-px bg-background-600 border border-background-500 rounded">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              className="h-20 relative border-b border-background-500 p-1 flex items-start" // Increased height for tasks
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
              {leftBlockTasks
                .filter((task) => task.startTime?.hour === hour)
                .map((task) => {
                  const durationMinutesTotal =
                    (task.duration?.hours || 0) * 60 +
                    (task.duration?.minutes || 0);
                  const startMinute = task.startTime?.minute || 0;

                  // Calculate height based on duration: 20px per 15 min? 80px per hour (h-20 on parent)
                  // Total height of hour slot is h-20 (80px). 1.33px per minute.
                  const taskHeight = (durationMinutesTotal / 60) * 100; // Percentage of the hour slot height
                  const taskTop = (startMinute / 60) * 100; // Percentage from the top of the hour slot

                  return (
                    <div
                      key={task.id}
                      className="absolute rounded-md p-2 overflow-hidden text-xs"
                      style={{
                        top: `${taskTop}%`,
                        height: `${taskHeight}%`,
                        left: "10%",
                        right: "2%",
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

      <div className="lg:w-2/5 xl:w-1/3 bg-background-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-primary-500">
          Other Tasks and Repeating
        </h2>
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          {rightBlockTasks.length > 0 ? (
            rightBlockTasks.map((task) => (
              <TaskCardSmall key={task.id} task={task} />
            ))
          ) : (
            <p className="text-text-low">No other tasks for today.</p>
          )}
        </div>
      </div>
    </div>
  );
}*/
