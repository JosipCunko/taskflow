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
import { trackTaskAnalytics } from "./analytics-admin";

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
  startDate?: number,
  autoDelay?: boolean
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
    autoDelay,
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

      revalidateTag(CacheTags.tasks());
      revalidateTag(CacheTags.userTasks(session.user.id));
      revalidateTag(CacheTags.task(createdTask.id));
      revalidateTag(CacheTags.user(session.user.id));
      revalidateTag(CacheTags.userActivity(session.user.id));
      revalidatePath("/webapp/tasks");
      revalidatePath("/webapp");

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

    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(userId));
    revalidateTag(CacheTags.task(taskId));
    revalidateTag(CacheTags.user(userId));
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

  // Increase points by 2 when completed (max 10)
  const newPoints = Math.min(10, task.points + 2);

  const updates: Partial<Task> = {
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: 0, // Reset completions for interval-based tasks
    },
    status: "pending", // Reset to pending for the next occurrence
    dueDate: finalDueDateTimestamp,
    completedAt: completionDate,
    points: newPoints,
    startDate: undefined, // Clear startDate after first completion (no longer needed)
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

  const newCompletions = rule.completions + 1;
  const isWeekComplete = newCompletions >= rule.timesPerWeek;

  // Calculate next due date and startDate
  let newStartDate: number;
  let nextDueDateObj: Date;
  const taskDueDateObj = new Date(task.dueDate);

  if (isWeekComplete) {
    // Week is complete, move to next Monday
    const nextWeekStart = startOfWeek(
      addWeeks(new Date(completionDate), 1),
      MONDAY_START_OF_WEEK
    );
    newStartDate = nextWeekStart.getTime();
    nextDueDateObj = new Date(nextWeekStart);
  } else {
    // Not complete yet, keep startDate as current Monday, dueDate becomes next day
    newStartDate =
      task.startDate ||
      startOfWeek(new Date(completionDate), MONDAY_START_OF_WEEK).getTime();
    nextDueDateObj = addDays(new Date(completionDate), 1);
  }

  // Preserve time from original dueDate
  nextDueDateObj.setHours(
    taskDueDateObj.getHours(),
    taskDueDateObj.getMinutes()
  );
  const nextDueDate = nextDueDateObj.getTime();

  // Increase points when week is fully completed
  let newPoints = task.points;
  if (isWeekComplete) {
    newPoints = Math.min(10, task.points + 2);
  }

  const updates: Partial<Task> = {
    startDate: newStartDate,
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: newCompletions,
    },
    completedAt: completionDate,
    dueDate: nextDueDate,
    points: newPoints,
    status: isWeekComplete ? "completed" : "pending",
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

    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(task.id));
    revalidateTag(CacheTags.user(session.user.id)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");

    return {
      success: true,
      message: isWeekComplete
        ? "Task fully completed for this week! 🎉"
        : `Task completed (${newCompletions}/${rule.timesPerWeek} times this week)`,
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

  const newCompletions = rule.completions + 1;
  const isWeekComplete = newCompletions >= rule.daysOfWeek.length;

  // Calculate next due date
  const today = getDay(new Date(completionDate)) as DayOfWeek;
  const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);
  const firstDayInWeek = sortedDays[0];

  let nextDueDateObj: Date;
  let newStartDate: number = task.startDate || Date.now();

  if (isWeekComplete) {
    // Week complete, move to first day of next week
    const currentWeekStart = startOfWeek(
      new Date(completionDate),
      MONDAY_START_OF_WEEK
    );
    const nextWeekStart = addWeeks(currentWeekStart, 1);
    const correctStartDate = addDays(
      nextWeekStart,
      firstDayInWeek === 0 ? 7 : firstDayInWeek // Sunday (0) becomes day 7
    );
    newStartDate = correctStartDate.getTime();
    nextDueDateObj = new Date(correctStartDate);
  } else {
    // Not complete yet, find next scheduled day
    let nextDueDay = sortedDays.find((day) => day > today);
    let daysUntilNext: number;

    if (nextDueDay !== undefined) {
      daysUntilNext = nextDueDay - today;
    } else {
      // Wrap to next week, use first day
      nextDueDay = firstDayInWeek;
      daysUntilNext = 7 - today + (nextDueDay === 0 ? 7 : nextDueDay);
    }

    nextDueDateObj = addDays(new Date(completionDate), daysUntilNext);
  }

  // Preserve time from original dueDate
  const taskDueDateObj = new Date(task.dueDate);
  nextDueDateObj.setHours(
    taskDueDateObj.getHours(),
    taskDueDateObj.getMinutes()
  );
  const newDueDate = nextDueDateObj.getTime();

  // Increase points when week is fully completed
  let newPoints = task.points;
  if (isWeekComplete) {
    newPoints = Math.min(10, task.points + 2);
  }

  const updates: Partial<Task> = {
    startDate: newStartDate,
    repetitionRule: {
      ...rule,
      completedAt: [...rule.completedAt, completionDate],
      completions: newCompletions,
    },
    completedAt: completionDate,
    dueDate: newDueDate,
    points: newPoints,
    status: isWeekComplete ? "completed" : "pending",
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

    revalidateTag(CacheTags.tasks());
    revalidateTag(CacheTags.userTasks(session.user.id));
    revalidateTag(CacheTags.task(task.id));
    revalidateTag(CacheTags.user(session.user.id)); // User stats changed
    revalidatePath("/webapp/tasks");
    revalidatePath("/webapp");

    return {
      success: true,
      message: isWeekComplete
        ? "Task fully completed for this week! 🎉"
        : `Task completed (${newCompletions}/${rule.daysOfWeek.length} days this week)`,
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
    // NOTE: NEXTAUTH_URL should be set to your production URL (not localhost) in production
    // For internal server-to-server calls, we use the NEXTAUTH_URL as the base
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/youtube/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${session.user.id}`, // Pass session info
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

export async function autoDelayIncompleteTodayTasks(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Performance optimization: Check if we already ran this today
    const userRef = adminDb.collection("users").doc(session.user.id);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Check if we already ran the auto-delay today
    if (userData?.lastAutoDelayCheck) {
      const lastCheckDate = new Date(userData.lastAutoDelayCheck);
      lastCheckDate.setHours(0, 0, 0, 0);
      const lastCheckTimestamp = lastCheckDate.getTime();

      if (lastCheckTimestamp === todayTimestamp) {
        // Already ran today, skip execution
        return {
          success: true,
          message: "Auto-delay already ran today",
        };
      }
    }

    // Get all incomplete tasks for the user
    const tasksRef = adminDb.collection("tasks");
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
      const taskDueDate = new Date(taskData.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      const taskDueDateTimestamp = taskDueDate.getTime();

      // CRITICAL: Only delay REGULAR tasks (not repeating) that are past due and have autoDelay enabled
      // Repeating tasks have their own scheduling logic and should never be auto-delayed
      if (
        taskDueDateTimestamp < todayTimestamp && // Task is past due
        !taskData.isRepeating && // NOT a repeating task
        taskData.autoDelay === true // Has auto-delay enabled
      ) {
        // Preserve the original time when moving to tomorrow
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
      console.log(
        `Auto-delayed ${delayedCount} regular task(s) to tomorrow for user ${session.user.id}`
      );

      revalidateTag(CacheTags.tasks());
      revalidateTag(CacheTags.userTasks(session.user.id));
      revalidatePath("/webapp/today");
      revalidatePath("/webapp/tasks");
      revalidatePath("/webapp");
    }

    await userRef.update({
      lastAutoDelayCheck: Date.now(),
    });

    return {
      success: true,
      message:
        delayedCount > 0
          ? `${delayedCount} task(s) delayed to tomorrow`
          : "No tasks to delay",
    };
  } catch (error) {
    console.error("Error auto-delaying tasks:", error);
    return {
      success: false,
      error: "Failed to auto-delay tasks",
    };
  }
}
