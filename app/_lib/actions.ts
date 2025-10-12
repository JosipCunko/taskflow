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
  UserNutritionGoals,
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
import { revalidatePath, revalidateTag } from "next/cache";
import { updateUser, updateUserCompletionStats } from "./user-admin";
import { CacheTags } from "../_utils/serverCache";
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
    // Invalidate user cache to ensure fresh data
    revalidateTag(CacheTags.user(userId));
    revalidateTag(CacheTags.users());
    revalidatePath("/webapp/profile");
    revalidatePath("/webapp");
  }
  return result;
}
export async function setUserNutritionGoalsAction(
  dailyCalories: number,
  dailyProtein: number,
  dailyCarbs: number,
  dailyFat: number
): Promise<ActionResult<UserNutritionGoals>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const goals: UserNutritionGoals = {
      calories: dailyCalories,
      carbs: dailyCarbs,
      protein: dailyProtein,
      fat: dailyFat,
      updatedAt: Date.now(),
    };

    await adminDb.collection("users").doc(session.user.id).update({
      nutritionGoals: goals,
    });

    // Invalidate user cache to ensure fresh nutrition goals
    revalidateTag(CacheTags.user(session.user.id));
    revalidateTag(CacheTags.userHealth(session.user.id));
    revalidatePath("/webapp/health");
    revalidatePath("/webapp");

    return {
      success: true,
      data: goals,
    };
  } catch (error) {
    console.error("Error setting nutrition goals:", error);
    return {
      success: false,
      error: "Failed to set nutrition goals",
    };
  }
}

/* Tasks */
export async function createTaskAction(
  formData: FormData,
  isPriority: boolean,
  isReminder: boolean,
  selectedColor: string,
  icon: string,
  dueDate: number,
  startTime: { hour: number; minute: number } | undefined,
  tags: string[],
  duration: { hours: number; minutes: number },
  isRepeating: boolean,
  repetitionRule: RepetitionRule | undefined,
  startDate?: number
): Promise<ActionResult<Task>> {
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

      console.log(createdTask);
      await trackTaskAnalytics(
        session.user.id,
        createdTask.id,
        "task_created",
        {
          dueDate: createdTask.dueDate,
          isPriority: createdTask.isPriority,
          isRepeating: createdTask.isRepeating || false,
          createdAt: createdTask.createdAt,
          points: createdTask.points,
          isReminder: createdTask.isReminder,
          risk: createdTask.risk,
          delayCount: createdTask.delayCount || 0,
        }
      );
      return {
        success: true,
        message: "Task created successfully",
        data: createdTask,
      };
    } else {
      console.warn("ACTION: createdTask is null or undefined after creation.");
      return {
        success: false,
        error: "Task creation returned no data.",
      };
    }
  } catch (err) {
    const error = err as ActionError;
    console.error("ACTION: Error in createTaskAction:", error);
    return {
      success: false,
      error: error.message || "Failed to create a task",
    };
  }
}

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
        completedAt: Date.now(),
      });

      transaction.update(userRef, {
        completedTasksCount: FieldValue.increment(1),
        rewardPoints: FieldValue.increment(task.points),
        lastLoginAt: Date.now(),
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

      await trackTaskAnalytics(userId, taskId, "task_completed", {
        dueDate: task.dueDate,
        isReminder: task.isReminder,
        isPriority: task.isPriority,
        isRepeating: false,
        createdAt: task.createdAt,
        completedAt: Date.now(),
        delayCount: task.delayCount || 0,
        points: task.points,
      });
    }

    // Check for achievements after task completion
    await checkAndAwardAchievements(userId);

    // Invalidate caches for fresh data
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(userId));
    revalidateTag(CacheTags.task(taskId));
    revalidateTag(CacheTags.user(userId)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
    return { success: true, message: `Task marked as completed` };
  } catch (err) {
    const error = err as ActionError;
    return {
      success: false,
      error: error.message || "Failed to update task status",
    };
  }
}

export async function delayTaskAction(
  formData: FormData,
  dueDate: number,
  delayCount: number,
  currentTaskDueDate?: number
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
      isBefore(dueDate, Date.now())
    ) {
      return {
        success: false,
        error: "Cannot delay task to the same day or before.",
      };
    }
  }

  const delayOption = formData.get("delayOption") as "tomorrow" | "nextWeek";
  const newDueDateString = formData.get("newDueDate") as string;
  let newDueDate = Date.now();
  if (newDueDateString) {
    newDueDate = new Date(newDueDateString).getTime();
  }
  // Extract time components from current dueDate
  const dueDateObj = new Date(dueDate);
  const hours = dueDateObj.getHours();
  const minutes = dueDateObj.getMinutes();

  const newDueDateObj = new Date(newDueDate);
  if (delayOption === "tomorrow") {
    newDueDateObj.setDate(newDueDateObj.getDate() + 1);
  } else if (delayOption === "nextWeek") {
    newDueDateObj.setDate(newDueDateObj.getDate() + 7);
  }
  newDueDateObj.setHours(hours, minutes);
  newDueDate = newDueDateObj.getTime();

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

      await trackTaskAnalytics(userId, taskId, "task_delayed", {
        dueDate: updatedTask.dueDate,
        isPriority: updatedTask.isPriority,
        isReminder: updatedTask.isReminder,
        isRepeating: updatedTask.isRepeating || false,
        risk: updatedTask.risk,
        createdAt: updatedTask.createdAt,
        delayCount: updatedTask.delayCount || 0,
        points: updatedTask.points,
      });
    }

    // Invalidate task caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(userId));
    revalidateTag(CacheTags.task(taskId));
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
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

      await trackTaskAnalytics(session.user.id, taskId, "task_deleted", {
        dueDate: deletedTask.dueDate,
        isPriority: deletedTask.isPriority,
        isReminder: deletedTask.isReminder,
        isRepeating: deletedTask.isRepeating || false,
        createdAt: deletedTask.createdAt,
        points: deletedTask.points,
      });
    }
    
    // Invalidate task caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(taskId));
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
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
    
    // Invalidate task caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(taskId));
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
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
    
    // Invalidate task caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(taskId));
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
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

    // Invalidate task caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(taskId));
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");
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

/* Repeating Tasks */
export async function completeRepeatingTaskWithInterval(
  task: Task,
  completionDate: number = Date.now()
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

  const completionDateObj = new Date(completionDate);
  const taskDueDateObj = new Date(task.dueDate);
  completionDateObj.setHours(
    taskDueDateObj.getHours(),
    taskDueDateObj.getMinutes()
  );
  const finalDueDate = addDays(completionDateObj, rule.interval);
  const finalDueDateTimestamp = finalDueDate.getTime();

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: 1,
    },
    status: "completed",
    dueDate: finalDueDateTimestamp,
    completedAt: completionDate,
  };

  try {
    await updateTask(task.id, updates);
    await updateUserCompletionStats(session.user.id, task.points);

    // Check for achievements after task completion
    await checkAndAwardAchievements(session.user.id);

    await trackTaskAnalytics(session.user.id, task.id, "task_completed", {
      dueDate: task.dueDate,
      isReminder: task.isReminder,
      isPriority: task.isPriority,
      isRepeating: true,
      createdAt: task.createdAt,
      completedAt: Date.now(),
      delayCount: task.delayCount || 0,
      points: task.points,
      risk: false,
    });

    // Invalidate caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(task.id));
    revalidateTag(CacheTags.user(session.user.id)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");

    return {
      success: true,
      message: `Task completed. Next due on ${formatDate(
        finalDueDateTimestamp
      )}`,
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
  completionDate: number = Date.now()
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
  let newStartDate: number;
  let nextDueDateObj: Date;
  if (rule.completions + 1 === rule.timesPerWeek) {
    const nextWeekStart = startOfWeek(
      addWeeks(new Date(completionDate), 1),
      MONDAY_START_OF_WEEK
    );
    newStartDate = nextWeekStart.getTime();
    nextDueDateObj = nextWeekStart;
  } else {
    newStartDate = task.startDate || Date.now();
    nextDueDateObj = addDays(new Date(completionDate), 1);
  }
  // Next due date for "times per week" is the next day
  const taskDueDateObj = new Date(task.dueDate);
  nextDueDateObj.setHours(
    taskDueDateObj.getHours(),
    taskDueDateObj.getMinutes()
  );
  const nextDueDate = nextDueDateObj.getTime();

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

    await trackTaskAnalytics(session.user.id, task.id, "task_completed", {
      dueDate: task.dueDate,
      isReminder: task.isReminder,
      isPriority: task.isPriority,
      isRepeating: true,
      createdAt: task.createdAt,
      completedAt: Date.now(),
      delayCount: task.delayCount || 0,
      points: task.points,
      risk: false,
    });

    // Invalidate caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(task.id));
    revalidateTag(CacheTags.user(session.user.id)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");

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
  completionDate: number = Date.now()
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
  const today = getDay(new Date(completionDate)) as DayOfWeek;
  const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);

  let nextDueDay = sortedDays.find((day) => day > today);

  if (nextDueDay === undefined) {
    // if no day found, take the first day of next week
    nextDueDay = sortedDays[0];
  }

  const daysUntilNext =
    nextDueDay > today ? nextDueDay - today : 7 - today + nextDueDay;

  // Calculate new due date but preserve original time
  const newDueDateObj = addDays(new Date(completionDate), daysUntilNext);
  const taskDueDateObj = new Date(task.dueDate);
  newDueDateObj.setHours(
    taskDueDateObj.getHours(),
    taskDueDateObj.getMinutes()
  );
  const newDueDate = newDueDateObj.getTime();

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

    await trackTaskAnalytics(session.user.id, task.id, "task_completed", {
      dueDate: task.dueDate,
      isReminder: task.isReminder,
      isPriority: task.isPriority,
      isRepeating: true,
      createdAt: task.createdAt,
      completedAt: Date.now(),
      delayCount: task.delayCount || 0,
      points: task.points,
      risk: false,
    });

    // Invalidate caches
    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(task.id));
    revalidateTag(CacheTags.user(session.user.id)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");

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

/* FCM  */
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

/* Analytics */
/* Analytics */
/* Analytics */
// Needs to be an action performing server side because getAnalyticsData needs to be called server side, and we are doing that by an action in AnalyticsDashboard.tsx
export async function getAnalyticsDataAction(): Promise<AnalyticsData | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  return getAnalyticsData(session.user.id);
}

/* YouTube Summarizer */
/* YouTube Summarizer */
/* YouTube Summarizer */
export async function processYouTubeSummaryAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has already processed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const existingSummary = await adminDb
      .collection("youtubeSummaries")
      .where("userId", "==", session.user.id)
      .where("createdAt", ">=", todayTimestamp)
      .limit(1)
      .get();

    if (!existingSummary.empty) {
      return {
        success: true,
        message: "YouTube summary already processed today",
      };
    }

    // Make internal API call to process YouTube summary
    const response = await fetch(`/api/youtube/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to process YouTube summary",
      };
    }
    const result = await response.json();
    if (result.success) {
      revalidatePath("/webapp/inbox");
      revalidatePath("/webapp/tasks");
      revalidatePath("/webapp");
    }

    return result;
  } catch (error) {
    console.error("Error processing YouTube summary:", error);
    return {
      success: false,
      error: "Failed to process YouTube summary",
    };
  }
}

export async function updateYouTubePreferencesAction(
  enabled: boolean,
  createTasks: boolean = true,
  createNotifications: boolean = true
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    await adminDb.collection("users").doc(session.user.id).update({
      youtubePreferences: {
        enabled,
        createTasks,
        createNotifications,
      },
    });

    // Invalidate user cache
    revalidateTag(CacheTags.user(session.user.id));
    revalidatePath("/webapp/profile");
    revalidatePath("/webapp");

    return {
      success: true,
      message: "YouTube preferences updated successfully",
    };
  } catch (error) {
    console.error("Error updating YouTube preferences:", error);
    return {
      success: false,
      error: "Failed to update YouTube preferences",
    };
  }
}

/* Today Tasks Management */
export async function autoDelayIncompleteTodayTasks(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Get all today's tasks that are not completed
    const tasksRef = adminDb.collection("tasks");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = tomorrow.getTime();

    const incompleteTodayTasksSnapshot = await tasksRef
      .where("userId", "==", session.user.id)
      .where("status", "in", ["pending", "delayed"])
      .get();

    const batch = adminDb.batch();
    let delayedCount = 0;

    incompleteTodayTasksSnapshot.docs.forEach((doc) => {
      const taskData = doc.data();
      // taskData.dueDate is already a number (UNIX timestamp) in the new system
      const taskDueDate = new Date(taskData.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      const taskDueDateTimestamp = taskDueDate.getTime();

      // Only delay tasks that were due today or earlier and are not repeating
      if (taskDueDateTimestamp < todayTimestamp && !taskData.isRepeating) {
        const originalDueDate = new Date(taskData.dueDate);
        const newDueDate = new Date(tomorrowTimestamp);
        newDueDate.setHours(
          originalDueDate.getHours(),
          originalDueDate.getMinutes()
        );

        batch.update(doc.ref, {
          dueDate: newDueDate.getTime(),
          status: "delayed",
          delayCount: (taskData.delayCount || 0) + 1,
          updatedAt: Date.now(),
        });
        delayedCount++;
      }
    });

    if (delayedCount > 0) {
      await batch.commit();
      
      // Invalidate task caches after batch update
      revalidateTag(CacheTags.tasks());
      revalidateTag(CacheTags.userTasks(session.user.id));
      revalidatePath("/webapp/today");
      revalidatePath("/webapp/tasks");
      revalidatePath("/webapp");
    }

    return {
      success: true,
      message: `${delayedCount} task(s) delayed to tomorrow`,
    };
  } catch (error) {
    console.error("Error auto-delaying tasks:", error);
    return {
      success: false,
      error: "Failed to auto-delay tasks",
    };
  }
}
