import "server-only";
import admin from "firebase-admin";
import { adminDb } from "./admin";
import {
  RepetitionRule,
  Task,
  TaskToCreateData,
  TaskToUpdateData,
} from "@/app/_types/types";
import { calculateTaskPoints, isTaskAtRisk } from "@/app/_utils/utils";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";

// Helper function to safely convert Firestore data to UNIX timestamps
const safeConvertToTimestamp = (
  dateValue: Timestamp | Date | string | number | undefined
): number => {
  if (!dateValue) return Date.now();

  // If it's already a number (UNIX timestamp), return it
  if (typeof dateValue === "number") return dateValue;

  // If it's a Date object, convert to timestamp
  if (dateValue instanceof Date) return dateValue.getTime();

  // If it's a Firestore Timestamp, convert it
  if (
    dateValue &&
    typeof dateValue === "object" &&
    "toDate" in dateValue &&
    typeof dateValue.toDate === "function"
  ) {
    return dateValue.toDate().getTime();
  }

  // If it's an ISO string or any other format, try to parse it
  return new Date(dateValue as string).getTime();
};

const fromFirestore = (
  snapshot: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
): Task => {
  const data = snapshot.data();
  const task = {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
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
                (date: Timestamp | Date | string | number) => safeConvertToTimestamp(date)
              )
            : [],
        }
      : undefined,
    startDate: data.startDate ? safeConvertToTimestamp(data.startDate) : undefined,
    points: data.points,
  } as Task;

  const taskWithRisk = {
    ...task,
    risk: isTaskAtRisk(task),
  };

  return taskWithRisk;
};

export const getTaskByTaskId = async (taskId: string): Promise<Task | null> => {
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
};

export const getTasksByUserId = async (
  userId: string | undefined
): Promise<Task[]> => {
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
};

interface TaskFirestoreData {
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  dueDate: number; // UNIX timestamp
  startDate?: number; // UNIX timestamp
  startTime: { hour: number; minute: number };
  status: "pending";
  delayCount: number;
  tags?: string[];
  createdAt: number; // UNIX timestamp
  updatedAt: number; // UNIX timestamp
  experience?: "bad" | "okay" | "good" | "best";
  duration?: { hours: number; minutes: number };
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  points: number;
  location?: string;
}

export const createTask = async (taskData: TaskToCreateData): Promise<Task> => {
  try {
    const now = Date.now();
    const taskToCreateFirebase: TaskFirestoreData = {
      userId: taskData.userId,
      title: taskData.title,
      description: taskData.description,
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

    revalidateTag("tasks");
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

    // All date fields are already UNIX timestamps (numbers) in the updates object
    // No need to convert them anymore
    
    if (updates.repetitionRule) {
      updateData.repetitionRule = updates.repetitionRule;
    }
    
    updates.risk = isTaskAtRisk(updates as Task);

    await taskRef.update(updateData);
    revalidateTag("tasks");
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
    revalidateTag("tasks");
    return taskToDelete;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};
