"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getTasksByUserId, getTaskByTaskId, updateTask, createTask } from "./tasks-admin";
import { loadNotesByUserId } from "./notes";
import { addNoteAction, updateNoteAction } from "./notesActions";
import { TaskToCreateData, FunctionResult } from "../_types/types";
import { addDays, format, parseISO, isValid } from "date-fns";

// Function definitions for the AI
export const AI_FUNCTIONS = [
  {
    name: "show_tasks",
    description: "Show user's tasks with optional filters",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "completed", "delayed", "all"],
          description: "Filter tasks by status. Default is 'pending'",
        },
        priority: {
          type: "boolean",
          description: "Filter for priority tasks only",
        },
        limit: {
          type: "number",
          description: "Maximum number of tasks to show. Default is 10",
        },
        due_today: {
          type: "boolean",
          description: "Show only tasks due today",
        },
        overdue: {
          type: "boolean", 
          description: "Show only overdue tasks",
        }
      },
      required: [],
    },
  },
  {
    name: "delay_task",
    description: "Delay a task to a new date",
    parameters: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The ID of the task to delay",
        },
        new_due_date: {
          type: "string",
          format: "date",
          description: "New due date in YYYY-MM-DD format",
        },
        reason: {
          type: "string",
          description: "Optional reason for delaying the task",
        },
      },
      required: ["task_id", "new_due_date"],
    },
  },
  {
    name: "update_task",
    description: "Update task properties like title, description, priority, etc.",
    parameters: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The ID of the task to update",
        },
        title: {
          type: "string",
          description: "New task title",
        },
        description: {
          type: "string", 
          description: "New task description",
        },
        priority: {
          type: "boolean",
          description: "Set task priority status",
        },
        reminder: {
          type: "boolean",
          description: "Set task reminder status",
        },
        due_date: {
          type: "string",
          format: "date",
          description: "New due date in YYYY-MM-DD format",
        },
        start_time: {
          type: "object",
          properties: {
            hour: { type: "number", minimum: 0, maximum: 23 },
            minute: { type: "number", minimum: 0, maximum: 59 }
          },
          description: "New start time for the task"
        }
      },
      required: ["task_id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed",
    parameters: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The ID of the task to complete",
        },
        experience: {
          type: "string",
          enum: ["bad", "okay", "good", "best"],
          description: "Optional experience rating for the completed task",
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "create_task",
    description: "Create a new task",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Task title",
        },
        description: {
          type: "string",
          description: "Task description",
        },
        due_date: {
          type: "string",
          format: "date",
          description: "Due date in YYYY-MM-DD format",
        },
        priority: {
          type: "boolean",
          description: "Is this a priority task",
          default: false,
        },
        reminder: {
          type: "boolean", 
          description: "Set reminder for this task",
          default: false,
        },
        start_time: {
          type: "object",
          properties: {
            hour: { type: "number", minimum: 0, maximum: 23 },
            minute: { type: "number", minimum: 0, maximum: 59 }
          },
          description: "Start time for the task"
        },
        icon: {
          type: "string",
          description: "Icon for the task",
          default: "📋"
        },
        color: {
          type: "string",
          description: "Color for the task",
          default: "#3B82F6"
        }
      },
      required: ["title", "due_date"],
    },
  },
  {
    name: "show_notes",
    description: "Show user's notes",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of notes to show. Default is 5",
        },
        search: {
          type: "string",
          description: "Search term to filter notes",
        },
      },
      required: [],
    },
  },
  {
    name: "create_note",
    description: "Create a new note",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Note title",
        },
        content: {
          type: "string",
          description: "Note content",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "update_note",
    description: "Update an existing note",
    parameters: {
      type: "object",
      properties: {
        note_id: {
          type: "string",
          description: "The ID of the note to update",
        },
        title: {
          type: "string",
          description: "New note title",
        },
        content: {
          type: "string",
          description: "New note content",
        },
      },
      required: ["note_id"],
    },
  },
  {
    name: "propose_schedule",
    description: "Propose a schedule optimization for tasks with conflicts resolution",
    parameters: {
      type: "object",
      properties: {
        optimization_type: {
          type: "string",
          enum: ["priority_based", "deadline_based", "workload_balanced"],
          description: "Type of schedule optimization to apply",
        },
        date_range: {
          type: "object",
          properties: {
            start_date: { type: "string", format: "date" },
            end_date: { type: "string", format: "date" }
          },
          description: "Date range for schedule optimization"
        },
        include_completed: {
          type: "boolean",
          description: "Include completed tasks in the analysis",
          default: false
        }
      },
      required: ["optimization_type"],
    },
  },
  {
    name: "apply_schedule_changes",
    description: "Apply the confirmed schedule changes after user approval",
    parameters: {
      type: "object",
      properties: {
        changes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task_id: { type: "string" },
              new_due_date: { type: "string", format: "date" },
              action: { type: "string" }
            }
          },
          description: "Array of schedule changes to apply"
        }
      },
      required: ["changes"],
    },
  },
];

// Function implementations
export async function executeFunctions(functionCalls: Array<{name: string, arguments: Record<string, unknown>}>): Promise<FunctionResult[]> {
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
          result = await delayTask(userId, call.arguments);
          break;
        case "update_task":
          result = await updateTaskFunction(userId, call.arguments);
          break;
        case "complete_task":
          result = await completeTask(userId, call.arguments);
          break;
        case "create_task":
          result = await createTaskFunction(userId, call.arguments);
          break;
        case "show_notes":
          result = await showNotes(userId, call.arguments);
          break;
        case "create_note":
          result = await createNote(userId, call.arguments);
          break;
        case "update_note":
          result = await updateNote(userId, call.arguments);
          break;
        case "propose_schedule":
          result = await proposeSchedule(userId, call.arguments);
          break;
        case "apply_schedule_changes":
          result = await applyScheduleChanges(userId, call.arguments);
          break;
        default:
          result = { error: `Unknown function: ${call.name}` };
      }
      results.push({ name: call.name, result });
    } catch (error) {
      console.error(`Error executing function ${call.name}:`, error);
      results.push({ 
        name: call.name, 
        result: { error: `Failed to execute ${call.name}: ${error instanceof Error ? error.message : 'Unknown error'}` } 
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
    filteredTasks = filteredTasks.filter(task => task.status === params.status);
  }

  if (params.priority) {
    filteredTasks = filteredTasks.filter(task => task.isPriority);
  }

  if (params.due_today) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    filteredTasks = filteredTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && taskDate < tomorrow;
    });
  }

  if (params.overdue) {
    const now = new Date();
    filteredTasks = filteredTasks.filter(task => 
      task.status === "pending" && new Date(task.dueDate) < now
    );
  }

  // Apply limit
  const limit = params.limit || 10;
  filteredTasks = filteredTasks.slice(0, limit);

  return {
    success: true,
    tasks: filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: format(task.dueDate, 'yyyy-MM-dd HH:mm'),
      isPriority: task.isPriority,
      isReminder: task.isReminder,
      delayCount: task.delayCount,
      icon: task.icon,
      color: task.color,
      points: task.points,
      risk: task.risk
    })),
    count: filteredTasks.length,
    totalCount: tasks.length
  };
}

async function delayTask(userId: string, params: Record<string, unknown>) {
  const { task_id, new_due_date, reason } = params as { task_id: string; new_due_date: string; reason?: string };
  
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
      message: `Task "${task.title}" delayed to ${format(newDate, 'yyyy-MM-dd HH:mm')}`,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        dueDate: format(updatedTask.dueDate, 'yyyy-MM-dd HH:mm'),
        delayCount: updatedTask.delayCount
      },
      reason: reason || "No reason provided"
    };
  } catch (error) {
    return { success: false, error: "Failed to delay task" };
  }
}

async function updateTaskFunction(userId: string, params: Record<string, unknown>) {
  const { task_id, ...updates } = params as { task_id: string; [key: string]: unknown };
  
  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }
  
  if (task.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: any = {};
  
  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
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
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: format(updatedTask.dueDate, 'yyyy-MM-dd HH:mm'),
        isPriority: updatedTask.isPriority,
        isReminder: updatedTask.isReminder
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to update task" };
  }
}

async function completeTask(userId: string, params: any) {
  const { task_id, experience } = params;
  
  const task = await getTaskByTaskId(task_id);
  if (!task) {
    return { success: false, error: "Task not found" };
  }
  
  if (task.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: any = {
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
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        completedAt: format(updatedTask.completedAt!, 'yyyy-MM-dd HH:mm'),
        points: updatedTask.points,
        experience: updatedTask.experience
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to complete task" };
  }
}

async function createTaskFunction(userId: string, params: any) {
  const { title, description, due_date, priority, reminder, start_time, icon, color } = params;
  
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
      message: `Task "${newTask.title}" created successfully for ${format(newTask.dueDate, 'yyyy-MM-dd HH:mm')}`,
      task: {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        dueDate: format(newTask.dueDate, 'yyyy-MM-dd HH:mm'),
        isPriority: newTask.isPriority,
        isReminder: newTask.isReminder,
        points: newTask.points
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to create task" };
  }
}

async function showNotes(userId: string, params: any) {
  const notes = await loadNotesByUserId(userId);
  let filteredNotes = notes;

  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredNotes = filteredNotes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) || 
      note.content.toLowerCase().includes(searchTerm)
    );
  }

  // Apply limit
  const limit = params.limit || 5;
  filteredNotes = filteredNotes.slice(0, limit);

  return {
    success: true,
    notes: filteredNotes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content.slice(0, 200) + (note.content.length > 200 ? "..." : ""),
      updatedAt: format(note.updatedAt, 'yyyy-MM-dd HH:mm')
    })),
    count: filteredNotes.length,
    totalCount: notes.length
  };
}

async function createNote(userId: string, params: any) {
  const { title, content } = params;
  
  try {
    const result = await addNoteAction(userId, title, content);
    
    if (result.success) {
      return {
        success: true,
        message: `Note "${title}" created successfully`,
        note: {
          id: result.newNoteId,
          title,
          content: content.slice(0, 100) + (content.length > 100 ? "..." : "")
        }
      };
    } else {
      return { success: false, error: result.error || "Failed to create note" };
    }
  } catch (error) {
    return { success: false, error: "Failed to create note" };
  }
}

async function updateNote(userId: string, params: any) {
  const { note_id, title, content } = params;
  
  try {
    const result = await updateNoteAction(note_id, title || "", content || "", userId);
    
    if (result.success) {
      return {
        success: true,
        message: `Note updated successfully`,
        note: {
          id: note_id,
          title,
          content: content?.slice(0, 100) + (content && content.length > 100 ? "..." : "")
        }
      };
    } else {
      return { success: false, error: result.error || "Failed to update note" };
    }
  } catch (error) {
    return { success: false, error: "Failed to update note" };
  }
}

async function proposeSchedule(userId: string, params: any) {
  const { optimization_type, date_range, include_completed } = params;
  
  const tasks = await getTasksByUserId(userId);
  let relevantTasks = tasks;

  // Filter by date range if provided
  if (date_range) {
    const startDate = parseISO(date_range.start_date);
    const endDate = parseISO(date_range.end_date);
    
    if (isValid(startDate) && isValid(endDate)) {
      relevantTasks = relevantTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }
  }

  // Filter completed tasks if not included
  if (!include_completed) {
    relevantTasks = relevantTasks.filter(task => task.status !== "completed");
  }

  // Sort based on optimization type
  let optimizedTasks = [...relevantTasks];
  
  switch (optimization_type) {
    case "priority_based":
      optimizedTasks.sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      break;
    case "deadline_based":
      optimizedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      break;
    case "workload_balanced":
      // Balance by spreading tasks evenly and considering delay count
      optimizedTasks.sort((a, b) => {
        const aScore = (a.delayCount * 2) + (a.isPriority ? -1 : 0);
        const bScore = (b.delayCount * 2) + (b.isPriority ? -1 : 0);
        return aScore - bScore;
      });
      break;
  }

  // Detect conflicts (tasks scheduled too close together)
  const conflicts = [];
  const suggestions = [];
  
  for (let i = 0; i < optimizedTasks.length - 1; i++) {
    const currentTask = optimizedTasks[i];
    const nextTask = optimizedTasks[i + 1];
    
    const timeDiff = new Date(nextTask.dueDate).getTime() - new Date(currentTask.dueDate).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 2) { // Tasks within 2 hours of each other
      conflicts.push({
        task1: currentTask.title,
        task2: nextTask.title,
        timeDifference: `${Math.round(hoursDiff * 60)} minutes`
      });
      
      // Suggest rescheduling the second task
      const suggestedDate = addDays(new Date(currentTask.dueDate), 1);
      suggestions.push({
        task: nextTask.title,
        action: "reschedule",
        suggestedDate: format(suggestedDate, 'yyyy-MM-dd HH:mm'),
        reason: "Resolve scheduling conflict"
      });
    }
  }

  return {
    success: true,
    optimization_type,
    requiresConfirmation: suggestions.length > 0, // Flag to indicate confirmation needed
    schedule: optimizedTasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: format(task.dueDate, 'yyyy-MM-dd HH:mm'),
      isPriority: task.isPriority,
      delayCount: task.delayCount,
      status: task.status
    })),
    conflicts,
    suggestions,
    summary: {
      totalTasks: optimizedTasks.length,
      priorityTasks: optimizedTasks.filter(t => t.isPriority).length,
      conflictsDetected: conflicts.length,
      suggestionsProvided: suggestions.length
    }
  };
}

async function applyScheduleChanges(userId: string, params: any) {
  const { changes } = params;
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const change of changes) {
    try {
      const { task_id, new_due_date, action } = change;
      
      const task = await getTaskByTaskId(task_id);
      if (!task) {
        results.push({ task_id, error: "Task not found" });
        errorCount++;
        continue;
      }
      
      if (task.userId !== userId) {
        results.push({ task_id, error: "Unauthorized" });
        errorCount++;
        continue;
      }

      const newDate = parseISO(new_due_date);
      if (!isValid(newDate)) {
        results.push({ task_id, error: "Invalid date format" });
        errorCount++;
        continue;
      }

      // Preserve original time
      const originalTime = new Date(task.dueDate);
      newDate.setHours(originalTime.getHours(), originalTime.getMinutes());

      const updateData: any = {
        dueDate: newDate,
      };

      // Only mark as delayed if it's actually being delayed
      if (action === "reschedule" && newDate > new Date(task.dueDate)) {
        updateData.status = "delayed";
        updateData.delayCount = task.delayCount + 1;
      }

      await updateTask(task_id, updateData);
      
      results.push({ 
        task_id, 
        success: true, 
        newDate: format(newDate, 'yyyy-MM-dd HH:mm'),
        action 
      });
      successCount++;
      
    } catch (error) {
      results.push({ task_id: change.task_id, error: "Failed to update task" });
      errorCount++;
    }
  }

  return {
    success: successCount > 0,
    message: `Schedule changes applied: ${successCount} successful, ${errorCount} failed`,
    results,
    summary: {
      totalChanges: changes.length,
      successful: successCount,
      failed: errorCount
    }
  };
}