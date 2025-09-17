"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  createWorkout,
  createWorkoutTemplate,
  deleteWorkout,
  getExercises,
  getWorkout,
  getWorkouts,
  searchExercises,
  updateWorkout,
} from "./gym-admin";
import {
  ActionResult,
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  LoggedExercise,
} from "../_types/types";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

export async function getWorkoutAction(
  workoutId: string
): Promise<ActionResult<WorkoutSession | null>> {
  try {
    const userId = await getAuthenticatedUserId();
    const workout = await getWorkout(userId, workoutId);
    return {
      success: true,
      data: workout,
    };
  } catch (error) {
    console.error("Error in getWorkout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get workout",
      data: null,
    };
  }
}

export async function getWorkoutsAction(): Promise<
  ActionResult<WorkoutSession[]>
> {
  try {
    const userId = await getAuthenticatedUserId();
    const workouts = await getWorkouts(userId);
    return {
      success: true,
      data: workouts,
    };
  } catch (error) {
    console.error("Error in getWorkouts action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get workouts",
      data: [],
    };
  }
}

export async function createWorkoutAction(
  workoutData: Omit<WorkoutSession, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    const workoutId = await createWorkout(userId, {
      ...workoutData,
      userId,
    });
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
      error:
        error instanceof Error ? error.message : "Failed to create workout",
    };
  }
}

export async function updateWorkoutAction(
  workoutId: string,
  updates: Partial<Omit<WorkoutSession, "id" | "userId" | "createdAt">>
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await updateWorkout(userId, workoutId, updates);

    revalidatePath("/webapp/gym");

    return {
      success: true,
      message: "Workout updated successfully",
    };
  } catch (error) {
    console.error("Error in updateWorkout action:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workout",
    };
  }
}

export async function deleteWorkoutAction(
  workoutId: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await deleteWorkout(userId, workoutId);
    revalidatePath("/webapp/gym");
    return {
      success: true,
      message: "Workout deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteWorkout action:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete workout",
    };
  }
}

export async function startWorkoutSessionAction(
  name: string
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    const workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt"> =
      {
        userId,
        name,
        loggedExercises: [],
      };
    const workoutId = await createWorkout(userId, workoutData);
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to start workout session",
    };
  }
}

export async function completeWorkoutSessionAction(
  workoutId: string,
  duration: number,
  notes: string | undefined,
  loggedExercises: LoggedExercise[]
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    await updateWorkout(userId, workoutId, {
      duration,
      notes,
      loggedExercises,
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
      error:
        error instanceof Error ? error.message : "Failed to complete workout",
    };
  }
}

export async function createTemplateAction(
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
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function getExerciseLibraryAction(): Promise<
  ActionResult<Exercise[]>
> {
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

export async function searchExerciseLibraryAction(
  searchTerm: string
): Promise<ActionResult<Exercise[]>> {
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
      error:
        error instanceof Error ? error.message : "Failed to search exercises",
      data: [],
    };
  }
}
