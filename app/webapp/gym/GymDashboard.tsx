"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { WorkoutSession } from "../../_types/types";
import { cn } from "../../_utils/utils";
// Remove direct import - we'll fetch via API or server component
import { startWorkoutSession } from "../../_lib/gymActions";
import { handleToast } from "../../_utils/utils";

interface GymDashboardProps {
  userId: string;
  initialWorkouts?: WorkoutSession[];
}

export default function GymDashboard({ userId, initialWorkouts = [] }: GymDashboardProps) {
  const router = useRouter();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>(initialWorkouts);
  const [isLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    // For now, use empty array - in a real app you'd fetch from an API endpoint
    setWorkoutSessions([]);
  }, [userId]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getWorkoutForDay = (date: Date) => {
    return workoutSessions.find(session => 
      isSameDay(new Date(session.date), date)
    );
  };

  const thisWeekWorkouts = workoutSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  const stats = [
    {
      label: "This Week",
      value: thisWeekWorkouts.length,
      icon: Target,
      color: "text-primary-500",
      bgColor: "bg-primary-500/10"
    },
    {
      label: "Total Workouts",
      value: workoutSessions.length,
      icon: Trophy,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      label: "Avg Duration",
      value: workoutSessions.length > 0 
        ? `${Math.round(workoutSessions.reduce((acc, w) => acc + (w.duration || 0), 0) / workoutSessions.length)}m`
        : "0m",
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10"
    },
    {
      label: "Progress",
      value: "↗️ +12%",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-background-600 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-background-600 rounded-lg animate-pulse" />
      </div>
    );
  }

  const handleStartWorkout = async () => {
    const workoutName = `Workout ${format(new Date(), "MMM d, yyyy")}`;
    const result = await startWorkoutSession(workoutName);
    
    if (result.success && result.data) {
      router.push(`/webapp/gym/workout?id=${result.data}`);
    } else {
      handleToast(result);
    }
  };

  const handleViewProgress = () => {
    router.push("/webapp/gym/progress");
  };

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
                <p className="text-text-medium text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-text-high">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleStartWorkout}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Start New Workout
        </button>
        <button 
          onClick={handleViewProgress}
          className="flex-1 bg-background-600 hover:bg-background-500 text-text-high font-semibold py-4 px-6 rounded-lg transition-colors border border-background-500 flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          View Progress
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Overview
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-background-500 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="text-text-medium font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>
            <button 
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-background-500 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-text-medium mb-2">{day}</div>
              <div className={cn(
                "h-16 rounded-lg border-2 border-dashed border-background-500 flex items-center justify-center relative",
                isToday(weekDays[index]) && "border-primary-500 bg-primary-500/5"
              )}>
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
          ))}
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <h2 className="text-xl font-semibold text-text-high mb-4">Recent Workouts</h2>
        {workoutSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-text-low mb-2">No workouts recorded yet</div>
            <p className="text-text-medium text-sm">Start your first workout to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutSessions.slice(0, 5).map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 bg-background-700 rounded-lg border border-background-500"
              >
                <div>
                  <h3 className="font-medium text-text-high">{workout.name}</h3>
                  <p className="text-sm text-text-medium">
                    {format(new Date(workout.date), "MMM d, yyyy")} • {workout.duration}min
                  </p>
                </div>
                <div className="text-sm text-text-medium">
                  {workout.loggedExercises.length} exercises
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Templates */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-high">My Workout Templates</h2>
          <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
            Create Template
          </button>
        </div>
        <div className="text-center py-8">
          <div className="text-text-low mb-2">No templates created yet</div>
          <p className="text-text-medium text-sm">Create workout templates for quick access to your favorite routines</p>
        </div>
      </div>
    </div>
  );
}