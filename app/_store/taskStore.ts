"use client";

import { create } from "zustand";
import type { Task } from "../_types/types";
import {
  STORES,
  getAllFromOfflineStorage,
  replaceOfflineStore,
} from "../_utils/offlineStorage";

/**
 * Where the tasks currently in the store came from. The offline banner uses
 * this so it only claims to be showing cached data when there is any.
 */
export type TaskSource = "none" | "cache" | "server";

interface TaskStoreState {
  tasks: Task[];
  source: TaskSource;
  userId: string | null;
  /** Number of writes waiting for a connection. */
  pendingCount: number;
  isSyncing: boolean;

  hydrateFromServer: (userId: string, tasks: Task[]) => void;
  hydrateFromCache: (userId: string) => Promise<void>;
  upsertTask: (task: Task) => void;
  patchTask: (taskId: string, patch: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setPendingCount: (count: number) => void;
  setIsSyncing: (isSyncing: boolean) => void;
}

/**
 * IndexedDB is unavailable in some privacy modes and can fail on quota. Task
 * data is a cache, so a write failure must never break the UI.
 */
function persist(tasks: Task[]) {
  void replaceOfflineStore(STORES.TASKS, tasks).catch((error) => {
    console.warn("Could not cache tasks for offline use:", error);
  });
}

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  source: "none",
  userId: null,
  pendingCount: 0,
  isSyncing: false,

  hydrateFromServer: (userId, tasks) => {
    set({ tasks, source: "server", userId });
    persist(tasks);
  },

  hydrateFromCache: async (userId) => {
    // A server hydration is always fresher than the cache.
    if (get().source === "server") return;
    try {
      const cached = await getAllFromOfflineStorage<Task>(
        STORES.TASKS,
        "userId",
        userId,
      );
      if (get().source === "server") return;
      set({
        tasks: cached,
        source: cached.length > 0 ? "cache" : "none",
        userId,
      });
    } catch (error) {
      console.warn("Could not read cached tasks:", error);
    }
  },

  upsertTask: (task) => {
    const tasks = get().tasks.some((existing) => existing.id === task.id)
      ? get().tasks.map((existing) =>
          existing.id === task.id ? task : existing,
        )
      : [...get().tasks, task];
    set({ tasks });
    persist(tasks);
  },

  patchTask: (taskId, patch) => {
    const tasks = get().tasks.map((task) =>
      task.id === taskId ? { ...task, ...patch } : task,
    );
    set({ tasks });
    persist(tasks);
  },

  removeTask: (taskId) => {
    const tasks = get().tasks.filter((task) => task.id !== taskId);
    set({ tasks });
    persist(tasks);
  },

  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}));

/** True when there is task data on the device to render without a network. */
export function useHasOfflineTasks() {
  return useTaskStore((state) => state.source !== "none");
}

/**
 * After the layout hydrates the store, that list is the live copy (including
 * optimistic offline writes). Until then, fall back to whatever the server
 * rendered into the page.
 */
export function useHydratedTasks(fallback: Task[]) {
  const tasks = useTaskStore((state) => state.tasks);
  const source = useTaskStore((state) => state.source);
  return source === "none" ? fallback : tasks;
}
