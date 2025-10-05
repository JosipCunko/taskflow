"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getTasksByUserId, getTaskByTaskId, updateTask } from "./tasks-admin";
import {
  createTaskAction,
  completeTaskAction,
  delayTaskAction,
} from "./actions";
import {
  FunctionResult,
  TaskToCreateData,
  TaskToUpdateData,
  RepetitionRule,
} from "../_types/types";
import { isToday, isPast } from "date-fns";
import { formatDate } from "../_utils/utils";

// AI Function Parameter Interfaces
interface AIShowTasksParams {
  status?: "pending" | "completed" | "delayed" | "all";
  priority?: boolean;
  limit?: number;
  due_today?: boolean;
  overdue?: boolean;
}

interface AIDelayTaskParams {
  task_id: string;
  newDueDate: string; // ISO date string
}

interface AIUpdateTaskParams {
  task_id: string;
  title?: string;
  description?: string;
  isPriority?: boolean;
  isReminder?: boolean;
  dueDate?: Date;
  startTime?: { hour: number; minute: number };
  repetitionRule?: RepetitionRule;
  color?: string;
  icon?: string;
  tags?: string[];
  duration?: { hours: number; minutes: number };
  location?: string;
}

interface AICompleteTaskParams {
  task_id: string;
}

interface AICreateTaskParams {
  title: string;
  description?: string;
  dueDate: string; // ISO date string from AI
  isPriority?: boolean;
  isReminder?: boolean;
  startTime?: { hour: number; minute: number };
  icon?: string;
  color?: string;
  duration?: { hours: number; minutes: number };
  tags?: string[];
  location?: string;
  repetitionRule?: RepetitionRule;
}

const defaultAIOutputLimit = 10;

export async function executeFunctions(
  functionCalls: {
    name: string;
    arguments: Record<string, unknown>;
  }[]
): Promise<FunctionResult[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [{ name: "error", result: { error: "User not authenticated" } }];
  }

  const userId = session.user.id;
  const results = [];

  for (const call of functionCalls) {
    try {
      let result;
      switch (call.name) {
        case "show_tasks":
          result = await showTasks(
            userId,
            call.arguments as unknown as AIShowTasksParams
          );
          break;
        case "delay_task":
          result = await delayTaskAI(
            call.arguments as unknown as AIDelayTaskParams
          );
          break;
        case "update_task":
          result = await updateTaskAI(
            call.arguments as unknown as AIUpdateTaskParams
          );
          break;
        case "complete_task":
          result = await completeTaskAI(
            call.arguments as unknown as AICompleteTaskParams
          );
          break;
        case "create_task":
          result = await createTaskAI(
            call.arguments as unknown as AICreateTaskParams
          );
          break;
        default:
          result = { error: `Unknown function: ${call.name}` };
      }
      results.push({ name: call.name, result });
    } catch (error) {
      console.error(`Error executing function ${call.name}:`, error);
      results.push({
        name: call.name,
        result: {
          error: `Failed to execute ${call.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    }
  }

  return results;
}

async function showTasks(userId: string, params: AIShowTasksParams) {
  const tasks = await getTasksByUserId(userId);
  let filteredTasks = tasks;

  // Apply filters
  if (params.status && params.status !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === params.status
    );
  }

  if (params.priority) {
    filteredTasks = filteredTasks.filter((task) => task.isPriority);
  }

  if (params.due_today) {
    filteredTasks = filteredTasks.filter((task) => {
      return isToday(task.dueDate);
    });
  }

  if (params.overdue) {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === "pending" && isPast(task.dueDate)
    );
  }

  const limit =
    typeof params.limit === "number" ? params.limit : defaultAIOutputLimit;
  filteredTasks = filteredTasks.slice(0, limit);

  return {
    success: true,
    tasks: filteredTasks,
    count: filteredTasks.length,
    totalCount: tasks.length,
  };
}

async function delayTaskAI(params: AIDelayTaskParams) {
  const { task_id, newDueDate } = params;

  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  try {
    const formData = new FormData();
    formData.append("taskId", task_id);

    const result = await delayTaskAction(
      formData,
      new Date(newDueDate).getTime(),
      task.delayCount
    );

    if (result.success) {
      return {
        success: true,
        message: `Task "${task.title}" delayed to ${formatDate(newDueDate)}`,
        task: result.data || undefined,
      };
    } else {
      return { success: false, error: result.error || "Failed to delay task" };
    }
  } catch {
    return { success: false, error: "Failed to delay task" };
  }
}

async function updateTaskAI(params: AIUpdateTaskParams) {
  const { task_id, ...updates } = params;

  const updateData: Partial<TaskToUpdateData> = {
    title: updates.title,
    description: updates.description,
    isPriority: updates.isPriority,
    isReminder: updates.isReminder,
    dueDate: updates.dueDate!.getTime(),
    startTime: updates.startTime,
    repetitionRule: updates.repetitionRule,
    color: updates.color,
    icon: updates.icon,
    tags: updates.tags,
    duration: updates.duration,
    location: updates.location,
  };

  try {
    const updatedTask = await updateTask(task_id, updateData);
    return {
      success: true,
      message: `Task "${updatedTask.title}" updated successfully`,
      task: updatedTask,
    };
  } catch {
    return { success: false, error: "Failed to update task" };
  }
}

async function completeTaskAI(params: AICompleteTaskParams) {
  const { task_id } = params;

  try {
    // Create FormData to match the action function signature
    const formData = new FormData();
    formData.append("taskId", task_id);
    const result = await completeTaskAction(formData);

    if (result.success) {
      return {
        success: true,
        message: `Task completed successfully!`,
        task: result.data || undefined,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to complete task",
      };
    }
  } catch {
    return { success: false, error: "Failed to complete task" };
  }
}

async function createTaskAI(params: AICreateTaskParams) {
  try {
    // Convert AI params to TaskToCreateData
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    const dueDate = new Date(params.dueDate);
    if (isNaN(dueDate.getTime())) {
      return { success: false, error: "Invalid due date format" };
    }

    // Set time if provided
    if (params.startTime) {
      dueDate.setHours(params.startTime.hour, params.startTime.minute);
    }

    const taskData: TaskToCreateData = {
      userId: session.user.id,
      title: params.title,
      description: params.description || "",
      dueDate: dueDate.getTime(),
      isPriority: params.isPriority || false,
      isReminder: params.isReminder || false,
      icon: params.icon || "ClipboardList",
      color: params.color || "var(--color-primary-500)",
      startTime: params.startTime,
      duration: params.duration || { hours: 0, minutes: 0 },
      tags: params.tags || [],
      location: params.location,
      isRepeating: !!params.repetitionRule,
      repetitionRule: params.repetitionRule,
    };

    // Create FormData to match the action function signature
    const formData = new FormData();
    formData.append("title", taskData.title);
    formData.append("description", taskData.description || "");
    formData.append("location", taskData.location || "");

    const result = await createTaskAction(
      formData,
      taskData.isPriority,
      taskData.isReminder,
      taskData.color,
      taskData.icon,
      taskData.dueDate,
      taskData.startTime,
      taskData.tags || [],
      taskData.duration || { hours: 0, minutes: 0 },
      taskData.isRepeating || false,
      taskData.repetitionRule,
      taskData.startDate
    );

    if (result.success) {
      return {
        success: true,
        message: `Task "${
          result.data?.title
        }" created successfully for ${formatDate(taskData.dueDate)}`,
        task: result.data || undefined,
      };
    } else {
      return { success: false, error: result.error || "Failed to create task" };
    }
  } catch {
    return { success: false, error: "Failed to create task" };
  }
}
