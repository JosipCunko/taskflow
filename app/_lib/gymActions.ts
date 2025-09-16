"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
  createWorkoutTemplate,
  getExercises,
  searchExercises,
} from "./gym-admin";
import { ActionResult, WorkoutSession, WorkoutTemplate, Exercise } from "../_types/types";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

export async function createWorkout(
  workoutData: Omit<WorkoutSession, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    const workoutId = await createWorkoutSession(userId, { ...workoutData, userId });
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout created successfully",
      data: workoutId,
    };
  } catch (error) {
    console.error("Error in createWorkout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workout",
    };
  }
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<Omit<WorkoutSession, "id" | "userId" | "createdAt">>
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await updateWorkoutSession(userId, workoutId, updates);
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout updated successfully",
    };
  } catch (error) {
    console.error("Error in updateWorkout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update workout",
    };
  }
}

export async function deleteWorkout(workoutId: string): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await deleteWorkoutSession(userId, workoutId);
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteWorkout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete workout",
    };
  }
}

export async function createTemplate(
  templateData: Omit<WorkoutTemplate, "id" | "userId">
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    const templateId = await createWorkoutTemplate(userId, {
      ...templateData,
      userId,
    });
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout template created successfully",
      data: templateId,
    };
  } catch (error) {
    console.error("Error in createTemplate action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function getExerciseLibrary(): Promise<ActionResult<Exercise[]>> {
  try {
    const exercises = await getExercises();
    
    return {
      success: true,
      data: exercises,
    };
  } catch (error) {
    console.error("Error in getExerciseLibrary action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get exercises",
      data: [],
    };
  }
}

export async function searchExerciseLibrary(searchTerm: string): Promise<ActionResult<Exercise[]>> {
  try {
    const exercises = await searchExercises(searchTerm);
    
    return {
      success: true,
      data: exercises,
    };
  } catch (error) {
    console.error("Error in searchExerciseLibrary action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search exercises",
      data: [],
    };
  }
}

export async function startWorkoutSession(name: string): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    
    const workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt"> = {
      userId,
      date: new Date(),
      name,
      loggedExercises: [],
    };
    
    const workoutId = await createWorkoutSession(userId, workoutData);
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout session started",
      data: workoutId,
    };
  } catch (error) {
    console.error("Error in startWorkoutSession action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start workout session",
    };
  }
}

export async function completeWorkoutSession(
  workoutId: string,
  duration: number,
  notes?: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    
    await updateWorkoutSession(userId, workoutId, {
      duration,
      notes,
      updatedAt: new Date(),
    });
    
    revalidatePath("/webapp/gym");
    
    return {
      success: true,
      message: "Workout completed successfully",
    };
  } catch (error) {
    console.error("Error in completeWorkoutSession action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete workout",
    };
  }
}