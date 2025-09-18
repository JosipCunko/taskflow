"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Plus,
  Trash2,
  Save,
  Timer,
  Target,
  Search,
  X,
  Edit,
} from "lucide-react";
import {
  WorkoutSession as WorkoutSessionType,
  LoggedExercise,
  WorkoutSet,
  Exercise,
  LastPerformance,
} from "../../../_types/types";
import {
  updateWorkoutAction,
  completeWorkoutSessionAction,
  getWorkoutAction,
  getLastPerformanceAction,
} from "../../../_lib/gymActions";
import { formatDate, handleToast } from "../../../_utils/utils";
import { defaultExercises } from "../../../../public/exerciseLibrary";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Modal from "@/app/_components/Modal";
import Loader from "@/app/_components/Loader";

export default function WorkoutSession({
  userId,
  workoutId,
}: {
  userId: string;
  workoutId?: string;
}) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isFinished = !!workout?.duration;

  // Timer for workout duration
  useEffect(() => {
    if (isFinished) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isFinished]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restTimer]);

  useEffect(() => {
    const loadWorkout = async () => {
      if (workoutId) {
        // Fetch existing workout
        const result = await getWorkoutAction(workoutId);
        if (result.success && result.data) {
          setWorkout(result.data);
          setNotes(result.data.notes || "");
          if (!result.data.duration) {
            setStartTime(new Date(result.data.createdAt));
          }
        } else {
          setWorkout(null);
        }
      } else {
        throw new Error("This code should never be reached and executed!");
      }
      setIsLoading(false);
    };

    loadWorkout();
  }, [userId, workoutId]);

  useEffect(() => {
    // Load exercises for search
    setExercises(
      defaultExercises.map((ex, index) => ({ ...ex, id: index.toString() }))
    );
  }, []);

  const workoutDuration =
    isFinished && workout.duration
      ? workout.duration * 60
      : Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  const hours = Math.floor(workoutDuration / 3600);
  const minutes = Math.floor((workoutDuration % 3600) / 60);
  const seconds = workoutDuration % 60;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addExercise = (exercise: Exercise) => {
    if (!workout) return;

    const newLoggedExercise: LoggedExercise = {
      id: Date.now().toString(),
      exerciseName: exercise.name,
      order: workout.loggedExercises.length,
      volume: [],
    };

    setWorkout({
      ...workout,
      loggedExercises: [...workout.loggedExercises, newLoggedExercise],
    });
  };

  const addSet = (exerciseId: string, weight: number, reps: number) => {
    if (!workout) return;

    const newSet: WorkoutSet = { weight, reps };

    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, volume: [...ex.volume, newSet] } : ex
      ),
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              volume: ex.volume.filter((_, index) => index !== setIndex),
            }
          : ex
      ),
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.filter(
        (ex) => ex.id !== exerciseId
      ),
    });
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setIsResting(true);
  };

  const saveWorkout = async () => {
    if (!workout) return;

    const result = await updateWorkoutAction(workout.id, {
      name: workout.name,
      loggedExercises: workout.loggedExercises,
      notes,
    });

    handleToast(result);
  };

  const finishWorkout = async () => {
    if (!workout) return;

    const result = await completeWorkoutSessionAction(
      workout.id,
      Math.floor(workoutDuration / 60),
      notes,
      workout.loggedExercises
    );

    handleToast(result, () => {
      router.push("/webapp/gym");
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!workout) {
    return (
      <div className="text-center py-8">
        <p className="text-text-low">Workout #{workoutId} not found</p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header with Timer */}
        <div className="bg-background-600 rounded-lg p-6 border border-background-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <Edit className="w-5 h-5" />
                <Input
                  name="name"
                  type="text"
                  value={workout.name}
                  onChange={(e) =>
                    setWorkout({ ...workout, name: e.target.value })
                  }
                  className="text-2xl font-bold bg-transparent text-text-low"
                  disabled={isFinished}
                />
              </div>
              <p className="text-text-low">{formatDate(workout.createdAt)}</p>
            </div>

            <div className="flex items-center gap-4">
              {isResting && (
                <div className="flex items-center gap-2 text-warning">
                  <Timer className="w-5 h-5" />
                  <span className="font-mono text-lg">
                    {formatTime(restTimer)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-primary-500">
                <Play className="w-5 h-5" />
                <span className="font-mono text-xl">
                  {hours > 0 ? `${hours}:` : ""}
                  {minutes.toString().padStart(2, "0")}:
                  {seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {workout.loggedExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onRemoveExercise={removeExercise}
              onStartRest={startRestTimer}
              isPastWorkout={isFinished}
            />
          ))}

          {/* Add Exercise Button */}
          {!isFinished && (
            <Modal.Open opens="exercise-search">
              <Button variant="secondary" className="w-full flex-col p-8">
                <Plus className="w-8 h-8" />
                <span>Add Exercise</span>
              </Button>
            </Modal.Open>
          )}
        </div>

        {/* Notes */}
        <div className="bg-background-600 rounded-lg p-6 border border-background-500">
          <h3 className="text-lg font-semibold text-text-low mb-3">
            Workout Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about your workout..."
            className="w-full h-24 bg-background-700 border border-background-500 rounded-lg p-3 text-text-low placeholder-text-low resize-none focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500"
            disabled={isFinished}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={saveWorkout}
            className="flex-1 justify-center"
            disabled={isFinished}
          >
            <Save className="w-5 h-5" />
            Save Progress
          </Button>
          {isFinished ? (
            <Button
              onClick={() => router.back()}
              className="flex-1 justify-center"
            >
              <X className="w-5 h-5" />
              Close
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={finishWorkout}
              className="flex-1 bg-success hover:bg-success/90 text-white border border-success/50 justify-center py-5"
            >
              <Target className="w-5 h-5" />
              Finish Workout
            </Button>
          )}
        </div>
      </div>

      <Modal.Window name="exercise-search">
        <ExerciseSearchModal
          onAddExercise={addExercise}
          exercises={exercises}
        />
      </Modal.Window>
    </Modal>
  );
}

function ExerciseSearchModal({
  onAddExercise,
  exercises,
  onCloseModal,
}: {
  onAddExercise: (exercise: Exercise) => void;
  exercises: Exercise[];
  onCloseModal?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-bigger p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-low">Add Exercise</h2>
        <Button variant="secondary" onClick={onCloseModal} className="ml-auto">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative mb-4 ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-low" />
        <Input
          name="search-exercise"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search exercises..."
          className="w-full pl-10 pr-4 py-2 bg-background-700 text-text-low"
        />
      </div>

      <div className="space-y-2 max-h-[85%] overflow-y-auto">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => {
              onAddExercise(exercise);
              onCloseModal?.();
            }}
            className="w-full text-left p-3 bg-background-700 hover:bg-background-500 rounded-lg border border-background-500 transition-colors"
          >
            <h3 className="font-medium text-text-low">{exercise.name}</h3>
            <p className="text-sm text-text-low">
              {exercise.category} • {exercise.muscleGroups.join(", ")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: LoggedExercise;
  onAddSet: (exerciseId: string, weight: number, reps: number) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onStartRest: (seconds: number) => void;
  isPastWorkout: boolean;
}

function ExerciseCard({
  exercise,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onStartRest,
  isPastWorkout,
}: ExerciseCardProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [lastPerformance, setLastPerformance] =
    useState<LastPerformance | null>(null);

  useEffect(() => {
    const loadLastPerformance = async () => {
      const result = await getLastPerformanceAction(exercise.exerciseName);
      if (result.success && result.data) {
        setLastPerformance(result.data);
      }
    };

    loadLastPerformance();
  }, [exercise.exerciseName]);

  const handleAddSet = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (weightNum > 0 && repsNum > 0) {
      onAddSet(exercise.id, weightNum, repsNum);
      setWeight("");
      setReps("");
    }
  };

  return (
    <div className="bg-background-600 ring-2 ring-primary-500/20 [:has(:focus-within)]:ring-primary-500 rounded-lg p-6 border border-background-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-low">
          {exercise.exerciseName}
        </h3>
        {!isPastWorkout && (
          <Button
            variant="secondary"
            onClick={() => onRemoveExercise(exercise.id)}
            className="p-2 hover:bg-background-500 rounded-lg text-text-low hover:text-error transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Sets */}
      <div className="space-y-2 mb-4">
        {exercise.volume.map((set, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-background-700 rounded-lg p-3"
          >
            <span className="text-text-low">
              Set {index + 1}: {set.weight}kg × {set.reps} reps
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => onStartRest(90)}
                className="px-3 py-1 bg-warning/20 text-warning rounded text-sm hover:bg-warning/30 transition-colors"
              >
                Rest 90s
              </Button>
              {!isPastWorkout && (
                <Button
                  variant="secondary"
                  onClick={() => onRemoveSet(exercise.id, index)}
                  className="p-1 hover:bg-background-500 rounded text-text-low hover:text-error transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Form */}
      {!isPastWorkout && (
        <div className="flex gap-2">
          <Input
            name="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (kg)"
            className="flex-1 px-3 py-2 bg-background-700 border border-background-500 rounded-lg text-text-low"
          />
          <Input
            name="reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Reps"
            className="flex-1 px-3 py-2 bg-background-700 border border-background-500 rounded-lg text-text-low"
          />
          <Button
            variant="secondary"
            onClick={handleAddSet}
            disabled={!weight || !reps}
            className="bg-primary-500/50 hover:bg-primary-600/50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Progressive Overload Hint */}
      {exercise.volume.length === 0 && lastPerformance && (
        <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-info">
            💡 Progressive Overload Hint: Last time you did{" "}
            {lastPerformance.sets}×{lastPerformance.reps} @{" "}
            {lastPerformance.weight}kg
            <br />
            <span className="text-xs text-text-low">
              Try: {lastPerformance.weight + 2.5}kg × {lastPerformance.reps} or{" "}
              {lastPerformance.weight}kg × {lastPerformance.reps + 1}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
