"use client";

import { CalendarDays, WifiOff } from "lucide-react";
import type { Task } from "@/app/_types/types";
import { useTaskStore } from "@/app/_store/taskStore";
import TasksPageClient from "@/app/webapp/tasks/TasksPageClient";
import Calendar from "@/app/webapp/calendar/Calendar";
import TodayPlanSection from "../TodayPlanSection";
import CompletedTasksClient from "@/app/webapp/completed/CompletedTasksClient";
import OfflineDashboard from "./OfflineDashboard";
import OfflineUnavailable from "./OfflineUnavailable";

/**
 * Routes that can be rendered from cached task data alone. Everything else
 * under /webapp needs the server, so it gets an explanation instead.
 */
const OFFLINE_ROUTES = new Set([
  "/webapp",
  "/webapp/tasks",
  "/webapp/calendar",
  "/webapp/today",
  "/webapp/completed",
]);

const ROUTE_LABELS: Record<string, string> = {
  "/webapp/inbox": "Inbox",
  "/webapp/notes": "Notes",
  "/webapp/health": "Health",
  "/webapp/fitness": "Fitness",
  "/webapp/ai": "AI",
  "/webapp/profile": "Profile",
};

/** `/webapp/` and `/webapp` are the same route; so are nested fitness pages. */
export function normalizeAppPath(pathname: string) {
  const trimmed =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return trimmed || "/webapp";
}

export function canRenderOffline(pathname: string) {
  return OFFLINE_ROUTES.has(normalizeAppPath(pathname));
}

function routeLabel(pathname: string) {
  const path = normalizeAppPath(pathname);
  const match = Object.keys(ROUTE_LABELS).find(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  return match ? ROUTE_LABELS[match] : "This page";
}

export default function OfflineRouteView({ pathname }: { pathname: string }) {
  const tasks = useTaskStore((state) => state.tasks);
  const source = useTaskStore((state) => state.source);
  const path = normalizeAppPath(pathname);

  if (!canRenderOffline(path)) {
    return <OfflineUnavailable label={routeLabel(path)} />;
  }

  if (source === "none") {
    return <NoCachedTasks />;
  }

  switch (path) {
    case "/webapp/tasks":
      return <TasksPageClient tasks={tasks} />;
    case "/webapp/calendar":
      return (
        <div className="container mx-auto text-text-low p-1 sm:p-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
              <CalendarDays className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
              <span className="text-glow">My Calendar</span>
            </h1>
            <p className="text-text-low mt-1 text-sm sm:text-base">
              Manage your schedule and tasks efficiently.
            </p>
          </div>
          <Calendar
            tasks={tasks.filter((task) => !task.isRepeating)}
            repeatingTasks={tasks.filter((task) => task.isRepeating)}
          />
        </div>
      );
    case "/webapp/today":
      return (
        <div className="container mx-auto p-1 sm:p-6 pb-8 space-y-6">
          <TodayPlanSection todayTasks={relevantTodayTasks(tasks)} />
        </div>
      );
    case "/webapp/completed":
      return <CompletedTasksClient tasks={tasks} />;
    default:
      return <OfflineDashboard tasks={tasks} />;
  }
}

/**
 * Mirrors the filter in the today page: everything unfinished, plus whatever
 * was completed today.
 */
function relevantTodayTasks(tasks: Task[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return tasks.filter((task) => {
    if (task.status !== "completed") return true;
    if (task.completedAt) return task.completedAt >= startOfToday.getTime();
    return true;
  });
}

function NoCachedTasks() {
  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8">
      <div className="mt-8 grid place-items-center">
        <div className="max-w-md text-center flex flex-col items-center gap-4 bg-background-700 rounded-lg p-8">
          <div className="p-5 bg-background-800 rounded-full border border-primary-500/40">
            <WifiOff className="size-12 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-primary-400">
            No tasks on this device
          </h1>
          <p className="text-text-low">
            Your tasks are cached the first time the app loads with a
            connection. Reconnect once and this page will work offline.
          </p>
        </div>
      </div>
    </div>
  );
}
