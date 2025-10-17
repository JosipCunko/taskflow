import "server-only";
import { adminDb } from "./admin";
import {
  WorkoutSession,
  Exercise,
  WorkoutTemplate,
  LoggedExercise,
  PersonalRecord,
  ExerciseProgressPoint,
  LastPerformance,
} from "../_types/types";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDuration } from "../_utils/serverCache";

async function getWorkoutsInternal(userId: string): Promise<WorkoutSession[]> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const q = workoutsCol.orderBy("createdAt", "desc");
    const querySnapshot = await q.get();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        name: data.name,
        duration: data.duration,
        notes: data.notes,
        loggedExercises: data.loggedExercises || [],
        liked: data.liked,
        disliked: data.disliked,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error getting workout sessions:", error);
    return [];
  }
}

async function getWorkoutInternal(
  userId: string,
  workoutId: string
): Promise<WorkoutSession | null> {
  try {
    const workoutDoc = adminDb.doc(`users/${userId}/workouts/${workoutId}`);
    const docSnapshot = await workoutDoc.get();

    if (!docSnapshot.exists) {
      return null;
    }

    const data = docSnapshot.data();
    if (!data) {
      return null;
    }
    return {
      id: docSnapshot.id,
      userId,
      name: data.name,
      duration: data.duration,
      notes: data.notes,
      loggedExercises: data.loggedExercises || [],
      liked: data.liked,
      disliked: data.disliked,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error("Error getting workout session:", error);
    return null;
  }
}

export async function getWorkouts(userId: string): Promise<WorkoutSession[]> {
  const cachedGetWorkouts = unstable_cache(
    getWorkoutsInternal,
    [`workouts-${userId}`],
    {
      tags: [CacheTags.userFitness(userId)],
      revalidate: CacheDuration.FITNESS_HEALTH,
    }
  );
  return cachedGetWorkouts(userId);
}

export async function getWorkout(
  userId: string,
  workoutId: string
): Promise<WorkoutSession | null> {
  const cachedGetWorkout = unstable_cache(
    getWorkoutInternal,
    [`workout-${userId}-${workoutId}`],
    {
      tags: [CacheTags.userFitness(userId)],
      revalidate: CacheDuration.FITNESS_HEALTH,
    }
  );
  return cachedGetWorkout(userId, workoutId);
}

export async function createWorkout(
  userId: string,
  workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);

    const docRef = await workoutsCol.add({
      ...workoutData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating workout session:", error);
    throw new Error("Failed to create workout session");
  }
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  updates: Partial<Omit<WorkoutSession, "id" | "userId" | "createdAt">>
): Promise<void> {
  try {
    const workoutDoc = adminDb.doc(`users/${userId}/workouts/${workoutId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    await workoutDoc.update(updateData);
  } catch (error) {
    console.error("Error updating workout session:", error);
    throw new Error("Failed to update workout session");
  }
}

export async function deleteWorkout(
  userId: string,
  workoutId: string
): Promise<void> {
  try {
    const workoutDoc = adminDb.doc(`users/${userId}/workouts/${workoutId}`);
    await workoutDoc.delete();
  } catch (error) {
    console.error("Error deleting workout session:", error);
    throw new Error("Failed to delete workout session");
  }
}

// Exercise Library
export async function getExercises(): Promise<Exercise[]> {
  try {
    const exercisesCol = adminDb.collection("exercises");
    const querySnapshot = await exercisesCol.get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Exercise[];
  } catch (error) {
    console.error("Error getting exercises:", error);
    return [];
  }
}

export async function searchExercises(searchTerm: string): Promise<Exercise[]> {
  try {
    const exercisesCol = adminDb.collection("exercises");
    const querySnapshot = await exercisesCol.get();

    const exercises = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Exercise[];

    // Client-side filtering since Firestore doesn't support full-text search
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some((muscle) =>
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  } catch (error) {
    console.error("Error searching exercises:", error);
    return [];
  }
}

export async function getWorkoutTemplates(
  userId: string
): Promise<WorkoutTemplate[]> {
  try {
    const templatesCol = adminDb.collection(`users/${userId}/workoutTemplates`);
    const q = templatesCol.orderBy("createdAt", "desc");
    const querySnapshot = await q.get();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        name: data.name,
        exercises: data.exercises,
        createdAt: data.createdAt,
      };
    });
  } catch (error) {
    console.error("Error getting workout templates:", error);
    return [];
  }
}

export async function createWorkoutTemplate(
  userId: string,
  template: Omit<WorkoutTemplate, "id">
): Promise<string> {
  try {
    const templatesCol = adminDb.collection(`users/${userId}/workoutTemplates`);

    const docRef = await templatesCol.add({
      ...template,
      createdAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating workout template:", error);
    throw new Error("Failed to create workout template");
  }
}

export async function getExerciseProgress(
  userId: string,
  exerciseName: string,
  limitResults: number = 10
): Promise<ExerciseProgressPoint[]> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const q = workoutsCol.orderBy("createdAt", "desc").limit(limitResults);
    const querySnapshot = await q.get();

    const progressData: ExerciseProgressPoint[] = [];

    querySnapshot.docs.forEach((doc) => {
      const workout = doc.data();
      const exercise = workout.loggedExercises?.find(
        (ex: { exerciseName: string }) => ex.exerciseName === exerciseName
      );

      if (exercise && exercise.volume.length > 0) {
        const maxWeight = Math.max(
          ...exercise.volume.map((set: { weight: number }) => set.weight)
        );

        // Find the reps corresponding to the max weight (take the first occurrence)
        const maxWeightSet = exercise.volume.find(
          (set: { weight: number; reps: number }) => set.weight === maxWeight
        );
        const maxReps = maxWeightSet ? maxWeightSet.reps : 0;

        progressData.push({
          date: workout.createdAt,
          maxWeight,
          maxReps,
          sets: exercise.volume.length,
        });
      }
    });

    return progressData.reverse(); // Return in chronological order
  } catch (error) {
    console.error("Error getting exercise progress:", error);
    return [];
  }
}

export async function getPersonalRecords(
  userId: string
): Promise<PersonalRecord[]> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const querySnapshot = await workoutsCol.get();

    const exerciseRecords: Record<string, PersonalRecord> = {};

    querySnapshot.docs.forEach((doc) => {
      const workout = doc.data();
      const workoutDate = workout.createdAt;

      workout.loggedExercises?.forEach((exercise: LoggedExercise) => {
        if (exercise.volume && exercise.volume.length > 0) {
          exercise.volume.forEach((set: { weight: number; reps: number }) => {
            const currentRecord = exerciseRecords[exercise.exerciseName];

            if (!currentRecord || set.weight > currentRecord.weight) {
              exerciseRecords[exercise.exerciseName] = {
                exercise: exercise.exerciseName,
                weight: set.weight,
                reps: set.reps,
                date: workoutDate,
              };
            }
          });
        }
      });
    });

    return Object.values(exerciseRecords)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10); // Top 10 records
  } catch (error) {
    console.error("Error getting personal records:", error);
    return [];
  }
}

export async function getLastPerformance(
  userId: string,
  exerciseName: string
): Promise<LastPerformance | null> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const q = workoutsCol.orderBy("createdAt", "desc").limit(10);
    const querySnapshot = await q.get();

    for (const doc of querySnapshot.docs) {
      const workout = doc.data();
      const exercise = workout.loggedExercises?.find(
        (ex: LoggedExercise) => ex.exerciseName === exerciseName
      );

      if (exercise && exercise.volume.length > 0) {
        // Get the first set from the last session (when user is strongest)
        const sets = exercise.volume;
        const firstSet = sets[0];
        const totalSets = sets.length;

        return {
          weight: firstSet.weight,
          reps: firstSet.reps,
          sets: totalSets,
          date: workout.createdAt,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting last performance:", error);
    return null;
  }
}
