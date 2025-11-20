"use client";

import { useState, useEffect, useTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import Button from "@/app/_components/reusable/Button";
import { errorToast } from "@/app/_utils/utils";
import { HistoricalNutritionData } from "@/app/_lib/healthActions";

type TimePeriod = 1 | 3 | 6 | 12;
type NutrientType = "calories" | "protein" | "carbs" | "fat";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 1, label: "1 Month" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" },
];

const NUTRIENT_OPTIONS: {
  value: NutrientType;
  label: string;
  color: string;
  unit: string;
}[] = [
  { value: "calories", label: "Calories", color: "#818cf8", unit: "kcal" },
  { value: "protein", label: "Protein", color: "#f59e0b", unit: "g" },
  { value: "carbs", label: "Carbs", color: "#10b981", unit: "g" },
  { value: "fat", label: "Fat", color: "#ef4444", unit: "g" },
];

export default function NutritionGraphs() {
  const [isPending, startTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(1);
  const [selectedNutrient, setSelectedNutrient] =
    useState<NutrientType>("calories");
  const [data, setData] = useState<HistoricalNutritionData | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadData = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/health/historical", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monthsBack: selectedPeriod }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          errorToast(result.error || "Failed to load nutrition data");
        }
      } catch (error) {
        console.error("Error loading historical nutrition data:", error);
        errorToast("Failed to load nutrition data");
      }
    });
  };

  const currentNutrient = NUTRIENT_OPTIONS.find(
    (n) => n.value === selectedNutrient
  )!;
  const hasData = data && data.dataPoints.length > 0;

  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-high flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <span className="text-glow">Nutrition Progress</span>
        </h2>
        <p className="text-text-low text-sm">
          Track your nutrition trends over time
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Time Period Selector */}
        <div>
          <label className="block text-sm font-medium text-text-med mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                variant={
                  selectedPeriod === period.value ? "primary" : "secondary"
                }
                disabled={isPending}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Nutrient Type Selector */}
        <div>
          <label className="block text-sm font-medium text-text-med mb-2">
            Nutrient Type
          </label>
          <div className="flex flex-wrap gap-2">
            {NUTRIENT_OPTIONS.map((nutrient) => (
              <Button
                key={nutrient.value}
                onClick={() => setSelectedNutrient(nutrient.value)}
                variant={
                  selectedNutrient === nutrient.value ? "primary" : "secondary"
                }
              >
                {nutrient.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background-700 rounded-lg p-4">
            <div className="text-sm text-text-low mb-1">Avg. Calories</div>
            <div className="text-2xl font-bold text-primary-400">
              {data.averages.calories}
              <span className="text-sm text-text-low ml-1">kcal</span>
            </div>
          </div>
          <div className="bg-background-700 rounded-lg p-4">
            <div className="text-sm text-text-low mb-1">Avg. Protein</div>
            <div className="text-2xl font-bold text-accent">
              {data.averages.protein}
              <span className="text-sm text-text-low ml-1">g</span>
            </div>
          </div>
          <div className="bg-background-700 rounded-lg p-4">
            <div className="text-sm text-text-low mb-1">Avg. Carbs</div>
            <div className="text-2xl font-bold text-success">
              {data.averages.carbs}
              <span className="text-sm text-text-low ml-1">g</span>
            </div>
          </div>
          <div className="bg-background-700 rounded-lg p-4">
            <div className="text-sm text-text-low mb-1">Avg. Fat</div>
            <div className="text-2xl font-bold text-warning">
              {data.averages.fat}
              <span className="text-sm text-text-low ml-1">g</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-background-700 rounded-lg p-4">
        {isPending && (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-text-low">Loading...</div>
          </div>
        )}

        {!isPending && !hasData && (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-text-low">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No data available</p>
              <p className="text-sm">
                Start logging your meals to see your nutrition trends
              </p>
            </div>
          </div>
        )}

        {!isPending && hasData && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data.dataPoints}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="displayDate"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af" }}
                tickMargin={10}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af" }}
                label={{
                  value: `${currentNutrient.label} (${currentNutrient.unit})`,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#9ca3af" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
                labelStyle={{ color: "#d1d5db" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
              <Line
                type="monotone"
                dataKey={selectedNutrient}
                stroke={currentNutrient.color}
                strokeWidth={3}
                dot={{ fill: currentNutrient.color, r: 4 }}
                activeDot={{ r: 6 }}
                name={`${currentNutrient.label} (${currentNutrient.unit})`}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && (
        <div className="mt-4 text-sm text-text-low">
          <p>
            📊 Showing data for {data.dataPoints.length} day(s) over the last{" "}
            {selectedPeriod} month{selectedPeriod > 1 ? "s" : ""}
          </p>
          <p className="mt-1">
            💡 Days without logged meals are automatically excluded from the
            graph and average calculations
          </p>
        </div>
      )}
    </div>
  );
}
