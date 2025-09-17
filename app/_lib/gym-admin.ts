import "server-only";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { WorkoutSession, Exercise, WorkoutTemplate } from "../_types/types";

// Collection references
const getWorkoutsCollection = (userId: string) =>
  collection(db, `users/${userId}/workouts`);

const getExercisesCollection = () => collection(db, "exercises");

const getTemplatesCollection = (userId: string) =>
  collection(db, `users/${userId}/workoutTemplates`);

// Workout Sessions
export async function createWorkoutSession(
  userId: string,
  workoutData: Omit<WorkoutSession, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const workoutsCol = getWorkoutsCollection(userId);
    const now = new Date();
    
    const docRef = await addDoc(workoutsCol, {
      ...workoutData,
      date: Timestamp.fromDate(workoutData.date),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating workout session:", error);
    throw new Error("Failed to create workout session");
  }
}

export async function getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  try {
    const workoutsCol = getWorkoutsCollection(userId);
    const q = query(workoutsCol, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        date: data.date.toDate(),
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

export async function getWorkoutSession(
  userId: string,
  workoutId: string
): Promise<WorkoutSession | null> {
  try {
    const workoutDoc = doc(db, `users/${userId}/workouts/${workoutId}`);
    const docSnapshot = await getDoc(workoutDoc);
    
    if (!docSnapshot.exists()) {
      return null;
    }
    
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      userId,
      date: data.date.toDate(),
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

export async function updateWorkoutSession(
  userId: string,
  workoutId: string,
  updates: Partial<Omit<WorkoutSession, "id" | "userId" | "createdAt">>
): Promise<void> {
  try {
    const workoutDoc = doc(db, `users/${userId}/workouts/${workoutId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    
    await updateDoc(workoutDoc, updateData);
  } catch (error) {
    console.error("Error updating workout session:", error);
    throw new Error("Failed to update workout session");
  }
}

export async function deleteWorkoutSession(
  userId: string,
  workoutId: string
): Promise<void> {
  try {
    const workoutDoc = doc(db, `users/${userId}/workouts/${workoutId}`);
    await deleteDoc(workoutDoc);
  } catch (error) {
    console.error("Error deleting workout session:", error);
    throw new Error("Failed to delete workout session");
  }
}

// Exercise Library
export async function getExercises(): Promise<Exercise[]> {
  try {
    const exercisesCol = getExercisesCollection();
    const querySnapshot = await getDocs(exercisesCol);
    
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
    const exercisesCol = getExercisesCollection();
    const querySnapshot = await getDocs(exercisesCol);
    
    const exercises = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Exercise[];
    
    // Client-side filtering since Firestore doesn't support full-text search
    return exercises.filter((exercise) =>
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

// Workout Templates
export async function createWorkoutTemplate(
  userId: string,
  template: Omit<WorkoutTemplate, "id">
): Promise<string> {
  try {
    const templatesCol = getTemplatesCollection(userId);
    
    const docRef = await addDoc(templatesCol, {
      ...template,
      createdAt: Timestamp.fromDate(template.createdAt),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating workout template:", error);
    throw new Error("Failed to create workout template");
  }
}

export async function getWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
  try {
    const templatesCol = getTemplatesCollection(userId);
    const q = query(templatesCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
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

// Analytics and Progress
export async function getExerciseProgress(
  userId: string,
  exerciseName: string,
  limitResults: number = 10
) {
  try {
    const workoutsCol = getWorkoutsCollection(userId);
    const q = query(workoutsCol, orderBy("date", "desc"), limit(limitResults));
    const querySnapshot = await getDocs(q);
    
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
        const maxWeight = Math.max(...exercise.volume.map((set: { weight: number }) => set.weight));
        const totalVolume = exercise.volume.reduce(
          (sum: number, set: { weight: number; reps: number }) => sum + (set.weight * set.reps),
          0
        );
        
        progressData.push({
          date: workout.date.toDate(),
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