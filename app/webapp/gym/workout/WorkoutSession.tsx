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
  X
} from "lucide-react";
import { format } from "date-fns";
import { WorkoutSession as WorkoutSessionType, LoggedExercise, WorkoutSet, Exercise } from "../../../_types/types";
// Remove direct import - we'll use server component or API
import { updateWorkout, completeWorkoutSession } from "../../../_lib/gymActions";
import { handleToast } from "../../../_utils/utils";
import { defaultExercises } from "../../../_lib/exerciseLibrary";

interface WorkoutSessionProps {
  userId: string;
  workoutId?: string;
}

export default function WorkoutSession({ userId, workoutId }: WorkoutSessionProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for workout duration
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
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
    // For now, create a new workout - in a real app you'd fetch from API
    if (workoutId) {
      // TODO: Fetch workout from API endpoint
      setWorkout(null);
    } else {
      // Create new workout
      setWorkout({
        id: "new",
        userId,
        date: new Date(),
        name: `Workout ${format(new Date(), "MMM d, yyyy")}`,
        loggedExercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setIsLoading(false);
  }, [userId, workoutId]);

  useEffect(() => {
    // Load exercises for search
    setExercises(defaultExercises.map((ex, index) => ({ ...ex, id: index.toString() })));
  }, []);

  const workoutDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
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
    setShowExerciseModal(false);
    setSearchTerm("");
  };

  const addSet = (exerciseId: string, weight: number, reps: number) => {
    if (!workout) return;

    const newSet: WorkoutSet = { weight, reps };
    
    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, volume: [...ex.volume, newSet] }
          : ex
      ),
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, volume: ex.volume.filter((_, index) => index !== setIndex) }
          : ex
      ),
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      loggedExercises: workout.loggedExercises.filter(ex => ex.id !== exerciseId),
    });
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setIsResting(true);
  };

  const saveWorkout = async () => {
    if (!workout) return;

    const result = await updateWorkout(workout.id, {
      name: workout.name,
      loggedExercises: workout.loggedExercises,
      notes,
    });

    handleToast(result);
  };

  const finishWorkout = async () => {
    if (!workout) return;

    const result = await completeWorkoutSession(
      workout.id,
      Math.floor(workoutDuration / 60),
      notes
    );

    handleToast(result, () => {
      router.push("/webapp/gym");
    });
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-8">
        <p className="text-text-medium">Workout not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Timer */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <input
              type="text"
              value={workout.name}
              onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
              className="text-2xl font-bold bg-transparent border-none outline-none text-text-high"
            />
            <p className="text-text-medium">{format(workout.date, "EEEE, MMMM d, yyyy")}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isResting && (
              <div className="flex items-center gap-2 text-warning">
                <Timer className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(restTimer)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-primary-500">
              <Play className="w-5 h-5" />
              <span className="font-mono text-xl">
                {hours > 0 ? `${hours}:` : ""}{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
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
          />
        ))}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExerciseModal(true)}
          className="w-full bg-background-600 hover:bg-background-500 border-2 border-dashed border-background-400 rounded-lg p-8 transition-colors flex flex-col items-center gap-2 text-text-medium hover:text-text-high"
        >
          <Plus className="w-8 h-8" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Notes */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <h3 className="text-lg font-semibold text-text-high mb-3">Workout Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about your workout..."
          className="w-full h-24 bg-background-700 border border-background-500 rounded-lg p-3 text-text-high placeholder-text-low resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveWorkout}
          className="flex-1 bg-background-600 hover:bg-background-500 text-text-high font-semibold py-3 px-6 rounded-lg transition-colors border border-background-500 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Progress
        </button>
        <button
          onClick={finishWorkout}
          className="flex-1 bg-success hover:bg-success/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Target className="w-5 h-5" />
          Finish Workout
        </button>
      </div>

      {/* Exercise Search Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-background-600 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-high">Add Exercise</h2>
              <button
                onClick={() => setShowExerciseModal(false)}
                className="p-2 hover:bg-background-500 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-low" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-10 pr-4 py-2 bg-background-700 border border-background-500 rounded-lg text-text-high"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => addExercise(exercise)}
                  className="w-full text-left p-3 bg-background-700 hover:bg-background-500 rounded-lg border border-background-500 transition-colors"
                >
                  <h3 className="font-medium text-text-high">{exercise.name}</h3>
                  <p className="text-sm text-text-medium">{exercise.category} • {exercise.muscleGroups.join(", ")}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: LoggedExercise;
  onAddSet: (exerciseId: string, weight: number, reps: number) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onStartRest: (seconds: number) => void;
}

function ExerciseCard({ exercise, onAddSet, onRemoveSet, onRemoveExercise, onStartRest }: ExerciseCardProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

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
    <div className="bg-background-600 rounded-lg p-6 border border-background-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-high">{exercise.exerciseName}</h3>
        <button
          onClick={() => onRemoveExercise(exercise.id)}
          className="p-2 hover:bg-background-500 rounded-lg text-text-low hover:text-error transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sets */}
      <div className="space-y-2 mb-4">
        {exercise.volume.map((set, index) => (
          <div key={index} className="flex items-center justify-between bg-background-700 rounded-lg p-3">
            <span className="text-text-high">
              Set {index + 1}: {set.weight}kg × {set.reps} reps
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartRest(90)}
                className="px-3 py-1 bg-warning/20 text-warning rounded text-sm hover:bg-warning/30 transition-colors"
              >
                Rest 90s
              </button>
              <button
                onClick={() => onRemoveSet(exercise.id, index)}
                className="p-1 hover:bg-background-500 rounded text-text-low hover:text-error transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Form */}
      <div className="flex gap-2">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          className="flex-1 px-3 py-2 bg-background-700 border border-background-500 rounded-lg text-text-high"
        />
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          className="flex-1 px-3 py-2 bg-background-700 border border-background-500 rounded-lg text-text-high"
        />
        <button
          onClick={handleAddSet}
          disabled={!weight || !reps}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-background-500 disabled:text-text-low text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Previous Performance Hint */}
      {exercise.volume.length === 0 && (
        <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-info">💡 Progressive Overload Hint: Last time you did 3×8 @ 80kg</p>
        </div>
      )}
    </div>
  );
}