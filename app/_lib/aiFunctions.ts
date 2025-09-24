"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  getTasksByUserId,
  getTaskByTaskId,
  updateTask,
  createTask,
} from "./tasks-admin";
import { loadNotesByUserId } from "./notes";
import { addNoteAction, updateNoteAction } from "./notesActions";
import { TaskToCreateData, FunctionResult, Task } from "../_types/types";
import { format, parseISO, isValid } from "date-fns";

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
          result = await showTasks(userId, call.arguments);
          break;
        case "delay_task":
          result = await delayTask(
            userId,
            call.arguments as unknown as DelayTaskParams
          );
          break;
        case "update_task":
          result = await updateTaskFunction(
            userId,
            call.arguments as unknown as UpdateTaskParams
          );
          break;
        case "complete_task":
          result = await completeTask(
            userId,
            call.arguments as unknown as CompleteTaskParams
          );
          break;
        case "create_task":
          result = await createTaskFunction(
            userId,
            call.arguments as unknown as CreateTaskParams
          );
          break;
        case "show_notes":
          result = await showNotes(
            userId,
            call.arguments as unknown as ShowNotesParams
          );
          break;
        case "create_note":
          result = await createNote(
            userId,
            call.arguments as unknown as CreateNoteParams
          );
          break;
        case "update_note":
          result = await updateNote(
            userId,
            call.arguments as unknown as UpdateNoteParams
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

async function showTasks(userId: string, params: Record<string, unknown>) {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filteredTasks = filteredTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && taskDate < tomorrow;
    });
  }

  if (params.overdue) {
    const now = new Date();
    filteredTasks = filteredTasks.filter(
      (task) => task.status === "pending" && new Date(task.dueDate) < now
    );
  }

  // Apply limit
  const limit = typeof params.limit === "number" ? params.limit : 10;
  filteredTasks = filteredTasks.slice(0, limit);

  return {
    success: true,
    tasks: filteredTasks,
    count: filteredTasks.length,
    totalCount: tasks.length,
  };
}

interface DelayTaskParams {
  task_id: string;
  new_due_date: string;
  reason?: string;
}

async function delayTask(userId: string, params: DelayTaskParams) {
  const { task_id, new_due_date, reason } = params;

  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  if (task.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const newDate = parseISO(new_due_date);
  if (!isValid(newDate)) {
    return { success: false, error: "Invalid date format" };
  }

  // Preserve original time
  const originalTime = new Date(task.dueDate);
  newDate.setHours(originalTime.getHours(), originalTime.getMinutes());

  try {
    const updatedTask = await updateTask(task_id, {
      dueDate: newDate,
      status: "delayed",
      delayCount: task.delayCount + 1,
    });

    return {
      success: true,
      message: `Task "${task.title}" delayed to ${format(
        newDate,
        "yyyy-MM-dd HH:mm"
      )}`,
      task: updatedTask,
      reason: reason || "No reason provided",
    };
  } catch {
    return { success: false, error: "Failed to delay task" };
  }
}

interface UpdateTaskParams {
  task_id: string;
  title?: string;
  description?: string;
  priority?: boolean;
  reminder?: boolean;
  due_date?: string;
  start_time?: { hour: number; minute: number };
}

async function updateTaskFunction(userId: string, params: UpdateTaskParams) {
  const { task_id, ...updates } = params;

  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  if (task.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: Partial<Task> = {};

  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.priority !== undefined) updateData.isPriority = updates.priority;
  if (updates.reminder !== undefined) updateData.isReminder = updates.reminder;
  if (updates.start_time) updateData.startTime = updates.start_time;

  if (updates.due_date) {
    const newDate = parseISO(updates.due_date);
    if (!isValid(newDate)) {
      return { success: false, error: "Invalid due date format" };
    }
    // Preserve original time if not updating start_time
    if (!updates.start_time) {
      const originalTime = new Date(task.dueDate);
      newDate.setHours(originalTime.getHours(), originalTime.getMinutes());
    }
    updateData.dueDate = newDate;
  }

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

interface CompleteTaskParams {
  task_id: string;
  experience?: "bad" | "okay" | "good" | "best";
}

async function completeTask(userId: string, params: CompleteTaskParams) {
  const { task_id, experience } = params;

  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  if (task.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: Partial<Task> = {
    status: "completed",
    completedAt: new Date(),
  };

  if (experience) {
    updateData.experience = experience;
  }

  try {
    const updatedTask = await updateTask(task_id, updateData);

    return {
      success: true,
      message: `Task "${updatedTask.title}" completed successfully! You earned ${updatedTask.points} points.`,
      task: updatedTask,
    };
  } catch {
    return { success: false, error: "Failed to complete task" };
  }
}

interface CreateTaskParams {
  title: string;
  description?: string;
  due_date: string;
  priority?: boolean;
  reminder?: boolean;
  start_time?: { hour: number; minute: number };
  icon?: string;
  color?: string;
}

async function createTaskFunction(userId: string, params: CreateTaskParams) {
  const {
    title,
    description,
    due_date,
    priority,
    reminder,
    start_time,
    icon,
    color,
  } = params;

  const dueDate = parseISO(due_date);
  if (!isValid(dueDate)) {
    return { success: false, error: "Invalid due date format" };
  }

  // Set time if provided
  if (start_time) {
    dueDate.setHours(start_time.hour, start_time.minute);
  }

  const taskData: TaskToCreateData = {
    userId,
    title,
    description: description || "",
    dueDate,
    isPriority: priority || false,
    isReminder: reminder || false,
    startTime: start_time || { hour: 9, minute: 0 },
    icon: icon || "📋",
    color: color || "#3B82F6",
    tags: [],
    duration: { hours: 0, minutes: 30 }, // Default 30 minutes
  };

  try {
    const newTask = await createTask(taskData);

    return {
      success: true,
      message: `Task "${newTask.title}" created successfully for ${format(
        newTask.dueDate,
        "yyyy-MM-dd HH:mm"
      )}`,
      task: newTask,
    };
  } catch {
    return { success: false, error: "Failed to create task" };
  }
}

interface ShowNotesParams {
  limit?: number;
  search?: string;
}

async function showNotes(userId: string, params: ShowNotesParams) {
  const notes = await loadNotesByUserId(userId);
  let filteredNotes = notes;

  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );
  }

  // Apply limit
  const limit = params.limit || 5;
  filteredNotes = filteredNotes.slice(0, limit);

  return {
    success: true,
    notes: filteredNotes.map((note) => ({
      id: note.id,
      title: note.title,
      content:
        note.content.slice(0, 200) + (note.content.length > 200 ? "..." : ""),
      updatedAt: format(note.updatedAt, "yyyy-MM-dd HH:mm"),
    })),
    count: filteredNotes.length,
    totalCount: notes.length,
  };
}

interface CreateNoteParams {
  title: string;
  content: string;
}

async function createNote(userId: string, params: CreateNoteParams) {
  const { title, content } = params;

  try {
    const result = await addNoteAction(userId, title, content);

    if (result.success) {
      return {
        success: true,
        message: `Note "${title}" created successfully`,
        note: {
          id: result.newNoteId || "",
          title,
          content: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
        },
      };
    } else {
      return { success: false, error: result.error || "Failed to create note" };
    }
  } catch {
    return { success: false, error: "Failed to create note" };
  }
}

interface UpdateNoteParams {
  note_id: string;
  title?: string;
  content?: string;
}

async function updateNote(userId: string, params: UpdateNoteParams) {
  const { note_id, title, content } = params;

  try {
    const result = await updateNoteAction(
      note_id,
      title || "",
      content || "",
      userId
    );

    if (result.success) {
      return {
        success: true,
        message: `Note updated successfully`,
        note: {
          id: note_id,
          title: title || "",
          content:
            content?.slice(0, 100) +
            (content && content.length > 100 ? "..." : ""),
        },
      };
    } else {
      return { success: false, error: result.error || "Failed to update note" };
    }
  } catch {
    return { success: false, error: "Failed to update note" };
  }
}
