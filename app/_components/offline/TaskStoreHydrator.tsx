"use client";

import { useEffect, useRef } from "react";
import type { Task } from "@/app/_types/types";
import { useTaskStore } from "@/app/_store/taskStore";
import { refreshPendingCount } from "@/app/_lib/offlineTaskQueue";

/**
 * Copies the task list the webapp layout already fetches into the client store
 * and the IndexedDB cache, so the app has data to render when the network goes
 * away mid-session. The server render stays the source of truth while online.
 */
export default function TaskStoreHydrator({
  userId,
  tasks,
}: {
  userId: string;
  tasks: Task[];
}) {
  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    const signature = `${userId}:${tasks.length}:${tasks
      .map((task) => `${task.id}@${task.updatedAt}`)
      .join(",")}`;
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    useTaskStore.getState().hydrateFromServer(userId, tasks);
  }, [userId, tasks]);

  useEffect(() => {
    void refreshPendingCount();
  }, []);

  return null;
}
