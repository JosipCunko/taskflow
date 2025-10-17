"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Trophy,
  TrendingUp,
  Clock,
  SquareArrowUpRight,
  CalendarArrowUp,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
} from "date-fns";
import { WorkoutSession, WorkoutTemplate } from "../../_types/types";
import { cn, formatDate } from "../../_utils/utils";
import {
  startWorkoutSessionAction,
  getWorkoutsAction,
  getWorkoutTemplatesAction,
  startWorkoutFromTemplateAction,
} from "../../_lib/fitnessActions";
import { handleToast } from "../../_utils/utils";
import Button from "@/app/_components/reusable/Button";
import CreateTemplateModal from "../../_components/fitness/CreateTemplateModal";
import Loader from "../Loader";

interface FitnessDashboardProps {
  userId: string;
  initialWorkouts?: WorkoutSession[];
}

export default function FitnessDashboard({
  userId,
  initialWorkouts = [],
}: FitnessDashboardProps) {
  const router = useRouter();
  const [workoutSessions, setWorkoutSessions] =
    useState<WorkoutSession[]>(initialWorkouts);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isPending, startTransition] = useTransition();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      startTransition(async () => {
        const [workoutsResult, templatesResult] = await Promise.all([
          getWorkoutsAction(),
          getWorkoutTemplatesAction(),
        ]);

        if (workoutsResult.success && workoutsResult.data) {
          setWorkoutSessions(workoutsResult.data);
        }

        if (templatesResult.success && templatesResult.data) {
          setWorkoutTemplates(templatesResult.data);
        }
      });
    };

    loadData();
  }, [userId]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const actualCurrentWeek = new Date();
  const actualWeekStart = startOfWeek(actualCurrentWeek, { weekStartsOn: 1 });
  const actualWeekEnd = endOfWeek(actualCurrentWeek, { weekStartsOn: 1 });

  const getWorkoutForDay = (date: Date) => {
    return workoutSessions.find((session) =>
      isSameDay(new Date(session.createdAt), date)
    );
  };

  const thisWeekWorkouts = workoutSessions.filter((session) => {
    const sessionDate = new Date(session.createdAt);
    return sessionDate >= actualWeekStart && sessionDate <= actualWeekEnd;
  });

  const stats = [
    {
      label: "This Week",
      value: thisWeekWorkouts.length,
      icon: CalendarArrowUp,
      color: "text-primary-500",
      bgColor: "bg-primary-500/10",
    },
    {
      label: "Total Workouts",
      value: workoutSessions.length,
      icon: Trophy,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg Duration",
      value:
        workoutSessions.length > 0
          ? `${Math.round(
              workoutSessions.reduce((acc, w) => acc + (w.duration || 0), 0) /
                workoutSessions.length
            )}m`
          : "0m",
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const handleStartWorkout = async () => {
    const workoutName = `Workout ${formatDate(new Date(), undefined, false)}`;
    const result = await startWorkoutSessionAction(workoutName);

    if (result.success && result.data) {
      router.push(`/webapp/fitness/workout?id=${result.data}`);
    } else {
      handleToast(result);
    }
  };

  const handleViewProgress = () => {
    router.push("/webapp/fitness/progress");
  };

  const handleStartFromTemplate = async (templateId: string) => {
    const template = workoutTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const workoutName = `${template.name} ${formatDate(
      new Date(),
      undefined,
      false
    )}`;
    const result = await startWorkoutFromTemplateAction(
      templateId,
      workoutName
    );

    if (result.success && result.data) {
      router.push(`/webapp/fitness/workout?id=${result.data}`);
    } else {
      handleToast(result);
    }
  };

  const handleTemplateCreated = async () => {
    // Reload templates
    const result = await getWorkoutTemplatesAction();
    if (result.success && result.data) {
      setWorkoutTemplates(result.data);
    }
  };
  if (isPending) {
    return (
      <div className="relative h-[10rem]">
        <Loader label="Loading data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-background-600 rounded-lg p-4 border border-background-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-low text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-text-high">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleStartWorkout} className="flex-1">
          <Plus className="size-5" />
          <span className="p-3">Start New Workout</span>
        </Button>
        <Button
          variant="secondary"
          onClick={handleViewProgress}
          className="flex-1"
        >
          <TrendingUp className="size-5" />
          <span className="p-3">View Progress</span>
        </Button>
      </div>

      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Overview
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentWeek(
                  new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
                )
              }
            >
              ←
            </Button>
            <span className="text-text-low font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentWeek(
                  new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
                )
              }
            >
              →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium text-text-low mb-2">
                  {day}
                </div>
                <div
                  className={cn(
                    "h-16 rounded-lg border-2 border-dashed border-background-500 flex items-center justify-center relative",
                    isToday(weekDays[index]) &&
                      "border-primary-500 bg-primary-500/5"
                  )}
                >
                  {getWorkoutForDay(weekDays[index]) ? (
                    <div className="w-full h-full bg-success/20 border-2 border-success rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-success rounded-full" />
                    </div>
                  ) : (
                    <div className="text-text-low text-xs">
                      {format(weekDays[index], "d")}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <h2 className="text-xl font-semibold text-text-high mb-4">
          Recent Workouts
        </h2>
        {workoutSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-text-low mb-2">No workouts recorded yet</div>
            <p className="text-text-low text-sm">
              Start your first workout to see your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutSessions.slice(0, 5).map((workout) => (
              <Link
                href={`/webapp/fitness/workout?id=${workout.id}`}
                key={workout.id}
                className={cn(
                  "block p-4 bg-background-700 rounded-lg border border-background-500 hover:bg-background-600 transition-colors",
                  !workout.duration &&
                    "border-primary-500/50 bg-primary-500/10 hover:bg-primary-500/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-high flex items-center gap-2">
                      <span>{workout.name}</span>
                      {!workout.duration ? (
                        <span className="text-xs font-semibold bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      ) : null}
                    </h3>
                    <p className="text-sm text-text-low">
                      {formatDate(new Date(workout.createdAt))}
                      {workout.duration ? ` • ${workout.duration} min` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-text-low">
                    {workout.loggedExercises.length} exercises
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-high">
            My Workout Templates
          </h2>
          <Button onClick={() => setShowCreateTemplateModal(true)}>
            <Plus className="size-5" />
            Create Template
          </Button>
        </div>

        {workoutTemplates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-text-low mb-2">No templates created yet</div>
            <p className="text-text-low text-sm">
              Create workout templates for quick access to your favorite
              routines
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-background-700 rounded-lg p-4 border border-background-500"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-high">
                    {template.name}
                  </h3>
                  <span className="text-xs text-text-low">
                    {template.exercises.length} exercises
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.exercises.slice(0, 3).map((exercise, index) => (
                      <span
                        key={index}
                        className="text-xs bg-background-600 text-text-low px-2 py-1 rounded"
                      >
                        {exercise}
                      </span>
                    ))}
                    {template.exercises.length > 3 && (
                      <span className="text-xs text-text-low px-2 py-1">
                        +{template.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleStartFromTemplate(template.id)}
                  variant="secondary"
                  className="w-full text-sm"
                >
                  <SquareArrowUpRight className="w-4 h-4" />
                  Start Workout
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
}
