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
import {
  TrendingUp,
  Trophy,
  Target,
  ChevronDown,
  Award,
  Zap,
} from "lucide-react";
// Remove unused import
// Remove direct import - we'll use API or server component
import { defaultExercises } from "../../../_lib/exerciseLibrary";
import { cn } from "../../../_utils/utils";

interface ProgressVisualizationProps {
  userId: string;
}

type MetricType = "maxWeight" | "totalVolume" | "estimatedOneRepMax";

interface ProgressData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  estimatedOneRepMax: number;
}

export default function ProgressVisualization({
  userId,
}: ProgressVisualizationProps) {
  const [selectedExercise, setSelectedExercise] = useState(
    "Barbell Bench Press"
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("maxWeight");
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  const exercises = defaultExercises.map((ex) => ex.name);

  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch from API endpoint in a real app
        // For now, use mock data for demonstration
        setProgressData([
          {
            date: "Jan 1",
            maxWeight: 80,
            totalVolume: 2400,
            estimatedOneRepMax: 100,
          },
          {
            date: "Jan 8",
            maxWeight: 82.5,
            totalVolume: 2475,
            estimatedOneRepMax: 103,
          },
          {
            date: "Jan 15",
            maxWeight: 85,
            totalVolume: 2550,
            estimatedOneRepMax: 106,
          },
          {
            date: "Jan 22",
            maxWeight: 87.5,
            totalVolume: 2625,
            estimatedOneRepMax: 109,
          },
          {
            date: "Jan 29",
            maxWeight: 90,
            totalVolume: 2700,
            estimatedOneRepMax: 112,
          },
          {
            date: "Feb 5",
            maxWeight: 92.5,
            totalVolume: 2775,
            estimatedOneRepMax: 115,
          },
        ]);
      } catch (error) {
        console.error("Error loading progress data:", error);
      }
      setIsLoading(false);
    };

    loadProgressData();
  }, [userId, selectedExercise]);

  const calculateOneRepMax = (weight: number, reps: number): number => {
    // Brzycki formula: 1RM = Weight / (1.0278 - 0.0278 * Reps)
    return Math.round(weight / (1.0278 - 0.0278 * reps));
  };

  const getMetricConfig = (metric: MetricType) => {
    switch (metric) {
      case "maxWeight":
        return {
          label: "Max Weight",
          unit: "kg",
          color: "#3b82f6",
          icon: Target,
        };
      case "totalVolume":
        return {
          label: "Total Volume",
          unit: "kg",
          color: "#10b981",
          icon: TrendingUp,
        };
      case "estimatedOneRepMax":
        return {
          label: "Est. 1RM",
          unit: "kg",
          color: "#f59e0b",
          icon: Zap,
        };
    }
  };

  const currentConfig = getMetricConfig(selectedMetric);
  const latestData = progressData[progressData.length - 1];
  const previousData = progressData[progressData.length - 2];

  const improvement =
    latestData && previousData
      ? ((latestData[selectedMetric] - previousData[selectedMetric]) /
          previousData[selectedMetric]) *
        100
      : 0;

  //placeholder data
  const personalRecords = [
    {
      exercise: "Barbell Bench Press",
      weight: 92.5,
      reps: 8,
      date: "Feb 5, 2024",
    },
    { exercise: "Deadlift", weight: 140, reps: 5, date: "Feb 3, 2024" },
    { exercise: "Barbell Squat", weight: 120, reps: 6, date: "Feb 1, 2024" },
    { exercise: "Overhead Press", weight: 65, reps: 8, date: "Jan 30, 2024" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-background-600 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-background-600 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exercise and Metric Selection */}
      <div className="bg-background-600 rounded-lg p-6 border border-background-500">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Exercise Dropdown */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-text-low mb-2">
              Select Exercise
            </label>
            <button
              onClick={() => setShowExerciseDropdown(!showExerciseDropdown)}
              className="w-full bg-background-700 border border-background-500 rounded-lg px-4 py-3 text-left text-text-high flex items-center justify-between"
            >
              {selectedExercise}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExerciseDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background-700 border border-background-500 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
                {exercises.map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => {
                      setSelectedExercise(exercise);
                      setShowExerciseDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-text-high hover:bg-background-600 transition-colors"
                  >
                    {exercise}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metric Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-low mb-2">
              Metric to Track
            </label>
            <div className="flex gap-2">
              {(
                [
                  "maxWeight",
                  "totalVolume",
                  "estimatedOneRepMax",
                ] as MetricType[]
              ).map((metric) => {
                const config = getMetricConfig(metric);
                return (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border transition-colors text-sm",
                      selectedMetric === metric
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-background-700 text-text-low border-background-500 hover:bg-background-600"
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
                  <TrendingUp className="w-3 h-3" />
                  {improvement > 0 ? "+" : ""}
                  {improvement.toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-80">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-600 rounded-lg p-6 border border-background-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-semibold text-text-high">Current Best</h3>
          </div>
          <div className="text-2xl font-bold text-text-high">
            {latestData ? `${latestData.maxWeight} kg` : "No data"}
          </div>
          <p className="text-sm text-text-low">Personal record weight</p>
        </div>

        <div className="bg-background-600 rounded-lg p-6 border border-background-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info/10 rounded-lg">
              <Zap className="w-5 h-5 text-info" />
            </div>
            <h3 className="font-semibold text-text-high">Est. 1RM</h3>
          </div>
          <div className="text-2xl font-bold text-text-high">
            {latestData ? `${latestData.estimatedOneRepMax} kg` : "No data"}
          </div>
          <p className="text-sm text-text-low">Estimated one rep max</p>
        </div>

        <div className="bg-background-600 rounded-lg p-6 border border-background-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-semibold text-text-high">Total Volume</h3>
          </div>
          <div className="text-2xl font-bold text-text-high">
            {latestData
              ? `${latestData.totalVolume.toLocaleString()} kg`
              : "No data"}
          </div>
          <p className="text-sm text-text-low">Last session volume</p>
        </div>
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
                <p className="text-sm text-text-low">{record.date}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-text-high">
                  {record.weight}kg × {record.reps}
                </div>
                <div className="text-sm text-accent">
                  {calculateOneRepMax(record.weight, record.reps)}kg 1RM
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
