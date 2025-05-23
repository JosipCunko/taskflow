"use server";

import { revalidatePath } from "next/cache";
import { Task } from "../_types/types";
import { deleteTask, getTaskByTaskId, updateTask } from "./tasks";

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateTaskStatusAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newStatus = formData.get("newStatus") as Task["status"];

  console.log(`ACTION: Mark Task ${taskId} as ${newStatus}`);

  try {
    await updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : undefined,
    });
    revalidatePath("/tasks");
    return { success: true, message: `Task marked as ${newStatus}.` };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update task status.",
    };
  }
}

export async function delayTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const delayOption = formData.get("delayOption") as "tomorrow" | "nextWeek";

  const newDueDate = new Date();
  if (delayOption === "tomorrow") {
    newDueDate.setDate(newDueDate.getDate() + 1);
  } else if (delayOption === "nextWeek") {
    newDueDate.setDate(newDueDate.getDate() + 7);
  }
  newDueDate.setHours(23, 59, 59, 999);
  console.log(
    `ACTION: Delay Task ${taskId} to ${delayOption} (${newDueDate.toISOString()})`
  );
  try {
    await updateTask(taskId, { dueDate: newDueDate, status: "pending" });
    revalidatePath("/tasks");
    return { success: true, message: `Task delayed to ${delayOption}.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delay task." };
  }
}
/** Similar as delayTaskAction */
export async function rescheduleTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;
  const newDueDateString = formData.get("newDueDate") as string;

  if (!newDueDateString) {
    return { success: false, error: "New due date is required." };
  }
  const newDueDate = new Date(newDueDateString);
  newDueDate.setHours(23, 59, 59, 999);

  console.log(
    `ACTION: Reschedule Task ${taskId} to ${newDueDate.toISOString()}`
  );

  try {
    await updateTask(taskId, { dueDate: newDueDate, status: "pending" });
    revalidatePath("/tasks");
    return { success: true, message: "Task rescheduled." };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to reschedule task.",
    };
  }
}

export async function deleteTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const taskId = formData.get("taskId") as string;

  console.log(`ACTION: Delete Task ${taskId}`);

  try {
    await deleteTask(taskId);
    revalidatePath("/tasks");
    return { success: true, message: "Task deleted." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete task." };
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
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to toggle priority.",
    };
  }
}
