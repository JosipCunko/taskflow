import { defaultExercises } from "@/public/exerciseLibrary";
import { LoggedExercise } from "@/app/_types/types";

/**
 * How an exercise's sets are measured:
 * - `weighted`  — load in kg plus reps
 * - `bodyweight` — reps only, there is no load to record
 * - `hold`      — seconds held, reps are meaningless
 */
export type ExerciseTracking = "weighted" | "bodyweight" | "hold";

/**
 * A logged exercise carries its own flags so past sessions keep rendering the way
 * they were recorded. Sessions started from a template don't have them, so the
 * library is the fallback.
 */
export function getExerciseTracking(
  exerciseName: string,
  logged?: Pick<LoggedExercise, "hold" | "bodyweight">
): ExerciseTracking {
  const libraryEntry = defaultExercises.find((ex) => ex.name === exerciseName);

  if (logged?.hold ?? libraryEntry?.hold) return "hold";
  if (logged?.bodyweight ?? libraryEntry?.bodyweight) return "bodyweight";
  return "weighted";
}
