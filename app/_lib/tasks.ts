import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp, // Important for date conversions
  DocumentData,
  QueryDocumentSnapshot,
  addDoc, // For creating tasks
  updateDoc,
  deleteDoc,
  doc, // For referencing a specific document
  serverTimestamp,
  getDoc,
  deleteField,
  // DocumentSnapshot, // For createdAt, updatedAt
} from "firebase/firestore";
import { db } from "./firebase";
import { Task } from "@/app/_types/types";
import { isSameDay } from "date-fns";

const TASKS_COLLECTION = "tasks";

// Helper to convert Firestore doc to Task object
/**
 * This function centralizes the conversion from a Firestore document snapshot to your Task object, including converting Timestamp objects to JavaScript Date objects.
 * @param snapshot
 * @returns
 */
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Task => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    type: data.type,
    icon: data.icon,
    color: data.color,
    isToday:
      data.isToday ||
      isSameDay((data.dueDate as Timestamp).toDate(), new Date()),
    isPriority: data.isPriority || false,
    isReminder: data.isReminder || false,
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : new Date(),
    status: data.status || "pending",
    delayCount: data.delayCount || 0,
    tags: data.tags || [],
    preconditionTaskIds: data.preconditionTaskIds || [],
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
  } as Task;
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
export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
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
 * Fetches tasks for a given user ID that are due today.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Task[]>} An array of tasks due today.
 */
export const getTodaysTasksByUserId = async (
  userId: string
): Promise<Task[]> => {
  if (!userId) return [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Start of today

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // End of today

  try {
    const tasksCollectionRef = collection(db, TASKS_COLLECTION);
    /* When querying or writing dates, you need to convert JS Date objects to Firestore Timestamp objects. */
    const q = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      where("dueDate", ">=", Timestamp.fromDate(todayStart)),
      where("dueDate", "<=", Timestamp.fromDate(todayEnd)),
      orderBy("dueDate", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot) => fromFirestore(docSnapshot));
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    throw error;
  }
};

/**
 * Fetches tasks for a given user ID that are upcoming (today and one week from now).
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Task[]>} An array of upcoming tasks.
 */
export const getUpcomingTasksByUserId = async (
  userId: string
): Promise<Task[]> => {
  if (!userId) return [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const oneWeekFromNowEnd = new Date(todayStart);
  oneWeekFromNowEnd.setDate(todayStart.getDate() + 7);
  oneWeekFromNowEnd.setHours(23, 59, 59, 999); // End of one week from now

  try {
    const tasksCollectionRef = collection(db, TASKS_COLLECTION);
    const q = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      where("dueDate", ">=", Timestamp.fromDate(todayStart)),
      where("dueDate", "<=", Timestamp.fromDate(oneWeekFromNowEnd)),
      orderBy("dueDate", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot) => fromFirestore(docSnapshot));
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    throw error;
  }
};

/**
 * Fetches missed and delayed tasks for a user.
 * Missed: due date is in the past and status is not 'completed'.
 * Delayed: status is 'delayed'.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{missedTasks: Task[], delayedTasks: Task[]}>}
 */
export const getMissedAndDelayedTasksByUserId = async (
  userId: string
): Promise<{ missedTasks: Task[]; delayedTasks: Task[] }> => {
  if (!userId) return { missedTasks: [], delayedTasks: [] };

  const now = new Date();
  const yesterdayEnd = new Date(now);
  yesterdayEnd.setDate(now.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  try {
    const tasksCollectionRef = collection(db, TASKS_COLLECTION);

    // Query for missed tasks (due in the past, not completed)
    const missedQuery = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      where("dueDate", "<", Timestamp.fromDate(now)), // Due date is in the past
      where("status", "!=", "completed") // Not completed
    );
    const missedSnapshot = await getDocs(missedQuery);
    // Filter out tasks that are marked as 'delayed' because they are handled separately
    const missedTasks = missedSnapshot.docs
      .map((docSnapshot) => fromFirestore(docSnapshot))
      .filter((task) => task.status !== "delayed");

    // Query for delayed tasks
    const delayedQuery = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "delayed")
    );
    const delayedSnapshot = await getDocs(delayedQuery);
    const delayedTasks = delayedSnapshot.docs.map((docSnapshot) =>
      fromFirestore(docSnapshot)
    );

    return { missedTasks, delayedTasks };
  } catch (error) {
    console.error("Error fetching missed and delayed tasks:", error);
    throw error;
  }
};

// --- CRUD Operations for Tasks ---

/**
 * Creates a new task in Firestore.
 * @param {Omit<Task, 'id' | 'createdAt' | 'updatedAt'>} taskData - Data for the new task.
 * @returns {Promise<string>} The ID of the newly created task.
 */
export const createTask = async (
  taskData: Omit<
    Task,
    "id" | "createdAt" | "updatedAt" | "points" | "delayCount" | "status"
  > & { userId: string }
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      dueDate: Timestamp.fromDate(taskData.dueDate), // Convert Date to Timestamp
      status: "pending",
      delayCount: 0,
      points: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Updates an existing task in Firestore.
 * @param {string} taskId - The ID of the task to update.
 * @param {Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>} updates - The fields to update.
 * @returns {Promise<void>}
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, "id" | "userId" | "createdAt">>
): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const updateData: { [key: string]: any } = { ...updates };
    updateData.updatedAt = serverTimestamp();
    if (updates.dueDate && updates.dueDate instanceof Date) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }

    // --- If 'completedAt' is explicitly passed as a Date, convert it ---
    if (updates.completedAt && updates.completedAt instanceof Date) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    } else if (
      updates.hasOwnProperty("completedAt") &&
      updates.completedAt === undefined
    ) {
      updateData.completedAt = deleteField();
    }

    for (const key in updateData) {
      if (updateData[key] === undefined && key !== "completedAt") {
        delete updateData[key];
      } else if (
        updateData[key] === undefined &&
        key === "completedAt" &&
        !(
          updateData[key] instanceof Object &&
          updateData[key].constructor.name === "DeleteFieldValue"
        )
      ) {
        delete updateData[key];
      }
    }

    await updateDoc(taskRef, updateData);
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
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export interface SearchedTask {
  id: string;
  title: string;
  description?: string;
}

export async function searchUserTasks(
  userId: string,
  query: string
): Promise<SearchedTask[]> {
  if (!query.trim()) {
    return [];
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockAllTasks: SearchedTask[] = [
    {
      id: "task1",
      title: "Finalize project proposal",
      description: "Review feedback and update the document for client A.",
    },
    {
      id: "task2",
      title: "Schedule team meeting",
      description: "Discuss Q3 roadmap and resource allocation.",
    },
    {
      id: "task3",
      title: "Buy groceries",
      description: "Milk, eggs, bread, and project snacks.",
    },
    {
      id: "task4",
      title: "Client call: Project Phoenix",
      description: "Discuss milestone 2 deliverables.",
    },
    { id: "task5", title: "Gym session", description: "Leg day, don't skip!" },
    {
      id: "task6",
      title: "Read Next.js documentation",
      description: "Focus on Server Actions and new router features.",
    },
  ];

  const lowerCaseQuery = query.toLowerCase();
  return mockAllTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerCaseQuery) ||
      (task.description &&
        task.description.toLowerCase().includes(lowerCaseQuery))
  );
}
