"use client";

import type { ActionResult, RepetitionRule, Task } from "../_types/types";
import {
  STORES,
  addPendingAction,
  countPendingActions,
  deletePendingAction,
  getPendingActions,
  type PendingAction,
} from "../_utils/offlineStorage";
import { useTaskStore } from "../_store/taskStore";
import {
  completeTaskAction,
  createTaskAction,
  delayTaskAction,
  deleteTaskAction,
  togglePriorityAction,
  toggleReminderAction,
} from "./actions";

/** Fields the create action reads out of its FormData. */
export interface QueuedCreateFields {
  title: string;
  description: string;
  location: string;
  isPriority: boolean;
  isReminder: boolean;
  color: string;
  icon: string;
  dueDate: number;
  startTime?: { hour: number; minute: number };
  tags: string[];
  duration: { hours: number; minutes: number };
  isRepeating: boolean;
  repetitionRule?: RepetitionRule;
  startDate?: number;
  autoDelay?: boolean;
}

export type QueuedMutation =
  | { kind: "create"; tempId: string; fields: QueuedCreateFields }
  | { kind: "complete"; taskId: string }
  | {
      kind: "delay";
      taskId: string;
      dueDate: number;
      delayCount: number;
      delayOption?: "tomorrow" | "nextWeek";
      newDueDate?: string;
      currentTaskDueDate?: number;
    }
  | { kind: "delete"; taskId: string }
  | { kind: "togglePriority"; taskId: string }
  | { kind: "toggleReminder"; taskId: string };

const OFFLINE_ID_PREFIX = "offline-";

export function isOfflineTaskId(taskId: string) {
  return taskId.startsWith(OFFLINE_ID_PREFIX);
}

function newOfflineId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${OFFLINE_ID_PREFIX}${random}`;
}

/**
 * A failed server action surfaces as `TypeError: Failed to fetch` with no
 * status code, which is indistinguishable from a bug unless we check for it.
 * Safari says "Load failed", Firefox "NetworkError".
 */
export function isNetworkError(error: unknown): boolean {
  if (!navigator.onLine) return true;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("fetch failed")
  );
}

function mutationType(mutation: QueuedMutation): PendingAction["type"] {
  if (mutation.kind === "create") return "CREATE";
  if (mutation.kind === "delete") return "DELETE";
  return "UPDATE";
}

async function refreshPendingCount() {
  try {
    useTaskStore.getState().setPendingCount(await countPendingActions());
  } catch {
    // Counting is only used for the banner copy.
  }
}

async function enqueue(mutation: QueuedMutation) {
  await addPendingAction({
    id: newOfflineId(),
    type: mutationType(mutation),
    storeName: STORES.TASKS,
    data: mutation,
    timestamp: Date.now(),
  });
  await refreshPendingCount();
}

function queuedResult<T>(): ActionResult<T> {
  return {
    success: true,
    message: "Saved on this device. It will sync when you're back online.",
  };
}

/**
 * Runs a task mutation, falling back to the offline queue.
 *
 * When the write reaches the server we do not touch the store: the actions
 * call `revalidateTaskData`, so the webapp layout re-renders and re-seeds the
 * store with authoritative data. `applyLocally` is only for the queued path.
 */
async function runTaskMutation<T>(
  mutation: QueuedMutation,
  applyLocally: () => void,
  perform: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  if (!navigator.onLine) {
    applyLocally();
    await enqueue(mutation);
    return queuedResult<T>();
  }

  try {
    return await perform();
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    applyLocally();
    await enqueue(mutation);
    return queuedResult<T>();
  }
}

function createFormData(fields: QueuedCreateFields) {
  const formData = new FormData();
  formData.set("title", fields.title);
  formData.set("description", fields.description);
  formData.set("location", fields.location);
  return formData;
}

function callCreateAction(fields: QueuedCreateFields) {
  return createTaskAction(
    createFormData(fields),
    fields.isPriority,
    fields.isReminder,
    fields.color,
    fields.icon,
    fields.dueDate,
    fields.startTime,
    fields.tags,
    fields.duration,
    fields.isRepeating,
    fields.repetitionRule,
    fields.startDate,
    fields.autoDelay,
  );
}

/** The task shown while a queued create waits for a connection. */
function offlineTask(
  tempId: string,
  userId: string,
  fields: QueuedCreateFields,
): Task {
  const now = Date.now();
  return {
    id: tempId,
    userId,
    title: fields.title,
    description: fields.description || undefined,
    icon: fields.icon,
    color: fields.color,
    isPriority: fields.isPriority,
    isReminder: fields.isReminder,
    delayCount: 0,
    autoDelay: fields.autoDelay,
    tags: fields.tags,
    createdAt: now,
    updatedAt: now,
    location: fields.location || undefined,
    dueDate: fields.dueDate,
    startDate: fields.startDate,
    startTime: fields.startTime || { hour: 0, minute: 0 },
    status: "pending",
    isRepeating: fields.isRepeating,
    repetitionRule: fields.repetitionRule,
    duration: fields.duration,
    points: 10,
  };
}

export function createTaskOfflineFirst(
  userId: string,
  fields: QueuedCreateFields,
): Promise<ActionResult<Task>> {
  const tempId = newOfflineId();
  return runTaskMutation(
    { kind: "create", tempId, fields },
    () => useTaskStore.getState().upsertTask(offlineTask(tempId, userId, fields)),
    () => callCreateAction(fields),
  );
}

function taskIdFormData(taskId: string) {
  const formData = new FormData();
  formData.set("taskId", taskId);
  return formData;
}

export function completeTaskOfflineFirst(task: Task) {
  return runTaskMutation(
    { kind: "complete", taskId: task.id },
    () =>
      useTaskStore
        .getState()
        .patchTask(task.id, { status: "completed", completedAt: Date.now() }),
    () => completeTaskAction(taskIdFormData(task.id)),
  );
}

export function deleteTaskOfflineFirst(task: Task) {
  return runTaskMutation(
    { kind: "delete", taskId: task.id },
    () => useTaskStore.getState().removeTask(task.id),
    () => deleteTaskAction(taskIdFormData(task.id)),
  );
}

export function togglePriorityOfflineFirst(task: Task) {
  return runTaskMutation(
    { kind: "togglePriority", taskId: task.id },
    () =>
      useTaskStore
        .getState()
        .patchTask(task.id, { isPriority: !task.isPriority }),
    () => togglePriorityAction(taskIdFormData(task.id)),
  );
}

export function toggleReminderOfflineFirst(task: Task) {
  return runTaskMutation(
    { kind: "toggleReminder", taskId: task.id },
    () =>
      useTaskStore
        .getState()
        .patchTask(task.id, { isReminder: !task.isReminder }),
    () => toggleReminderAction(taskIdFormData(task.id)),
  );
}

/** Mirrors the date maths in `delayTaskAction` so the offline UI agrees. */
function resolveDelayedDueDate(mutation: {
  dueDate: number;
  delayOption?: "tomorrow" | "nextWeek";
  newDueDate?: string;
}) {
  const base = mutation.newDueDate
    ? new Date(mutation.newDueDate).getTime()
    : Date.now();
  const next = new Date(base);
  if (mutation.delayOption === "tomorrow") {
    next.setDate(next.getDate() + 1);
  } else if (mutation.delayOption === "nextWeek") {
    next.setDate(next.getDate() + 7);
  }
  const current = new Date(mutation.dueDate);
  next.setHours(current.getHours(), current.getMinutes());
  return next.getTime();
}

function delayFormData(mutation: Extract<QueuedMutation, { kind: "delay" }>) {
  const formData = taskIdFormData(mutation.taskId);
  if (mutation.delayOption) formData.set("delayOption", mutation.delayOption);
  if (mutation.newDueDate) formData.set("newDueDate", mutation.newDueDate);
  return formData;
}

export function delayTaskOfflineFirst(options: {
  task: Task;
  delayOption?: "tomorrow" | "nextWeek";
  newDueDate?: string;
  /** Set only for the reschedule form, which validates against it. */
  currentTaskDueDate?: number;
}) {
  const mutation: Extract<QueuedMutation, { kind: "delay" }> = {
    kind: "delay",
    taskId: options.task.id,
    dueDate: options.task.dueDate,
    delayCount: options.task.delayCount,
    delayOption: options.delayOption,
    newDueDate: options.newDueDate,
    currentTaskDueDate: options.currentTaskDueDate,
  };

  return runTaskMutation(
    mutation,
    () =>
      useTaskStore.getState().patchTask(options.task.id, {
        dueDate: resolveDelayedDueDate(mutation),
        status: "delayed",
        delayCount: options.task.delayCount + 1,
      }),
    () =>
      delayTaskAction(
        delayFormData(mutation),
        options.task.dueDate,
        options.task.delayCount,
        options.currentTaskDueDate,
      ),
  );
}

export interface FlushResult {
  synced: number;
  /** Left in the queue because the connection dropped again. */
  deferred: number;
  /** Dropped because the server rejected them; retrying would never help. */
  discarded: number;
}

async function replay(
  mutation: QueuedMutation,
  idMap: Map<string, string>,
): Promise<ActionResult<Task | null>> {
  if (mutation.kind === "create") {
    const result = await callCreateAction(mutation.fields);
    if (result.success && result.data) {
      idMap.set(mutation.tempId, result.data.id);
      const store = useTaskStore.getState();
      store.removeTask(mutation.tempId);
      store.upsertTask(result.data);
    }
    return result;
  }

  // A task created offline has a temp id. Anything queued against it has to be
  // rewritten to the real id once the create lands.
  const taskId = idMap.get(mutation.taskId) ?? mutation.taskId;
  if (isOfflineTaskId(taskId)) {
    return { success: false, error: "Queued task was never created" };
  }

  switch (mutation.kind) {
    case "complete":
      return completeTaskAction(taskIdFormData(taskId));
    case "delete":
      return deleteTaskAction(taskIdFormData(taskId));
    case "togglePriority":
      return togglePriorityAction(taskIdFormData(taskId));
    case "toggleReminder":
      return toggleReminderAction(taskIdFormData(taskId));
    case "delay":
      return delayTaskAction(
        delayFormData({ ...mutation, taskId }),
        mutation.dueDate,
        mutation.delayCount,
        mutation.currentTaskDueDate,
      );
  }
}

let flushInFlight: Promise<FlushResult> | null = null;

/**
 * Replays queued writes oldest-first. Stops at the first network failure so
 * order is preserved; a write the server rejects is dropped rather than
 * blocking the queue behind it forever.
 */
export function flushPendingActions(): Promise<FlushResult> {
  if (flushInFlight) return flushInFlight;

  const run = (async () => {
    const result: FlushResult = { synced: 0, deferred: 0, discarded: 0 };
    const store = useTaskStore.getState();

    let queued: PendingAction[];
    try {
      queued = await getPendingActions();
    } catch (error) {
      console.warn("Could not read the offline queue:", error);
      return result;
    }

    if (queued.length === 0) {
      store.setPendingCount(0);
      return result;
    }

    store.setIsSyncing(true);
    const idMap = new Map<string, string>();

    try {
      const ordered = [...queued].sort((a, b) => a.timestamp - b.timestamp);
      for (let index = 0; index < ordered.length; index++) {
        const action = ordered[index];
        const mutation = action.data as QueuedMutation;

        try {
          const actionResult = await replay(mutation, idMap);
          await deletePendingAction(action.id);
          if (actionResult.success) {
            result.synced++;
          } else {
            result.discarded++;
            console.warn(
              `Dropped queued ${mutation.kind}: ${actionResult.error}`,
            );
          }
        } catch (error) {
          if (isNetworkError(error)) {
            result.deferred = ordered.length - index;
            break;
          }
          await deletePendingAction(action.id);
          result.discarded++;
          console.warn(`Dropped queued ${mutation.kind}:`, error);
        }
      }
    } finally {
      store.setIsSyncing(false);
      await refreshPendingCount();
    }

    return result;
  })();

  flushInFlight = run;
  void run.finally(() => {
    if (flushInFlight === run) flushInFlight = null;
  });
  return run;
}

export { refreshPendingCount };
