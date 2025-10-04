import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import { CardSpecificIcons } from "@/app/_utils/icons";
import { Clock, Clock7, Notebook } from "lucide-react";
import Link from "next/link";
import { isToday, isBefore, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { getStartAndEndTime } from "@/app/_utils/utils";

import TaskCardSmall from "@/app/_components/TaskCardSmall";
import RepeatingTaskCard from "@/app/_components/RepeatingTaskCard";
import TodayPlanSection from "@/app/_components/TodayPlanSection";
import { Task } from "@/app/_types/types";
import { autoDelayIncompleteTodayTasks } from "@/app/_lib/actions";

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  
  // Auto-delay incomplete tasks from previous days
  await autoDelayIncompleteTodayTasks();
  
  const allUserTasks = await getTasksByUserId(userId);
  
  // Filter out completed tasks from previous days
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

  const todaysTasks: Task[] = [];
  const todaysRepeatingTasks: Task[] = [];
  const todayNotCompletedTasks: Task[] = [];
  const todayPlanTasks: Task[] = [];

  relevantTasks.forEach((task) => {
    if (isToday(task.dueDate)) {
      // Add all today's tasks to todayPlanTasks for the new plan section
      todayPlanTasks.push(task);
      
      if (task.isRepeating) todaysRepeatingTasks.push(task);
      else {
        if (task.status !== "completed") todaysTasks.push(task);
        else todayNotCompletedTasks.push(task);
      }
    }
  });

  const allTodaysTasks = [...todaysTasks, ...todaysRepeatingTasks];

  const scheduledTasks = allTodaysTasks.filter((task) => {
    const { startTime, endTime } = getStartAndEndTime(task);
    return (
      (startTime !== "00:00" || endTime !== "23:59") &&
      task.status !== "completed"
    );
  });
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
    <div className="container mx-auto p-1 sm:p-6 space-y-6 overflow-y-auto">
      {/* New Today's Plan Section */}
      <TodayPlanSection todayTasks={todayPlanTasks} />
      
      {/* Existing Sections */}
      <div className="grid grid-rows-[20rem_20rem_20rem] sm:grid-rows-[30rem] grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-background-700 p-6 rounded-lg shadow overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-primary-500">
          Today&apos;s Schedule
        </h2>
        {todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks
              .sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return (
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                );
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

      <div className="bg-background-700 p-4 rounded-lg shadow overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary-500">
          Other Tasks
        </h2>
        <div>
          {todayNotCompletedTasks.length > 0 ? (
            <div className="space-y-3">
              {todayNotCompletedTasks.map((task) => (
                <TaskCardSmall key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Notebook className="w-12 h-12 text-text-gray mx-auto mb-3" />
              <p className="text-text-low">
                No other tasks that were completed today
              </p>
              <p className="text-sm text-text-gray">
                That doesn&apos; mean you should rest!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background-700 p-6 rounded-lg shadow overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-primary-500">
          Repeating Tasks Due Today
        </h2>
        {todaysRepeatingTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysRepeatingTasks.map((task) => (
              <RepeatingTaskCard key={task.id} notProcessedTask={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock7 className="w-12 h-12 text-text-gray mx-auto mb-3" />
            <p className="text-text-low">No repeating tasks for today</p>
            <p className="text-sm text-text-gray">Your schedule is clear!</p>
          </div>
        )}
      </div>
      <div className="bg-background-700 p-6 rounded-lg shadow max-h-fit">
        <h2 className="text-xl font-semibold mb-4 text-primary-400">
          Today&apos;s First Focus
        </h2>
        {focusTask ? (
          <>
            <div
              className="p-4 rounded-lg border-l-4 flex items-center gap-2"
              style={{ borderLeftColor: focusTask.color }}
            >
              <h3 className="font-bold text-lg text-text-low truncate">
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
          </>
        ) : (
          <>
            <p className="text-text-gray text-pretty text-center ">
              No task is in focus for today
            </p>
            <Link href="/webapp/tasks">
              <button className="w-full mt-4 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 text-sm font-semibold py-2 rounded-md transition-colors">
                View All Tasks
              </button>
            </Link>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
