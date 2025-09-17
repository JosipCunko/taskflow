import "server-only";
import { adminDb } from "./admin";
import admin from "firebase-admin";
import { WorkoutSession, Exercise, WorkoutTemplate } from "../_types/types";

export async function getWorkouts(userId: string): Promise<WorkoutSession[]> {
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
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error) {
    console.error("Error getting workout sessions:", error);
    return [];
  }
}

export async function getWorkout(
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
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Error getting workout session:", error);
    return null;
  }
}

export async function createWorkout(
  userId: string,
  workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const now = new Date();

    const docRef = await workoutsCol.add({
      ...workoutData,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
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
      updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
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
        createdAt: data.createdAt.toDate(),
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
      createdAt: admin.firestore.Timestamp.fromDate(template.createdAt),
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
) {
  try {
    const workoutsCol = adminDb.collection(`users/${userId}/workouts`);
    const q = workoutsCol.orderBy("createdAt", "desc").limit(limitResults);
    const querySnapshot = await q.get();

    const progressData: Array<{
      date: Date;
      maxWeight: number;
      totalVolume: number;
      sets: number;
    }> = [];

    querySnapshot.docs.forEach((doc) => {
      const workout = doc.data();
      const exercise = workout.loggedExercises?.find(
        (ex: { exerciseName: string }) => ex.exerciseName === exerciseName
      );

      if (exercise && exercise.volume.length > 0) {
        const maxWeight = Math.max(
          ...exercise.volume.map((set: { weight: number }) => set.weight)
        );
        const totalVolume = exercise.volume.reduce(
          (sum: number, set: { weight: number; reps: number }) =>
            sum + set.weight * set.reps,
          0
        );

        progressData.push({
          date: workout.createdAt.toDate(),
          maxWeight,
          totalVolume,
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
