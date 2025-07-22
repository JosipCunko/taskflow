"use server";

import {
  addDays,
  getDay,
  isSameDay,
  isBefore,
  addWeeks,
  startOfWeek,
} from "date-fns";
import {
  formatDate,
  canCompleteRepeatingTaskNow,
  MONDAY_START_OF_WEEK,
} from "../_utils/utils";

import {
  ActionResult,
  ActionError,
  Task,
  RepetitionRule,
  DayOfWeek,
  TaskToCreateData,
  AppUser,
  CampaignNotification,
  AnalyticsData,
} from "../_types/types";
import {
  createTask,
  deleteTask,
  getTaskByTaskId,
  updateTask,
} from "./tasks-admin";
import { getServerSession } from "next-auth";
import { logUserActivity } from "./activity";
import { authOptions } from "./auth";
import { revalidatePath } from "next/cache";
import { updateUser, updateUserCompletionStats } from "./user-admin";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendCampaignNotification } from "./notifications-admin";
import { checkAndAwardAchievements } from "./achievements";
import { trackTaskAnalytics, getAnalyticsData } from "./analytics-admin";

/* User */
export async function updateUserAction(
  userId: string,
  data: Partial<AppUser>
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }

  const result = await updateUser(userId, data);
  if (result.success) {
    revalidatePath("/webapp/profile");
  }
  return result;
}

/* Update */
export async function completeTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  console.log(`ACTION: Mark Task ${taskId} as completed`);

  try {
    const taskRef = adminDb.collection("tasks").doc(taskId);
    const userRef = adminDb.collection("users").doc(userId);
    const task = await getTaskByTaskId(taskId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");

      transaction.update(taskRef, {
        status: "completed",
        completedAt: new Date(),
      });

      transaction.update(userRef, {
        completedTasksCount: FieldValue.increment(1),
        rewardPoints: FieldValue.increment(task.points),
      });
    });

    if (task) {
      await logUserActivity(userId, {
        type: "TASK_COMPLETED",
        taskId,
        activityColor: "var(--color-success)",
        activityIcon: "CircleCheckBig",
        taskSnapshot: {
          title: task.title,
          color: task.color,
          icon: task.icon,
          dueDate: task.dueDate,
          status: "completed",
          isPriority: task.isPriority,
          isReminder: task.isReminder,
        },
      });

      // Track task completion analytics
      await trackTaskAnalytics(userId, taskId, "task_completed", {
        dueDate: task.dueDate,
        isPriority: task.isPriority,
        isRepeating: task.isRepeating || false,
        createdAt: task.createdAt,
        completedAt: new Date(),
        delayCount: task.delayCount || 0,
      });
    }

    // Check for achievements after task completion
    await checkAndAwardAchievements(userId);

    revalidatePath("/tasks");
    return { success: true, message: `Task marked as completed` };
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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
  dueDate: Date,
  delayCount: number,
  currentTaskDueDate?: Date
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }
  if (currentTaskDueDate) {
    if (
      isSameDay(dueDate, currentTaskDueDate) ||
      isBefore(dueDate, new Date())
    ) {
      return {
        success: false,
        error: "Cannot delay task to the same day or before.",
      };
    }
  }

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
  newDueDate.setHours(dueDate.getHours(), dueDate.getMinutes());

  console.log(`ACTION: Task ${taskId} delayed to ${formatDate(newDueDate)}`);
  try {
    const updatedTask = await updateTask(taskId, {
      dueDate: newDueDate,
      status: "delayed",
      delayCount: delayCount + 1,
    });

    if (updatedTask) {
      await logUserActivity(userId, {
        type: "TASK_DELAYED",
        taskId,
        activityColor: "var(--color-error)",
        activityIcon: "ClockAlert",
        taskSnapshot: {
          title: updatedTask.title,
          color: updatedTask.color,
          icon: updatedTask.icon,
          dueDate: updatedTask.dueDate,
          status: updatedTask.status,
          isPriority: updatedTask.isPriority,
          isReminder: updatedTask.isReminder,
        },
      });

      // Track task delay analytics
      await trackTaskAnalytics(userId, taskId, "task_delayed", {
        dueDate: updatedTask.dueDate,
        isPriority: updatedTask.isPriority,
        isRepeating: updatedTask.isRepeating || false,
        createdAt: updatedTask.createdAt,
        delayCount: updatedTask.delayCount || 0,
      });
    }

    revalidatePath("/tasks");
    return {
      success: true,
      message: `Task delayed to ${formatDate(newDueDate)}`,
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
    return { success: false, error: "User not authenticated" };
  }

  console.log(`ACTION: Delete Task ${taskId}`);

  try {
    const deletedTask = await deleteTask(taskId);

    if (deletedTask) {
      await logUserActivity(session.user.id, {
        type: "TASK_DELETED",
        taskId,
        taskSnapshot: {
          title: deletedTask.title,
          color: deletedTask.color,
          icon: deletedTask.icon,
          dueDate: deletedTask.dueDate,
          status: deletedTask.status,
          isPriority: deletedTask.isPriority,
          isReminder: deletedTask.isReminder,
        },
        activityColor: "var(--color-error)",
        activityIcon: "Delete",
      });

      // Track task deletion analytics
      await trackTaskAnalytics(session.user.id, taskId, "task_deleted", {
        dueDate: deletedTask.dueDate,
        isPriority: deletedTask.isPriority,
        isRepeating: deletedTask.isRepeating || false,
        createdAt: deletedTask.createdAt,
      });
    }
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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

export async function createTaskAction(
  formData: FormData,
  isPriority: boolean,
  isReminder: boolean,
  selectedColor: string,
  icon: string,
  dueDate: Date,
  startTime: { hour: number; minute: number } | undefined,
  tags: string[],
  duration: { hours: number; minutes: number },
  isRepeating: boolean,
  repetitionRule: RepetitionRule | undefined,
  startDate?: Date
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  const userId = session.user.id;

  const title = String(formData.get("title"));
  const description = String(formData.get("description") || "");
  const location = String(formData.get("location") || "");

  const newTaskData: TaskToCreateData = {
    userId,
    title,
    description,
    icon,
    color: selectedColor,
    isPriority,
    isReminder,
    dueDate,
    startDate,
    startTime,
    tags: tags || [],
    isRepeating: isRepeating,
    duration,
    location,
  };

  if (repetitionRule) {
    newTaskData.repetitionRule = repetitionRule;
  }

  console.log("ACTION: Task to be created:", newTaskData);
  try {
    const createdTask = await createTask(newTaskData);

    if (createdTask) {
      await logUserActivity(session.user.id, {
        type: "TASK_CREATED",
        taskId: createdTask.id,
        taskSnapshot: {
          title: createdTask.title,
          color: createdTask.color,
          icon: createdTask.icon,
          dueDate: createdTask.dueDate,
          status: createdTask.status,
          isPriority: createdTask.isPriority,
          isReminder: createdTask.isReminder,
        },
        activityColor: "var(--color-success)",
        activityIcon: "CircleCheckBig",
      });

      // Track task creation analytics
      await trackTaskAnalytics(
        session.user.id,
        createdTask.id,
        "task_created",
        {
          dueDate: createdTask.dueDate,
          isPriority: createdTask.isPriority,
          isRepeating: createdTask.isRepeating || false,
          createdAt: createdTask.createdAt,
        }
      );
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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

  const nextDueDate = new Date(completionDate);
  nextDueDate.setHours(task.dueDate.getHours(), task.dueDate.getMinutes());
  const finalDueDate = addDays(nextDueDate, rule.interval);

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: 1,
    },
    status: "completed",
    dueDate: finalDueDate,
    completedAt: completionDate,
  };

  try {
    await updateTask(task.id, updates);
    await updateUserCompletionStats(session.user.id, task.points);

    // Check for achievements after task completion
    await checkAndAwardAchievements(session.user.id);

    return {
      success: true,
      message: `Task completed. Next due on ${formatDate(finalDueDate)}`,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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

  // Next due date for "times per week" is the end of the week or next week
  let newStartDate: Date;
  let nextDueDate: Date = task.dueDate;
  if (rule.completions + 1 === rule.timesPerWeek) {
    const nextWeekStart = startOfWeek(
      addWeeks(completionDate, 1),
      MONDAY_START_OF_WEEK
    );
    newStartDate = nextWeekStart;
    nextDueDate = nextWeekStart;
  } else {
    newStartDate = task.startDate || new Date();
    nextDueDate = addDays(completionDate, 1);
  }
  // Next due date for "times per week" is the next day
  nextDueDate.setHours(task.dueDate.getHours(), task.dueDate.getMinutes());

  const updates: Partial<Task> = {
    startDate: newStartDate,
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: rule.completions + 1,
    },
    completedAt: completionDate,
    dueDate: nextDueDate,
  };

  if (rule.completions + 1 === rule.timesPerWeek) {
    updates.completedAt = completionDate;
    updates.status = "completed";
  }

  try {
    await updateTask(task.id, updates);
    await updateUserCompletionStats(session.user.id, task.points);

    // Check for achievements after task completion
    await checkAndAwardAchievements(session.user.id);

    return {
      success: true,
      message:
        rule.completions === rule.timesPerWeek
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions + 1}/${
              rule.timesPerWeek
            } times this week)`,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "User not authenticated" };
  }
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
  const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);

  let nextDueDay = sortedDays.find((day) => day > today);

  if (nextDueDay === undefined) {
    // if no day found, take the first day of next week
    nextDueDay = sortedDays[0];
  }

  const daysUntilNext =
    nextDueDay > today ? nextDueDay - today : 7 - today + nextDueDay;

  // Calculate new due date but preserve original time
  const newDueDate = addDays(completionDate, daysUntilNext);
  newDueDate.setHours(task.dueDate.getHours(), task.dueDate.getMinutes());

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: rule.completions + 1,
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
    await updateUserCompletionStats(session.user.id, task.points);

    // Check for achievements after task completion
    await checkAndAwardAchievements(session.user.id);

    return {
      success: true,
      message:
        rule.completions === rule.daysOfWeek.length
          ? "Task fully completed for this week"
          : `Task completed (${rule.completions + 1}/${
              rule.daysOfWeek.length
            } days this week)`,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function sendCampaignNotificationAction(
  userIds: string[],
  campaign: CampaignNotification
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const result = await sendCampaignNotification(userIds, campaign);

    revalidatePath("/webapp/inbox");
    revalidatePath("/webapp");

    return {
      success: true,
      message: `Campaign sent successfully! ${result.sent} sent, ${result.failed} failed`,
    };
  } catch (error) {
    console.error("Error sending campaign:", error);
    return { success: false, error: "Failed to send campaign" };
  }
}

// NEeds to be an action performing server side because getAnalyticsData needs to be called server side, and we are doing that by an action in AnalyticsDashboard.tsx
export async function getAnalyticsDataAction(): Promise<AnalyticsData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  return getAnalyticsData(session.user.id);
}
