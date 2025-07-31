"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  MealLog,
  MealNutrition,
  MealType,
} from "@/app/_types/spoonacularTypes";
import { updateMealLog, deleteMealLog } from "@/app/_lib/spoonacularActions";
import { customToast } from "@/app/_utils/toasts";
import Button from "./reusable/Button";
import Input from "./reusable/Input";
import {
  Trash2,
  Edit,
  Save,
  X,
  Utensils,
  Clock,
  AlertTriangle,
  Flame,
  Beef,
  Wheat,
  Drumstick,
} from "lucide-react";
import { isToday } from "date-fns";

const getDifficultyBadge = (readyInMinutes: number) => {
  if (readyInMinutes <= 20) return { text: "Quick", color: "bg-success" };
  if (readyInMinutes <= 45) return { text: "Easy", color: "bg-info" };
  if (readyInMinutes <= 90) return { text: "Medium", color: "bg-warning" };
  return { text: "Hard", color: "bg-error" };
};

const formatNutrient = (
  value: number | undefined,
  unit: string = ""
): string => {
  if (value === undefined || value === 0) return `-${unit}`;
  if (value < 1 && value > 0) {
    return `${value.toFixed(1)}${unit}`;
  }
  return `${Math.round(value)}${unit}`;
};

const getRecipeImageUrl = (
  recipeId: number,
  imageType: string = "jpg"
): string => {
  return `https://img.spoonacular.com/recipes/${recipeId}-312x231.${imageType}`;
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-error";
};

const NutritionDisplay = ({
  nutrients,
  servingSize,
  servingUnit,
}: {
  nutrients: MealNutrition;
  servingSize: number;
  servingUnit: string;
}) => {
  if (!nutrients || nutrients.calories <= 0) {
    return (
      <div className="text-center text-text-low p-4">
        No detailed nutrition data available.
      </div>
    );
  }

  // Calculate calories from macros for verification
  const calculatedCalories =
    nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9;
  const calorieDiscrepancy = Math.abs(nutrients.calories - calculatedCalories);

  const totalMacroCalories =
    (nutrients.protein + nutrients.carbs) * 4 + nutrients.fat * 9;

  const macroNutrients = [
    {
      name: "Calories",
      value: nutrients.calories,
      unit: "kcal",
      icon: Flame,
      color: "text-red-500",
    },
    {
      name: "Protein",
      value: nutrients.protein,
      unit: "g",
      icon: Beef,
      color: "text-blue-500",
    },
    {
      name: "Carbs",
      value: nutrients.carbs,
      unit: "g",
      icon: Wheat,
      color: "text-yellow-500",
    },
    {
      name: "Fat",
      value: nutrients.fat,
      unit: "g",
      icon: Drumstick,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-md font-semibold text-text-high">
          Nutrition per {servingSize} {servingUnit}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {macroNutrients.map((macro) => {
          const Icon = macro.icon;
          return (
            <div
              key={macro.name}
              className="bg-background-625 border border-background-500 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${macro.color}`} />
                <span className="text-sm font-medium text-text-high">
                  {macro.name}
                </span>
              </div>
              <div className="text-xl font-bold text-text-high">
                {formatNutrient(macro.value, "")}
                <span className="text-sm font-normal text-text-low ml-1">
                  {macro.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {calorieDiscrepancy > 50 && (
        <div className="text-xs text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} />
          Nutritional data may be incomplete - calorie calculation doesn&apos;t
          match macros.
        </div>
      )}

      {totalMacroCalories > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-text-high">
            Calories by Macro
          </div>
          <div className="flex rounded-lg overflow-hidden h-4">
            <div
              className="bg-blue-500"
              style={{
                width: `${
                  ((nutrients.protein * 4) / totalMacroCalories) * 100
                }%`,
              }}
              title={`Protein: ${Math.round(
                ((nutrients.protein * 4) / totalMacroCalories) * 100
              )}%`}
            />
            <div
              className="bg-yellow-500"
              style={{
                width: `${((nutrients.carbs * 4) / totalMacroCalories) * 100}%`,
              }}
              title={`Carbs: ${Math.round(
                ((nutrients.carbs * 4) / totalMacroCalories) * 100
              )}%`}
            />
            <div
              className="bg-green-500"
              style={{
                width: `${((nutrients.fat * 9) / totalMacroCalories) * 100}%`,
              }}
              title={`Fat: ${Math.round(
                ((nutrients.fat * 9) / totalMacroCalories) * 100
              )}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function LoggedMealCard({
  mealLog,
  onActionComplete,
}: {
  mealLog: MealLog;
  onActionComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    title: mealLog.title,
    servings: mealLog.servings,
    mealType: mealLog.mealType,
  });

  const canEditOrDelete = useMemo(() => {
    const logDate = new Date(mealLog.date + "T00:00:00");
    return isToday(logDate);
  }, [mealLog.date]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumeric = name === "servings";
    setEditableData((prev) => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) : value,
    }));
  };

  const extractNutritionFromRecipe = useCallback(
    (servings: number): MealNutrition => {
      const nutrition: MealNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      };

      if (!mealLog.spoonacularData.nutrition?.nutrients) return nutrition;

      const baseServings =
        mealLog.spoonacularData.servings > 0
          ? mealLog.spoonacularData.servings
          : 1;
      const findNutrient = (name: string) => {
        const nutrient = mealLog.spoonacularData.nutrition?.nutrients.find(
          (n) => n.name.toLowerCase() === name.toLowerCase()
        );
        return nutrient ? (nutrient.amount / baseServings) * servings : 0;
      };

      return {
        calories: findNutrient("calories"),
        protein: findNutrient("protein"),
        carbs: findNutrient("carbohydrates"),
        fat: findNutrient("fat"),
        fiber: findNutrient("fiber"),
        sugar: findNutrient("sugar"),
        sodium: findNutrient("sodium"),
      };
    },
    [mealLog.spoonacularData]
  );

  const currentNutrition = useMemo((): MealNutrition => {
    return extractNutritionFromRecipe(editableData.servings);
  }, [editableData.servings, extractNutritionFromRecipe]);

  const handleUpdate = () => {
    if (!canEditOrDelete) return;

    startTransition(async () => {
      const result = await updateMealLog(mealLog.id, {
        title: editableData.title,
        servings: editableData.servings,
        mealType: editableData.mealType,
      });

      if (result.success) {
        customToast("Success", "Meal updated successfully!");
        setIsEditing(false);
        onActionComplete();
      } else {
        customToast("Error", result.error || "Failed to update meal.");
      }
    });
  };

  const handleDelete = () => {
    if (!canEditOrDelete) return;
    if (confirm("Are you sure you want to delete this meal log?")) {
      startTransition(async () => {
        const result = await deleteMealLog(mealLog.id);
        if (result.success) {
          customToast("Success", "Meal deleted.");
          onActionComplete();
        } else {
          customToast("Error", result.error || "Failed to delete meal.");
        }
      });
    }
  };

  const difficultyBadge = getDifficultyBadge(
    mealLog.spoonacularData.readyInMinutes
  );

  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-4 space-y-4">
      {/* Header with Title and Image */}
      <div className="flex gap-4 items-start">
        <Image
          src={getRecipeImageUrl(
            mealLog.spoonacularData.id,
            mealLog.spoonacularData.imageType
          )}
          alt={mealLog.title}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
        <div className="flex-1">
          {isEditing ? (
            <Input
              type="text"
              name="title"
              value={editableData.title}
              onChange={handleInputChange}
              className="text-lg font-bold"
            />
          ) : (
            <h2 className="text-xl font-bold text-text-high">
              {mealLog.title}
            </h2>
          )}
          <div className="flex items-center gap-4 text-sm text-text-low mt-1">
            <span className="capitalize px-2 py-1 bg-primary-500 text-white rounded-md text-xs font-medium">
              {mealLog.mealType}
            </span>
            {mealLog.spoonacularData.readyInMinutes && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {mealLog.spoonacularData.readyInMinutes} min
              </span>
            )}
            <Button variant="tag" className={difficultyBadge.color}>
              {difficultyBadge.text}
            </Button>
            <span className="flex items-center gap-1">
              <Utensils size={14} /> {mealLog.servings} servings
            </span>
            {mealLog.spoonacularData.healthScore && (
              <span
                className={`font-semibold ${getHealthScoreColor(
                  mealLog.spoonacularData.healthScore
                )}`}
              >
                Score: {mealLog.spoonacularData.healthScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editing Form */}
      {isEditing && (
        <div className="p-4 bg-background-625 rounded-lg border border-background-500 space-y-3">
          <h3 className="font-semibold text-text-high">Edit Meal Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-high mb-1">
                Title
              </label>
              <Input
                type="text"
                name="title"
                value={editableData.title}
                onChange={handleInputChange}
                placeholder="Meal title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Servings
                </label>
                <Input
                  type="number"
                  name="servings"
                  value={editableData.servings}
                  onChange={handleInputChange}
                  min={0.1}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Meal Type
                </label>
                <select
                  name="mealType"
                  value={editableData.mealType}
                  onChange={handleInputChange}
                  className="w-full capitalize px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                >
                  {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                    <option key={type} value={type as MealType}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <NutritionDisplay
        nutrients={currentNutrition}
        servingSize={
          mealLog.spoonacularData.nutrition?.weightPerServing?.amount || 1
        }
        servingUnit={
          mealLog.spoonacularData.nutrition?.weightPerServing?.unit || "serving"
        }
      />

      <div className="flex gap-2 justify-end pt-4 border-t border-background-500">
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditableData({
                  title: mealLog.title,
                  servings: mealLog.servings,
                  mealType: mealLog.mealType,
                });
              }}
              disabled={isPending}
            >
              <X size={16} /> Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              <Save size={16} /> {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isPending || !canEditOrDelete}
              title={!canEditOrDelete ? "Can only delete meals from today" : ""}
            >
              <Trash2 size={16} /> Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              disabled={isPending || !canEditOrDelete}
              title={!canEditOrDelete ? "Can only edit meals from today" : ""}
            >
              <Edit size={16} /> Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
