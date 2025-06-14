import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  deleteField,
  FieldValue,
  // DocumentSnapshot, // For createdAt, updatedAt
} from "firebase/firestore";
import { db } from "./firebase";
import { RepetitionRule, SearchedTask, Task } from "@/app/_types/types";
import { calculateTaskPoints, isTaskAtRisk } from "@/app/utils";
import { updateUserRewardPoints } from "./user";

// Define a type for the data structure being written to Firestore for a new task
interface TaskFirestoreData {
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  dueDate: Timestamp; // Firestore Timestamp
  startTime?: { hour: number; minute: number };
  status: "pending" | "completed" | "delayed";
  delayCount: number;
  tags?: string[];
  createdAt: FieldValue; // serverTimestamp()
  updatedAt: FieldValue; // serverTimestamp()
  experience?: "bad" | "okay" | "good" | "best";
  duration?: { hours: number; minutes: number };
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule; // Assuming RepetitionRule is already storable as is or needs conversion
}

const TASKS_COLLECTION = "tasks";

// Helper to convert Firestore doc to Task object
/**
 * This function centralizes the conversion from a Firestore document snapshot to your Task object, including converting Timestamp objects to JavaScript Date objects.
 * @param snapshot
 * @returns
 */
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Task => {
  const data = snapshot.data();
  const task = {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    icon: data.icon,
    color: data.color,
    isPriority: data.isPriority || false,
    isReminder: data.isReminder || false,
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : new Date(),
    startTime: data.startTime || undefined,
    status: data.status || "pending",
    delayCount: data.delayCount || 0,
    tags: data.tags || [],
    createdAt: data.createdAt
      ? (data.createdAt as Timestamp).toDate()
      : new Date(),
    updatedAt: data.updatedAt
      ? (data.updatedAt as Timestamp).toDate()
      : new Date(),
    completedAt: data.completedAt
      ? (data.completedAt as Timestamp).toDate()
      : undefined,
    experience: data.experience,
    duration: data.duration || undefined,
    isRepeating: data.isRepeating || false,
    repetitionRule: data.repetitionRule
      ? {
          ...data.repetitionRule,
          startDate: data.repetitionRule.startDate.toDate(),
          lastInstanceCompletedDate:
            data.repetitionRule.lastInstanceCompletedDate?.toDate(),
        }
      : undefined,
  } as Task;

  // Add risk calculation for all tasks
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
    const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
    const docSnap = await getDoc(taskDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    return fromFirestore(docSnap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error("Error fetching tasks by task ID:", error);
    throw error;
  }
};

/**
 * Fetches all tasks for a given user ID.
 * @param {string} userId - The ID of the user whose tasks to fetch.
 * @returns {Promise<Task[]>} An array of tasks.
 */
export const getTasksByUserId = async (
  userId: string | undefined
): Promise<Task[]> => {
  if (!userId) {
    console.warn("getTasksByUserId called without a userId.");
    return [];
  }

  try {
    const tasksCollectionRef = collection(db, TASKS_COLLECTION);
    // Query for tasks belonging to the user, order by creation date or due date
    const q = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      orderBy("dueDate", "asc")
      // Might want other orderings, e.g., orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const tasks: Task[] = querySnapshot.docs.map((docSnapshot) =>
      fromFirestore(docSnapshot)
    );

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks by user ID:", error);
    throw error;
  }
};

/**
 * Creates a new task in Firestore.
 * @param {Omit<Task, 'id' | 'createdAt' | 'updatedAt'>} taskData - Data for the new task.
 * @returns {Promise<Task>}
 */
export const createTask = async (
  taskData: Omit<
    Task,
    "id" | "createdAt" | "updatedAt" | "delayCount" | "status"
  > & { userId: string }
): Promise<Task> => {
  try {
    // Construct the object for Firestore using the defined interface
    const taskToCreateFirebase: TaskFirestoreData = {
      userId: taskData.userId,
      title: taskData.title,
      description: taskData.description,
      icon: taskData.icon,
      color: taskData.color,
      isPriority: taskData.isPriority,
      isReminder: taskData.isReminder,
      dueDate: Timestamp.fromDate(taskData.dueDate),
      status: "pending", // Initial status
      delayCount: 0, // Initial delayCount
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: taskData.tags || [],
      isRepeating: taskData.isRepeating || false,
      // Optional fields, only add if they exist in taskData
    };

    if (taskData.startTime) {
      taskToCreateFirebase.startTime = taskData.startTime;
    }
    if (taskData.duration) {
      taskToCreateFirebase.duration = taskData.duration;
    }
    if (taskData.experience) {
      taskToCreateFirebase.experience = taskData.experience;
    }
    if (taskData.repetitionRule) {
      taskToCreateFirebase.repetitionRule = taskData.repetitionRule;
    }

    const docRef = await addDoc(
      collection(db, TASKS_COLLECTION),
      taskToCreateFirebase
    );

    const createdDocSnap = await getDoc(docRef);
    const createdTask = fromFirestore(
      createdDocSnap as QueryDocumentSnapshot<DocumentData>
    );

    return createdTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Updates an existing task in Firestore.
 * @param {string} taskId - The ID of the task to update.
 * @param {Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>} updates - The fields to update.
 * @returns {Promise<Task>}
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, "id" | "userId" | "createdAt">>
): Promise<Task> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const taskOldSnap = await getDoc(taskRef);

    if (!taskOldSnap.exists()) {
      throw new Error("Task not found for update");
    }
    const taskOld = fromFirestore(
      taskOldSnap as QueryDocumentSnapshot<DocumentData>
    );
    const pointsOld = calculateTaskPoints(taskOld);

    const updateData: {
      [key: string]:
        | FieldValue
        | string
        | number
        | boolean
        | Date
        | Timestamp
        | string[]
        | undefined
        | RepetitionRule
        | { hour: number; minute: number }
        | { hours: number; minutes: number };
    } = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof Date) {
          updateData[key] = Timestamp.fromDate(value);
        } else if (key === "startTime" || key === "duration") {
          updateData[key] = value;
        } else {
          updateData[key] = value;
        }
      }
    });

    updateData.updatedAt = serverTimestamp();

    if (updates.dueDate && updates.dueDate instanceof Date) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }

    if (updates.completedAt && updates.completedAt instanceof Date) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    } else if (
      updates.hasOwnProperty("completedAt") &&
      updates.completedAt === undefined
    ) {
      updateData.completedAt = deleteField();
    }

    if (updates.startTime) {
      updateData.startTime = updates.startTime;
    }
    if (updates.duration) {
      updateData.duration = updates.duration;
    }

    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === undefined &&
        key !== "completedAt" &&
        key !== "startTime" &&
        key !== "duration"
      ) {
        delete updateData[key];
      }
    });

    await updateDoc(taskRef, updateData);

    const updatedDocSnap = await getDoc(taskRef);
    if (!updatedDocSnap.exists()) {
      throw new Error("Task not found after update");
    }
    const taskNew = fromFirestore(
      updatedDocSnap as QueryDocumentSnapshot<DocumentData>
    );
    const pointsNew = calculateTaskPoints(taskNew);

    const deltaPoints = pointsNew - pointsOld;
    if (taskNew.userId && deltaPoints !== 0) {
      await updateUserRewardPoints(taskNew.userId, deltaPoints);
    }

    return taskNew;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Deletes a task from Firestore.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId: string): Promise<Task> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const taskDocSnap = await getDoc(taskRef);
    if (!taskDocSnap.exists()) {
      console.warn(`Task ${taskId} not found for deletion.`);
      throw new Error("Task not found for deletion point calculation.");
    }

    const taskOld = fromFirestore(
      taskDocSnap as QueryDocumentSnapshot<DocumentData>
    );
    const pointsOld = calculateTaskPoints(taskOld);

    // Perform the deletion
    await deleteDoc(taskRef);

    // After deletion, the task's contribution to points is 0.
    // The delta is 0 - pointsOld.
    if (taskOld.userId) {
      await updateUserRewardPoints(taskOld.userId, -pointsOld);
    }

    return taskOld; // Return the data of the task that was deleted
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export async function searchUserTasks(
  query: string,
  tasks: Task[]
): Promise<SearchedTask[]> {
  if (!query.trim()) {
    return [];
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const filteredUserTasks = tasks.filter((task) => {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      icon: task.icon,
      color: task.color,
    };
  });

  const lowerCaseQuery = query.toLowerCase();
  return filteredUserTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerCaseQuery) ||
      (task.description &&
        task.description.toLowerCase().includes(lowerCaseQuery))
  );
}
