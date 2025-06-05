"use server";

import { revalidatePath } from "next/cache";
import {
  ActionResult,
  ActionError,
  Task,
  RepetitionRule,
} from "../_types/types";
import { createTask, deleteTask, getTaskByTaskId, updateTask } from "./tasks";
import { getServerSession } from "next-auth";
import { logUserActivity } from "./activity";
import { authOptions } from "./auth";
import { format } from "date-fns";

export async function updateTaskStatusAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newStatus = formData.get("newStatus") as Task["status"];
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  console.log(`ACTION: Mark Task ${taskId} as ${newStatus}`);

  try {
    const updatedTask = await updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : undefined,
    });

    if (userId && updatedTask) {
      await logUserActivity(userId, {
        type: "TASK_UPDATED",
        taskId,
        activityColor: "#00c853",
        activityIcon: "CircleCheckBig",
        taskSnapshot: {
          title: updatedTask.title,
          description: updatedTask.description || "",
          color: updatedTask.color,
          icon: updatedTask.icon,
        },
      });
    }

    revalidatePath("/tasks");
    return { success: true, message: `Task marked as ${newStatus}.` };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to update task status.",
    };
  }
}
export async function updateTaskExperienceAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newExperience = formData.get("experience") as Task["experience"];
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  console.log(`ACTION: Mark Task ${taskId} as ${newExperience}`);
  try {
    const updatedTask = await updateTask(taskId, {
      experience: newExperience,
    });

    if (userId && updatedTask) {
      await logUserActivity(userId, {
        type: "EXPERIENCE_RATED",
        taskId,
        activityColor: "#00c853",
        activityIcon: "CircleCheckBig",
        taskSnapshot: {
          title: updatedTask.title,
          description: updatedTask.description || "",
          color: updatedTask.color,
          icon: updatedTask.icon,
        },
      });
    }

    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task experience marked as ${newExperience}.`,
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to update task experience.",
    };
  }
}

export async function delayTaskAction(
  formData: FormData,
  hour: number,
  min: number,
  delayCount: number
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const delayOption = formData.get("delayOption") as "tomorrow" | "nextWeek";
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const newDueDate = new Date();
  if (delayOption === "tomorrow") {
    newDueDate.setDate(newDueDate.getDate() + 1);
  } else if (delayOption === "nextWeek") {
    newDueDate.setDate(newDueDate.getDate() + 7);
  }
  newDueDate.setHours(hour, min);

  console.log(
    `ACTION: Delay Task ${taskId} to ${delayOption} (${newDueDate.toISOString()})`
  );
  try {
    const updatedTask = await updateTask(taskId, {
      dueDate: newDueDate,
      status: "delayed",
      delayCount,
    });

    if (userId && updatedTask) {
      await logUserActivity(userId, {
        type: "TASK_DELAYED",
        taskId,
        activityColor: "#00c853",
        activityIcon: "CircleCheckBig",
        taskSnapshot: {
          title: updatedTask.title,
          description: updatedTask.description || "",
          color: updatedTask.color,
          icon: updatedTask.icon,
        },
      });
    }

    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task delayed to ${
        delayOption === "nextWeek" ? "next week" : "tomorrow"
      }.`,
    };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to delay task." };
  }
}
/** Similar as delayTaskAction */
export async function rescheduleTaskAction(
  formData: FormData,
  hour: number,
  min: number
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newDueDateString = formData.get("newDueDate") as string;
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  if (!newDueDateString) {
    return { success: false, error: "New due date is required." };
  }
  const newDueDate = new Date(newDueDateString);
  newDueDate.setHours(hour, min);

  console.log(
    `ACTION: Reschedule Task ${taskId} to ${newDueDate.toISOString()}`
  );

  try {
    const updatedTask = await updateTask(taskId, {
      dueDate: newDueDate,
      status: "pending",
    });

    if (userId && updatedTask) {
      await logUserActivity(userId, {
        type: "TASK_UPDATED",
        taskId,
        activityColor: "#00c853",
        activityIcon: "CircleCheckBig",
        taskSnapshot: {
          title: updatedTask.title,
          description: updatedTask.description || "",
          color: updatedTask.color,
          icon: updatedTask.icon,
        },
      });
    }

    revalidatePath("/tasks");
    return { success: true, message: "Task rescheduled." };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to reschedule task.",
    };
  }
}

export async function deleteTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated.");
  }

  console.log(`ACTION: Delete Task ${taskId}`);

  try {
    const deletedTask = await deleteTask(taskId);
    if (!deletedTask.userId) {
      throw new Error(
        "Deleted task data is incomplete (missing userId). Cannot log activity accurately."
      );
    }

    await logUserActivity(session.user.id, {
      type: "TASK_DELETED",
      taskId,
      taskSnapshot: {
        title: deletedTask.title,
        description: deletedTask.description || "",
        color: deletedTask.color,
        icon: deletedTask.icon,
      },
      activityColor: "#cf6679",
      activityIcon: "Delete",
    });
    revalidatePath("/tasks");
    return { success: true, message: "Task deleted." };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to delete task." };
  }
}

export async function togglePriorityAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const currentTask = await getTaskByTaskId(taskId);
  if (!currentTask) return { success: false, error: "Task not found." };
  const newIsPriority = !currentTask.isPriority;

  console.log(
    `ACTION: Toggle Priority for Task ${taskId}. New priority: ${newIsPriority}`
  );
  try {
    await updateTask(taskId, { isPriority: newIsPriority });
    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task priority ${newIsPriority ? "added" : "removed"}.`,
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to toggle priority.",
    };
  }
}

/*Create action */
export async function createTaskAction(
  formData: FormData,
  isPriority: boolean,
  isReminder: boolean,
  selectedColor: string,
  icon: string,
  dueDate: Date,
  startTime: { hour: number; minute: number } | undefined,
  tags: string[],
  duration: { hours: number; minutes: number } | undefined,
  isRepeating: boolean,
  repetitionRule: RepetitionRule | undefined
) {
  // Must pass authOptions
  const session = await getServerSession(authOptions);
  // const cookieStore = cookies();
  // const jwt = (await cookieStore).get("next-auth.session-token");

  if (!session || !session.user || !session.user.id) {
    console.error("User not authenticated or user ID missing from session.");
    return {
      success: false,
      error: "User not authenticated.",
    };
  }
  const userId = session.user.id;

  const title = String(formData.get("title"));
  const description = String(formData.get("description") || "");

  const newTaskData: Omit<
    Task,
    "id" | "createdAt" | "updatedAt" | "delayCount" | "status"
  > & { userId: string } = {
    userId,
    title,
    description,
    icon,
    color: selectedColor,
    isPriority,
    isReminder,
    dueDate,
    startTime,
    tags: tags || [],
    isRepeating: isRepeating || false,
  };

  if (duration) {
    newTaskData.duration = duration;
  }
  if (repetitionRule) {
    newTaskData.repetitionRule = repetitionRule;
  }

  console.log("Task to be created via action:", newTaskData);
  try {
    const createdTask = await createTask(newTaskData);

    if (createdTask) {
      await logUserActivity(session.user.id, {
        type: "TASK_CREATED",
        taskId: createdTask.id,
        taskSnapshot: {
          title: createdTask.title,
          description: createdTask.description || "",
          color: createdTask.color,
          icon: createdTask.icon,
        },
        activityColor: "#00c853",
        activityIcon: "CircleCheckBig",
      });
    }
    revalidatePath("/tasks");
    return {
      success: true,
      message: "Task created successfully.",
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to create a task.",
    };
  }
}

// Assume completeRepeatingTaskInstance is your DB logic (e.g., updating subcollection)
// from repeatingTaskUtils.ts conceptually, but needs actual DB code
// For a true Server Action, it would look like:
export async function completeRepeatingTaskInstanceAction(
  taskId: string,
  instanceDate: Date // This should be just the date, time stripped or ignored
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  try {
    // --- THIS IS WHERE YOU PUT YOUR FIRESTORE LOGIC ---
    // 1. Fetch the main repeating task document.
    // 2. Validate the repetition rule and if an instance is due on instanceDate.
    // 3. Update the status of this specific instance.
    // - If using a subcollection 'occurrences':
    // const occurrenceRef = adminDb.doc(`tasks/${taskId}/occurrences/${format(instanceDate, 'yyyy-MM-dd')}`);
    // await occurrenceRef.set({ date: Timestamp.fromDate(startOfDay(instanceDate)), status: 'completed', completedAt: Timestamp.now(), userId: session.user.id }, { merge: true });
    // - If updating fields on the main task document (for 'daily' or 'X times per week'):
    // This is more complex and depends on the rule. Refer to the conceptual logic in repeatingTaskUtils.
    // For example, for daily task:
    // await adminDb.doc(`tasks/${taskId}`).update({ lastInstanceCompletedDate: Timestamp.fromDate(startOfDay(instanceDate)) });
    // For X times per week: calculate completionsThisPeriod, currentPeriodStartDate based on instanceDate, and update.
    // IMPORTANT: Choose ONE method (subcollection OR fields on main doc) and implement consistently.
    // Subcollection is generally more robust.

    console.log(
      `Firestore: Mark task ${taskId} instance for ${format(
        instanceDate,
        "yyyy-MM-dd"
      )} as completed.`
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    await logUserActivity(session.user.id, {
      // Log this activity
      type: "TASK_COMPLETED",
      taskId: taskId,
      details: `Completed repeating task instance for ${format(
        instanceDate,
        "MMM d"
      )}`,
      taskSnapshot: {
        id: taskId,
        title: "Fetched Task Title" /* Fetch actual title for snapshot */,
      },
      activityIcon: "CheckCircle2",
      activityColor: "var(--color-success)",
    });

    revalidatePath("/dashboard"); // Or whatever page shows these tasks
    revalidatePath("/tasks");
    return { success: true, message: "Instance marked complete!" };
  } catch (error) {
    const err = error as Error;
    console.error("Error completing repeating task instance:", err);
    return {
      success: false,
      error: err.message || "Failed to complete instance.",
    };
  }
}
