import "server-only";
import admin from "firebase-admin";
import { adminDb } from "./admin";
import {
  RepetitionRule,
  Task,
  TaskToCreateData,
  TaskToUpdateData,
} from "@/app/_types/types";
import {
  calculateTaskPoints,
  isTaskAtRisk,
  safeConvertToTimestamp,
} from "@/app/_utils/utils";
import { Timestamp } from "firebase-admin/firestore";
import { cache } from "react";
import { decryptField, encryptField } from "./encryption";

const fromFirestore = (
  snapshot: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
): Task => {
  const data = snapshot.data();
  const task = {
    id: snapshot.id,
    userId: data.userId,
    // title/description are encrypted at rest; decrypt for use in the app.
    title: decryptField(data.title),
    description: decryptField(data.description),
    icon: data.icon,
    color: data.color,
    isPriority: data.isPriority,
    isReminder: data.isReminder,
    dueDate: safeConvertToTimestamp(data.dueDate),
    startTime: data.startTime || { hour: 0, minute: 0 },
    status: data.status || "pending",
    delayCount: data.delayCount || 0,
    tags: data.tags || [],
    createdAt: safeConvertToTimestamp(data.createdAt),
    updatedAt: safeConvertToTimestamp(data.updatedAt),
    completedAt: data.completedAt
      ? safeConvertToTimestamp(data.completedAt)
      : undefined,
    experience: data.experience || undefined,
    duration: data.duration || { hours: 0, minutes: 0 },
    location: data.location || undefined,
    isRepeating: data.isRepeating,
    repetitionRule: data.repetitionRule
      ? {
          ...data.repetitionRule,
          completedAt: data.repetitionRule.completedAt
            ? data.repetitionRule.completedAt.map(
                (date: Timestamp | Date | string | number) =>
                  safeConvertToTimestamp(date)
              )
            : [],
        }
      : undefined,
    startDate: data.startDate
      ? safeConvertToTimestamp(data.startDate)
      : undefined,
    points: data.points,
  } as Task;

  const taskWithRisk = {
    ...task,
    risk: isTaskAtRisk(task),
  };

  return taskWithRisk;
};

async function getTaskByTaskIdInternal(taskId: string): Promise<Task | null> {
  if (!taskId) {
    console.warn("getTaskByTaskId called without a taskId.");
    return null;
  }
  try {
    const taskDocRef = adminDb.collection("tasks").doc(taskId);
    const docSnap = await taskDocRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return fromFirestore(
      docSnap as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );
  } catch (error) {
    console.error("Error fetching tasks by task ID:", error);
    throw error;
  }
}

export const getTaskByTaskId = cache(
  async (taskId: string): Promise<Task | null> => {
    return getTaskByTaskIdInternal(taskId);
  }
);

async function getTasksByUserIdInternal(
  userId: string | undefined
): Promise<Task[]> {
  if (!userId) {
    console.warn("getTasksByUserId called without a userId.");
    return [];
  }

  try {
    const tasksRef = adminDb.collection("tasks");
    const tasksQuery = tasksRef
      .where("userId", "==", userId)
      .orderBy("dueDate", "asc");
    const tasksSnapshot = await tasksQuery.get();

    const tasks: Task[] = tasksSnapshot.docs.map((doc) => {
      return fromFirestore(
        doc as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
      );
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks by user ID:", error);
    throw error;
  }
}

/**
 * Tasks are not stored in the Next.js Data Cache.
 * They change from other devices, server actions, and daily repeating-task
 * resets, so a cross-request cache is always wrong.
 *
 * Do not wrap this in React.cache() either: today-page auto-delay (and similar
 * writes) can happen in the same request after the layout has already read
 * tasks, and React.cache cannot be invalidated mid-request.
 */
export const getTasksByUserId = async (
  userId: string | undefined
): Promise<Task[]> => {
  return getTasksByUserIdInternal(userId);
};

interface TaskFirestoreData {
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  dueDate: number;
  startDate?: number;
  startTime: { hour: number; minute: number };
  status: "pending";
  delayCount: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  experience?: "bad" | "okay" | "good" | "best";
  duration?: { hours: number; minutes: number };
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  points: number;
  location?: string;
  autoDelay?: boolean;
}

export const createTask = async (taskData: TaskToCreateData): Promise<Task> => {
  try {
    const now = Date.now();
    const taskToCreateFirebase: TaskFirestoreData = {
      userId: taskData.userId,
      // title/description are free-text user content, so they're encrypted
      // at rest (see app/_lib/encryption.ts) and decrypted in fromFirestore.
      title: encryptField(taskData.title) as string,
      description: encryptField(taskData.description),
      icon: taskData.icon,
      color: taskData.color,
      isPriority: taskData.isPriority,
      isReminder: taskData.isReminder,
      tags: taskData.tags || [],
      status: "pending",
      delayCount: 0,
      createdAt: now,
      updatedAt: now,
      dueDate: taskData.dueDate,
      startTime: taskData.startTime || { hour: 0, minute: 0 },
      isRepeating: taskData.isRepeating,
      points: calculateTaskPoints({ delayCount: 0 } as Task),
      location: taskData.location,
      autoDelay: taskData.autoDelay,
    };

    if (
      taskData.duration &&
      (taskData.duration.hours > 0 || taskData.duration.minutes > 0)
    ) {
      taskToCreateFirebase.duration = taskData.duration;
    }
    if (taskData.experience) {
      taskToCreateFirebase.experience = taskData.experience;
    }
    if (taskData.repetitionRule) {
      taskToCreateFirebase.repetitionRule = taskData.repetitionRule;
    }
    if (taskData.startDate) {
      taskToCreateFirebase.startDate = taskData.startDate;
    }

    const docRef = await adminDb.collection("tasks").add(taskToCreateFirebase);

    const createdDocSnap = await docRef.get();
    const createdTask = fromFirestore(
      createdDocSnap as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );

    // Calculate and update risk after creation
    const risk = isTaskAtRisk(createdTask);
    if (risk !== createdTask.risk) {
      await docRef.update({ risk });
      createdTask.risk = risk;
    }

    return createdTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (
  taskId: string,
  updates: TaskToUpdateData
): Promise<Task> => {
  try {
    const taskRef = adminDb.collection("tasks").doc(taskId);

    const updateData: { [key: string]: unknown } = {
      ...updates,
      updatedAt: Date.now(),
    };

    // title/description are encrypted at rest - re-encrypt whenever they're
    // part of this update.
    if (updates.title !== undefined) {
      updateData.title = encryptField(updates.title);
    }
    if (updates.description !== undefined) {
      updateData.description = encryptField(updates.description);
    }

    // All date fields are already UNIX timestamps (numbers) in the updates object
    // No need to convert them anymore

    if (updates.repetitionRule) {
      updateData.repetitionRule = updates.repetitionRule;
    }

    updates.risk = isTaskAtRisk(updates as Task);

    await taskRef.update(updateData);
    const updatedDocSnap = await taskRef.get();
    return fromFirestore(
      updatedDocSnap as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<Task> => {
  try {
    const taskRef = adminDb.collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      throw new Error("Task not found for deletion");
    }
    const taskToDelete = fromFirestore(
      taskSnap as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );
    await taskRef.delete();
    return taskToDelete;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};
