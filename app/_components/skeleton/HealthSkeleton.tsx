import { Calendar, Plus, Target, TrendingUp, Utensils } from "lucide-react";
import Bone from "./Bone";
import { formatDate } from "@/app/_utils/utils";

function NutrientCardSkeleton() {
  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Bone className="h-5 w-5 rounded" />
        <Bone className="h-6 w-20 rounded" />
      </div>
      <div className="mb-2 flex items-baseline gap-1">
        <Bone className="h-8 w-16 rounded" />
        <Bone className="h-4 w-20 rounded" />
      </div>
      <Bone className="w-full h-3 rounded-full mb-2" />
      <Bone className="h-4 w-24 rounded" />
    </div>
  );
}

function LoggedMealCardSkeleton() {
  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-4 space-y-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <Bone className="h-7 w-40 rounded mb-2" />
          <div className="flex items-center gap-4 mt-1">
            <Bone className="h-6 w-16 rounded-md" />
            <Bone className="h-4 w-16 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-background-625 border border-background-500 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Bone className="w-4 h-4 rounded" />
              <Bone className="h-4 w-16 rounded" />
            </div>
            <Bone className="h-6 w-14 rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t border-background-500">
        <Bone className="h-9 w-20 rounded-md" />
        <Bone className="h-9 w-16 rounded-md" />
      </div>
    </div>
  );
}

export default function HealthSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-background-500/50 text-text-low border border-primary-500/10 w-full sm:w-auto">
          <Bone className="w-5 h-5 rounded" />
          <Bone className="h-4 w-24 rounded" />
        </div>
        <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50 w-full sm:w-auto">
          <Target className="w-4 aspect-square" />
          <span className="sm:inline">Set Goals</span>
        </div>
        <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50 w-full sm:w-auto">
          <Plus className="w-4 aspect-square" />
          <span className="sm:inline">Log Meal</span>
        </div>
        <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50 w-full sm:w-auto">
          <Plus className="w-4 aspect-square" />
          <span className="sm:inline">Save Meal</span>
        </div>
        <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-background-500/50 text-text-low border border-primary-500/10 w-full sm:w-auto">
          <Utensils className="w-4 aspect-square" />
          <span className="sm:inline">Manage Meals</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-low flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 min-w-5 mr-1" />
          Daily nutrition summary for {formatDate(Date.now())}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <NutrientCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg sm:p-6 py-6 px-0">
        <div className="mb-6 sm:px-0 px-2">
          <h2 className="text-2xl font-semibold text-text-low flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 min-w-5 text-primary-500" />
            <span className="text-nowrap">Nutrition Progress</span>
          </h2>
          <p className="text-text-low text-sm">
            Track your nutrition trends over time
          </p>
        </div>
        <div className="mb-6 space-y-4 sm:px-0 px-2">
          <div className="flex flex-wrap gap-2">
            {["1 Month", "3 Months", "6 Months", "1 Year"].map((label) => (
              <Bone key={label} className="h-9 w-24 rounded-md" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["Calories", "Protein", "Carbs", "Fat"].map((label) => (
              <Bone key={label} className="h-9 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:px-0 px-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background-700 rounded-lg p-4">
              <Bone className="h-4 w-24 rounded mb-2" />
              <Bone className="h-7 w-16 rounded" />
            </div>
          ))}
        </div>
        <Bone className="h-80 w-full rounded-lg" />
      </div>

      <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-text-low flex flex-wrap items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 min-w-5 mr-2" />
          <span className="text-nowrap">Meals recorded on </span>
          <span className="text-nowrap">{formatDate(Date.now())}</span>
        </h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {[...Array(2)].map((_, i) => (
            <LoggedMealCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
