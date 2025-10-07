"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { CacheTags } from "../_utils/serverCache";
import {
  createWorkout,
  createWorkoutTemplate,
  deleteWorkout,
  getExercises,
  getWorkout,
  getWorkouts,
  getWorkoutTemplates,
  searchExercises,
  updateWorkout,
  getExerciseProgress,
  getPersonalRecords,
  getLastPerformance,
} from "./gym-admin";
import {
  ActionResult,
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  LoggedExercise,
  PersonalRecord,
  ExerciseProgressPoint,
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
    
    // Invalidate gym cache
    revalidateTag(CacheTags.userGym(userId));
    revalidatePath("/webapp/gym");
    revalidatePath("/webapp");
    
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

    // Invalidate gym cache
    revalidateTag(CacheTags.userGym(userId));
    revalidatePath("/webapp/gym");
    revalidatePath("/webapp");

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
    
    // Invalidate gym cache
    revalidateTag(CacheTags.userGym(userId));
    revalidatePath("/webapp/gym");
    revalidatePath("/webapp");
    
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
      updatedAt: Date.now(),
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

export async function getWorkoutTemplatesAction(): Promise<
  ActionResult<WorkoutTemplate[]>
> {
  try {
    const userId = await getAuthenticatedUserId();
    const templates = await getWorkoutTemplates(userId);
    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("Error in getWorkoutTemplates action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get templates",
      data: [],
    };
  }
}

export async function createWorkoutTemplateAction(
  templateData: Omit<WorkoutTemplate, "id" | "userId" | "createdAt">
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();
    const templateId = await createWorkoutTemplate(userId, {
      ...templateData,
      userId,
      createdAt: Date.now(),
    });

    revalidatePath("/webapp/gym");
    return {
      success: true,
      message: "Workout template created successfully",
      data: templateId,
    };
  } catch (error) {
    console.error("Error in createWorkoutTemplate action:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function startWorkoutFromTemplateAction(
  templateId: string,
  workoutName: string
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthenticatedUserId();

    // Get the template
    const templates = await getWorkoutTemplates(userId);
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return {
        success: false,
        error: "Template not found",
      };
    }

    // Create logged exercises from template exercises
    const loggedExercises: LoggedExercise[] = template.exercises.map(
      (exerciseName, index) => ({
        id: Date.now().toString() + index,
        exerciseName,
        order: index,
        volume: [],
      })
    );

    const workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt"> =
      {
        userId,
        name: workoutName,
        loggedExercises,
      };

    const workoutId = await createWorkout(userId, workoutData);
    revalidatePath("/webapp/gym");

    return {
      success: true,
      message: "Workout started from template",
      data: workoutId,
    };
  } catch (error) {
    console.error("Error in startWorkoutFromTemplate action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to start workout from template",
    };
  }
}

export async function getExerciseProgressAction(
  exerciseName: string
): Promise<ActionResult<ExerciseProgressPoint[]>> {
  try {
    const userId = await getAuthenticatedUserId();
    const progressData = await getExerciseProgress(userId, exerciseName, 20);
    return {
      success: true,
      data: progressData,
    };
  } catch (error) {
    console.error("Error in getExerciseProgress action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get exercise progress",
      data: [],
    };
  }
}

export async function getPersonalRecordsAction(): Promise<
  ActionResult<PersonalRecord[]>
> {
  try {
    const userId = await getAuthenticatedUserId();
    const records = await getPersonalRecords(userId);
    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("Error in getPersonalRecords action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get personal records",
      data: [],
    };
  }
}

export async function getLastPerformanceAction(exerciseName: string): Promise<
  ActionResult<{
    weight: number;
    reps: number;
    sets: number;
    date: number;
  } | null>
> {
  try {
    const userId = await getAuthenticatedUserId();
    const lastPerformance = await getLastPerformance(userId, exerciseName);
    return {
      success: true,
      data: lastPerformance,
    };
  } catch (error) {
    console.error("Error in getLastPerformance action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get last performance",
      data: null,
    };
  }
}

export async function likeWorkoutAction(
  workoutId: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await updateWorkout(userId, workoutId, {
      liked: true,
      disliked: false,
    });

    return {
      success: true,
      message: "Workout liked",
    };
  } catch (error) {
    console.error("Error in likeWorkout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like workout",
    };
  }
}

export async function dislikeWorkoutAction(
  workoutId: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await updateWorkout(userId, workoutId, {
      liked: false,
      disliked: true,
    });

    return {
      success: true,
      message: "Workout disliked",
    };
  } catch (error) {
    console.error("Error in dislikeWorkout action:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to dislike workout",
    };
  }
}

export async function removeWorkoutRatingAction(
  workoutId: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    await updateWorkout(userId, workoutId, {
      liked: false,
      disliked: false,
    });
    return {
      success: true,
      message: "Workout rating removed",
    };
  } catch (error) {
    console.error("Error in removeWorkoutRating action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove workout rating",
    };
  }
}
