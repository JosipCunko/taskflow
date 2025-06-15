"use server";

import {
  isSameWeek,
  startOfWeek,
  addDays,
  getDay,
  endOfWeek,
  addWeeks,
  endOfDay,
} from "date-fns";
import {
  formatDate,
  canCompleteRepeatingTaskNow,
  MONDAY_START_OF_WEEK,
} from "../utils";

import {
  ActionResult,
  ActionError,
  Task,
  RepetitionRule,
  DayOfWeek,
} from "../_types/types";
import {
  createTask,
  deleteTask,
  getTaskByTaskId,
  updateTask,
  getTasksByUserId,
} from "./tasks";
import { getServerSession } from "next-auth";
import { logUserActivity } from "./activity";
import { authOptions } from "./auth";
import { generateNotificationsForUser } from "./notifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "next-auth";
import { revalidatePath } from "next/cache";

/* User */
export async function updateUserAction(
  userId: string,
  data: Partial<User>
): Promise<ActionResult> {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, data);
    revalidatePath("/profile");
    return { success: true, message: "User updated" };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to update user" };
  }
}

/* Update */
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

    // Generate notifications after task status change
    if (userId) {
      try {
        const allTasks = await getTasksByUserId(userId);
        await generateNotificationsForUser(userId, allTasks);
      } catch (notificationError) {
        console.error("Error generating notifications:", notificationError);
        // Don't fail the main action if notification generation fails
      }
    }

    revalidatePath("/tasks");
    revalidatePath("/webapp/inbox");
    return { success: true, message: `Task marked as ${newStatus}` };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to update task status",
    };
  }
}
export async function updateTaskExperienceAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newExperience = formData.get("experience") as Task["experience"];
  try {
    await updateTask(taskId, {
      experience: newExperience,
    });

    revalidatePath("/tasks");
    return {
      success: true,
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to update task experience",
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
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const delayOption = formData.get("delayOption") as "tomorrow" | "nextWeek";
  const newDueDateString = formData.get("newDueDate") as string;
  let newDueDate = new Date();
  if (newDueDateString) {
    newDueDate = new Date(newDueDateString);
  }
  if (delayOption === "tomorrow") {
    newDueDate.setDate(newDueDate.getDate() + 1);
  } else if (delayOption === "nextWeek") {
    newDueDate.setDate(newDueDate.getDate() + 7);
  }
  newDueDate.setHours(hour, min);

  console.log(
    `ACTION: Delay Task ${taskId} to ${delayOption} (${formatDate(newDueDate)})`
  );
  try {
    const updatedTask = await updateTask(taskId, {
      dueDate: newDueDate,
      status: "delayed",
      delayCount: delayCount + 1,
    });

    if (userId && updatedTask) {
      await logUserActivity(userId, {
        type: "TASK_DELAYED",
        taskId,
        activityColor: "#cf6679",
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
      }`,
    };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to delay task" };
  }
}

export async function deleteTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  console.log(`ACTION: Delete Task ${taskId}`);

  try {
    const deletedTask = await deleteTask(taskId);
    if (!deletedTask.userId) {
      throw new Error(
        "Deleted task data is incomplete (missing userId). Cannot log activity accurately"
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
    return { success: true, message: "Task deleted" };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to delete task" };
  }
}

export async function togglePriorityAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const currentTask = await getTaskByTaskId(taskId);
  if (!currentTask) return { success: false, error: "Task not found" };
  const newIsPriority = !currentTask.isPriority;
  try {
    await updateTask(taskId, { isPriority: newIsPriority });
    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task priority ${newIsPriority ? "added" : "removed"}`,
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to toggle priority",
    };
  }
}
export async function toggleReminderAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const currentTask = await getTaskByTaskId(taskId);
  if (!currentTask) return { success: false, error: "Task not found" };
  const newIsReminder = !currentTask.isReminder;

  try {
    await updateTask(taskId, { isReminder: newIsReminder });
    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task reminder ${newIsReminder ? "added" : "removed"}`,
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to toggle reminder",
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
    console.error("User not authenticated or user ID missing from session");
    return {
      success: false,
      error: "User not authenticated",
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
    if (session.user.id) {
      try {
        const allTasks = await getTasksByUserId(session.user.id);
        await generateNotificationsForUser(session.user.id, allTasks);
      } catch (notificationError) {
        console.error("Error generating notifications:", notificationError);
      }
    }

    revalidatePath("/tasks");
    revalidatePath("/webapp/inbox");
    return {
      success: true,
      message: "Task created successfully",
    };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to create a task",
    };
  }
}

/**Repeating Tasks */
/**Repeating Tasks */
/**Repeating Tasks */

export async function completeRepeatingTaskWithInterval(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;
  if (!rule.interval || rule.interval <= 0) {
    return {
      success: false,
      error: "Task is not configured for interval completion",
    };
  }

  const { canCompleteNow } = canCompleteRepeatingTaskNow(task);
  if (!canCompleteNow) {
    return {
      success: false,
      error: "Task is not available for completion right now",
    };
  }
  const originalCompletionDate = new Date(completionDate);
  // Next due date
  completionDate.setHours(task.dueDate.getHours());
  completionDate.setMinutes(task.dueDate.getMinutes());
  const nextDueDate = addDays(completionDate, rule.interval);

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      completions: 1,
      // startDate: rule.startDate,
    },
    status: "completed",
    dueDate: nextDueDate,
    completedAt: originalCompletionDate,
  };

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message: `Task completed. Next due on ${formatDate(nextDueDate)}`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function completeRepeatingTaskWithTimesPerWeek(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;

  if (!rule.timesPerWeek || rule.timesPerWeek <= 0) {
    return {
      success: false,
      error: "Task is not configured for times per week completion",
    };
  }

  const { canCompleteNow } = canCompleteRepeatingTaskNow(task);
  if (!canCompleteNow) {
    return {
      success: false,
      error: "Task is not available for completion right now",
    };
  }

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);
  if (!isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }
  rule.completions = rule.completions + 1;

  // Next due date
  let nextDueDate: Date;
  let newStartDate: Date;
  if (rule.completions === rule.timesPerWeek) {
    const nextWeekStart = startOfWeek(
      addWeeks(completionDate, 1),
      MONDAY_START_OF_WEEK
    );
    nextDueDate = endOfDay(endOfWeek(nextWeekStart, MONDAY_START_OF_WEEK));
    newStartDate = nextWeekStart;
  } else {
    nextDueDate = endOfDay(endOfWeek(completionDate, MONDAY_START_OF_WEEK));
    newStartDate = rule.startDate;
  }

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      startDate: newStartDate,
    },
    completedAt: completionDate,
    dueDate: nextDueDate,
  };

  if (rule.completions === rule.timesPerWeek) {
    updates.completedAt = completionDate;
    updates.status = "completed";
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions === rule.timesPerWeek
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions}/${rule.timesPerWeek} times this week)`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function completeRepeatingTaskWithDaysOfWeek(
  task: Task,
  completionDate: Date = new Date()
): Promise<ActionResult> {
  if (!task.isRepeating || !task.repetitionRule) {
    return {
      success: false,
      error: "Task is not a repeating task",
    };
  }
  const rule = task.repetitionRule;
  if (rule.daysOfWeek.length === 0) {
    return {
      success: false,
      error: "Task is not configured for specific days of week",
    };
  }
  const { canCompleteNow } = canCompleteRepeatingTaskNow(task);
  if (!canCompleteNow) {
    return {
      success: false,
      error: "Task is not available for completion right now",
    };
  }
  // Next due date
  const today = getDay(completionDate) as DayOfWeek;

  let nextDueDay = (today + 1) % 7;
  while (!rule.daysOfWeek.includes(nextDueDay as DayOfWeek)) {
    nextDueDay = (nextDueDay + 1) % 7;
  }
  const daysUntilNext = (nextDueDay - today + 7) % 7;
  const newDueDate = addDays(completionDate, daysUntilNext);

  const weekStart = startOfWeek(completionDate, MONDAY_START_OF_WEEK);
  if (!isSameWeek(rule.startDate, weekStart, MONDAY_START_OF_WEEK)) {
    rule.startDate = weekStart;
    rule.completions = 0;
  }
  rule.completions = rule.completions + 1;

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
    },
    completedAt: completionDate,
    dueDate: newDueDate,
  };

  if (rule.completions === rule.daysOfWeek.length) {
    updates.completedAt = completionDate;
    updates.status = "completed";
  }

  try {
    await updateTask(task.id, updates);
    return {
      success: true,
      message:
        rule.completions === rule.daysOfWeek.length
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions}/${rule.daysOfWeek.length} days this week)`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}
