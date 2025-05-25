"use server";

import { revalidatePath } from "next/cache";
import { ActionResult, ActionError, Task } from "../_types/types";
import { createTask, deleteTask, getTaskByTaskId, updateTask } from "./tasks";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { logUserActivity } from "./activity";

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
  isToday: boolean,
  isPriority: boolean,
  isReminder: boolean,
  selectedColor: string,
  icon: string,
  dueDate: Date,
  tags: string[]
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

  const newTask = {
    title,
    description,
    isToday,
    isPriority,
    isReminder,
    color: selectedColor,
    icon,
    dueDate,
    userId,
    tags,
  };

  console.log("Task to be created:", newTask);
  try {
    const createdTask = await createTask(newTask);

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
