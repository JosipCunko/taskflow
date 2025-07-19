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
import { revalidateTag, unstable_cache } from "next/cache";

// Helper function to safely convert dates from either Timestamp or ISO string
const safeConvertToDate = (
  dateValue: Timestamp | Date | string | undefined
): Date => {
  if (!dateValue) return new Date();

  // If it's already a Date object, return it
  if (dateValue instanceof Date) return dateValue;

  // If it's a Firestore Timestamp, convert it
  if (
    dateValue &&
    typeof dateValue === "object" &&
    "toDate" in dateValue &&
    typeof dateValue.toDate === "function"
  ) {
    return new Date(dateValue.toDate());
  }

  // If it's an ISO string or any other format, try to parse it
  return new Date(dateValue as string);
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
    dueDate: safeConvertToDate(data.dueDate),
    startTime: data.startTime || { hour: 0, minute: 0 },
    status: data.status || "pending",
    delayCount: data.delayCount || 0,
    tags: data.tags || [],
    createdAt: safeConvertToDate(data.createdAt),
    updatedAt: safeConvertToDate(data.updatedAt),
    completedAt: data.completedAt
      ? safeConvertToDate(data.completedAt)
      : undefined,
    experience: data.experience || undefined,
    duration: data.duration || { hours: 0, minutes: 0 },
    isRepeating: data.isRepeating,
    repetitionRule: data.repetitionRule
      ? {
          ...data.repetitionRule,
          completedAt: data.repetitionRule.completedAt
            ? data.repetitionRule.completedAt.map(
                (date: Timestamp | Date | string) => safeConvertToDate(date)
              )
            : [],
        }
      : undefined,
    startDate: data.startDate ? safeConvertToDate(data.startDate) : undefined,
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

// Problem with caching - Dates are converted to ISO strings
export const getTasksByUserId = unstable_cache(
  async (userId: string | undefined): Promise<Task[]> => {
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
  },
  ["getTasksByUserId"],
  {
    tags: ["tasks"],
  }
);

interface TaskFirestoreData {
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  dueDate: Timestamp;
  startDate?: Timestamp;
  startTime: { hour: number; minute: number };
  status: "pending";
  delayCount: number;
  tags?: string[];
  createdAt: FieldValue;
  updatedAt: FieldValue;
  experience?: "bad" | "okay" | "good" | "best";
  duration?: { hours: number; minutes: number };
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  points: number;
  location?: string;
}

export const createTask = async (taskData: TaskToCreateData): Promise<Task> => {
  try {
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      dueDate: Timestamp.fromDate(taskData.dueDate),
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
      taskToCreateFirebase.startDate = Timestamp.fromDate(taskData.startDate);
    }

    const docRef = await adminDb.collection("tasks").add(taskToCreateFirebase);

    const createdDocSnap = await docRef.get();
    const createdTask = fromFirestore(
      createdDocSnap as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
    );
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
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
    }
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.repetitionRule) {
      updateData.repetitionRule = updates.repetitionRule;
    }
    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(
        new Date(updates.completedAt)
      );
    }

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
