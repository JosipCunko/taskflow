"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Target, Award, Zap, Search, X } from "lucide-react";
import { defaultExercises } from "../../../public/exerciseLibrary";
import {
  getExerciseProgressAction,
  getPersonalRecordsAction,
} from "../../_lib/fitnessActions";
import { cn } from "../../_utils/utils";
import { ExerciseProgressPoint, PersonalRecord } from "../../_types/types";
import Input from "@/app/_components/reusable/Input";
import Loader from "../Loader";

interface ProgressVisualizationProps {
  userId: string;
}

type MetricType = "maxWeight";

interface ProgressData {
  date: string;
  maxWeight: number;
  maxReps: number;
}

export default function ProgressVisualization({
  userId,
}: ProgressVisualizationProps) {
  const [selectedExercise, setSelectedExercise] = useState(
    "Barbell Bench Press"
  );
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");

  const exercises = defaultExercises.map((ex) => ex.name);
  const filteredExercises = exercises.filter((exercise) =>
    exercise.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);
      try {
        const result = await getExerciseProgressAction(selectedExercise);

        if (result.success && result.data) {
          const rawData = result.data as ExerciseProgressPoint[];

          // Transform the data for the chart
          const chartData: ProgressData[] = rawData.map((item) => {
            return {
              date: new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
              }).format(new Date(item.date)),
              maxWeight: item.maxWeight,
              maxReps: item.maxReps,
            };
          });

          setProgressData(chartData);
        } else {
          // No data available for this exercise
          setProgressData([]);
        }
      } catch (error) {
        console.error("Error loading progress data:", error);
        setProgressData([]);
      }
      setIsLoading(false);
    };

    loadProgressData();
  }, [userId, selectedExercise]);

  useEffect(() => {
    const loadPersonalRecords = async () => {
      try {
        const result = await getPersonalRecordsAction();
        if (result.success && result.data) {
          setPersonalRecords(result.data as PersonalRecord[]);
        }
      } catch (error) {
        console.error("Error loading personal records:", error);
      }
    };

    loadPersonalRecords();
  }, [userId]);

  const getMetricConfig = (metric: MetricType) => {
    switch (metric) {
      case "maxWeight":
        return {
          label: "Max Weight",
          unit: "kg",
          color: "#3b82f6",
          icon: Target,
        };
    }
  };

  const selectedMetric: MetricType = "maxWeight";
  const currentConfig = getMetricConfig(selectedMetric);
  const latestData = progressData[progressData.length - 1];
  const previousData = progressData[progressData.length - 2];

  const improvement =
    latestData && previousData
      ? ((latestData[selectedMetric] - previousData[selectedMetric]) /
          previousData[selectedMetric]) *
        100
      : 0;

  return (
    <div className="flex flex-col gap-y-6 relative">
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full relative">
            <label className="block text-sm font-medium text-text-low mb-2">
              Select Exercise
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-low z-10" />
              <Input
                name="exercise-search"
                type="text"
                value={exerciseSearchTerm || selectedExercise}
                onChange={(e) => {
                  setExerciseSearchTerm(e.target.value);
                  setShowExerciseDropdown(true);
                }}
                onFocus={() => {
                  setExerciseSearchTerm("");
                  setShowExerciseDropdown(true);
                }}
                placeholder="Search exercises..."
                className="w-full bg-background-700 pl-10 pr-10 py-3 text-text-high"
              />
              {showExerciseDropdown && (
                <button
                  onClick={() => {
                    setShowExerciseDropdown(false);
                    setExerciseSearchTerm("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-low hover:text-text-high"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showExerciseDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background-700 border border-background-500 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <button
                      key={exercise}
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setShowExerciseDropdown(false);
                        setExerciseSearchTerm("");
                      }}
                      className="w-full px-4 py-2 text-left text-text-high hover:bg-background-600 transition-colors"
                    >
                      {exercise}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-text-low">
                    No exercises found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[10rem] relative">
          <Loader label="Loading progress data..." />
        </div>
      ) : (
        <>
          {/* Progress Chart */}
          <div className="bg-background-600 rounded-lg p-6 border border-background-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={cn("p-2 rounded-lg")}
                  style={{ backgroundColor: `${currentConfig.color}20` }}
                >
                  <currentConfig.icon
                    className="w-5 h-5"
                    style={{ color: currentConfig.color }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-high">
                    {currentConfig.label} Progress
                  </h2>
                  <p className="text-text-low text-sm">{selectedExercise}</p>
                </div>
              </div>

              {latestData && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-high">
                    {latestData[selectedMetric]} {currentConfig.unit}
                  </div>
                  {improvement !== 0 && (
                    <div
                      className={cn(
                        "text-sm flex items-center gap-1",
                        improvement > 0 ? "text-success" : "text-error"
                      )}
                    >
                      <Zap className="w-3 h-3" />
                      {improvement > 0 ? "+" : ""}
                      {improvement.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-80 relative">
              <div
                className={cn(
                  "w-full h-full",
                  progressData.length === 0 && "opacity-0"
                )}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f9fafb",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={currentConfig.color}
                      strokeWidth={3}
                      dot={{ fill: currentConfig.color, strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 6,
                        stroke: currentConfig.color,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {progressData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background-600/50 rounded-lg opacity-80">
                  <p className="text-text-high font-semibold">
                    No data for this exercise
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-background-600 rounded-lg p-6 border border-background-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold text-text-high">Current Best</h3>
            </div>
            <div className="text-2xl font-bold text-text-high">
              {latestData
                ? `${latestData.maxWeight}kg × ${latestData.maxReps} reps`
                : "No data"}
            </div>
            <p className="text-sm text-text-low">
              Personal record (weight × reps)
            </p>
          </div>

          {/* Personal Records */}
          <div className="bg-background-600 rounded-lg p-6 border border-background-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-text-high">
                Personal Records
              </h2>
            </div>

            {personalRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-text-low mb-2">
                  No personal records yet
                </div>
                <p className="text-text-low text-sm">
                  Complete some workouts to see your personal records here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {personalRecords.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background-700 rounded-lg border border-background-500"
                  >
                    <div>
                      <h3 className="font-medium text-text-high">
                        {record.exercise}
                      </h3>
                      <p className="text-sm text-text-low">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(record.date))}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-text-high">
                        {record.weight}kg × {record.reps}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
