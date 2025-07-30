"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  SpoonacularRecipeInfo,
  MealLog,
  MealNutrition,
  MealType,
} from "@/app/_types/spoonacularTypes";
import {
  createMealLog,
  updateMealLog,
  deleteMealLog,
} from "@/app/_lib/spoonacularActions";
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
  Plus,
  AlertTriangle,
  Flame,
  Beef,
  Wheat,
  Drumstick,
} from "lucide-react";

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
              title={`Protein: ${
                ((nutrients.protein * 4) / totalMacroCalories) * 100
              }%`}
            />
            <div
              className="bg-yellow-500"
              style={{
                width: `${((nutrients.carbs * 4) / totalMacroCalories) * 100}%`,
              }}
              title={`Carbs: ${
                ((nutrients.carbs * 4) / totalMacroCalories) * 100
              }%`}
            />
            <div
              className="bg-green-500"
              style={{
                width: `${((nutrients.fat * 9) / totalMacroCalories) * 100}%`,
              }}
              title={`Fat: ${
                ((nutrients.fat * 9) / totalMacroCalories) * 100
              }%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- MEAL CARD (Main Component) ---

interface MealCardProps {
  data: SpoonacularRecipeInfo | MealLog;
  onActionComplete: () => void; // Callback to refresh parent data
}

export default function MealCard({ data, onActionComplete }: MealCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const isLoggedMeal = "loggedAt" in data;

  const {
    title,
    id,
    imageType,
    servings: baseServings,
    readyInMinutes,
    healthScore,
  } = useMemo(() => {
    if (isLoggedMeal) {
      return {
        ...data.spoonacularData, // Use original recipe data for base info
        id: data.spoonacularId, // Use spoonacular ID for image
        title: data.title, // Use logged title
      };
    }
    return data;
  }, [data, isLoggedMeal]);

  const [editableData, setEditableData] = useState({
    title: title,
    servings: isLoggedMeal ? (data as MealLog).servings : 1,
    servingSize: isLoggedMeal ? (data as MealLog).servingSize : 1,
    servingUnit: isLoggedMeal ? (data as MealLog).servingUnit : "serving",
    mealType: isLoggedMeal ? (data as MealLog).mealType : "breakfast",
  });

  const canEditOrDelete = useMemo(() => {
    if (!isLoggedMeal) return false;
    const logDate = new Date((data as MealLog).date + "T00:00:00"); // Prevent timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  }, [data, isLoggedMeal]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumeric = ["servings", "servingSize"].includes(name);
    setEditableData((prev) => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) : value,
    }));
  };

  const extractNutritionFromRecipe = useCallback(
    (recipe: SpoonacularRecipeInfo, servings: number): MealNutrition => {
      const nutrition: MealNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      };
      if (!recipe.nutrition?.nutrients) return nutrition;

      const baseServings = recipe.servings > 0 ? recipe.servings : 1;
      const findNutrient = (name: string) => {
        const nutrient = recipe?.nutrition?.nutrients.find(
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
    []
  );

  const currentNutrition = useMemo((): MealNutrition => {
    const baseRecipe = isLoggedMeal
      ? (data as MealLog).spoonacularData
      : (data as SpoonacularRecipeInfo);
    return extractNutritionFromRecipe(baseRecipe, editableData.servings);
  }, [isLoggedMeal, data, editableData.servings, extractNutritionFromRecipe]);

  const handleLog = () => {
    if (isLoggedMeal) return;
    const recipeInfo = data as SpoonacularRecipeInfo;

    startTransition(async () => {
      const result = await createMealLog(
        new Date().toISOString().split("T")[0],
        editableData.mealType,
        editableData.servings,
        editableData.servingSize,
        editableData.servingUnit,
        recipeInfo
      );
      if (result.success) {
        customToast("Success", "Meal logged successfully!");
        onActionComplete();
      } else {
        customToast("Error", result.error || "Failed to log meal.");
      }
    });
  };

  const handleUpdate = () => {
    if (!isLoggedMeal || !canEditOrDelete) return;

    // Note: To make the title editable as requested, the `updateMealLog` server action
    // would need to be modified to accept a `title` property in its `updates` payload.
    // The current implementation only updates fields supported by the existing action.
    startTransition(async () => {
      const result = await updateMealLog((data as MealLog).id, {
        servings: editableData.servings,
        servingSize: editableData.servingSize,
        servingUnit: editableData.servingUnit,
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
    if (!isLoggedMeal || !canEditOrDelete) return;
    if (confirm("Are you sure you want to delete this meal log?")) {
      startTransition(async () => {
        const result = await deleteMealLog((data as MealLog).id);
        if (result.success) {
          customToast("Success", "Meal deleted.");
          onActionComplete();
        } else {
          customToast("Error", result.error || "Failed to delete meal.");
        }
      });
    }
  };

  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-4 space-y-4">
      {/* Header with Title and Image */}
      <div className="flex gap-4 items-start">
        <Image
          src={getRecipeImageUrl(id, imageType)}
          alt={title}
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
              // The server action must be updated to handle title changes for this to work.
              // For now, this is disabled to prevent confusion.
              disabled={true}
            />
          ) : (
            <h2 className="text-xl font-bold text-text-high">{title}</h2>
          )}
          <div className="flex items-center gap-4 text-sm text-text-low mt-1">
            {readyInMinutes && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {readyInMinutes} min
              </span>
            )}

            {baseServings && (
              <span className="flex items-center gap-1">
                <Utensils size={14} /> {baseServings} servings
              </span>
            )}
            {healthScore && (
              <span
                className={`font-semibold ${getHealthScoreColor(healthScore)}`}
              >
                Score: {healthScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editing Form */}
      {isEditing && (
        <div className="p-4 bg-background-625 rounded-lg border border-background-500 space-y-3">
          <h3 className="font-semibold text-text-high">Edit Meal Details</h3>
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
            <div>
              <label className="block text-sm font-medium text-text-high mb-1">
                Serving Size
              </label>
              <Input
                type="number"
                name="servingSize"
                value={editableData.servingSize}
                onChange={handleInputChange}
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-high mb-1">
                Serving Unit
              </label>
              <Input
                type="text"
                name="servingUnit"
                value={editableData.servingUnit}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}

      <NutritionDisplay
        nutrients={currentNutrition}
        servingSize={editableData.servings}
        servingUnit={editableData.servingUnit}
      />

      <div className="flex gap-2 justify-end pt-4 border-t border-background-500">
        {isLoggedMeal ? (
          isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
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
                title={
                  !canEditOrDelete ? "Can only delete meals from today" : ""
                }
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
          )
        ) : (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Meal Type
                </label>
                <select
                  name="mealType"
                  value={editableData.mealType}
                  onChange={handleInputChange}
                  className="w-full capitalize px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high"
                >
                  {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                    <option key={type} value={type as MealType}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Servings
                </label>
                <Input
                  name="servings"
                  type="number"
                  value={editableData.servings}
                  onChange={handleInputChange}
                  min={0.25}
                  step={0.25}
                />
              </div>
            </div>
            <Button onClick={handleLog} disabled={isPending} className="w-full">
              <Plus size={16} /> {isPending ? "Logging..." : "Log this Meal"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* 
 <ModalContext.Provider value={logModalContextValue}>
        <Modal.Window name="log-meal">
          <div className="p-4 max-w-lg w-full">
            {isPending ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
              </div>
            ) : state.selectedFoodDetails ? (
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {state.selectedFoodDetails.title}
                </h2>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={state.selectedFoodDetails.image}
                    alt={state.selectedFoodDetails.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-text-high mb-1">
                      Meal Type
                    </label>
                    <select
                      value={state.mealType}
                      onChange={(e) =>
                        dispatchField("mealType", e.target.value)
                      }
                      className="w-full capitalize px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                    >
                      {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-high mb-1">
                      Number of Servings
                    </label>
                    <Input
                      name="servings"
                      type="number"
                      value={state.servings}
                      min={0.25}
                      step={0.25}
                      onChange={(e) =>
                        dispatchField(
                          "servings",
                          parseFloat(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                </div>

                {state.selectedNutrientPreview && (
                  <div className="bg-background-625 border border-background-500 p-3 rounded-lg">
                    <h3 className="font-semibold mb-2 text-text-high">
                      Estimated Nutrition for {state.servings} serving(s):
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <p>
                        <strong className="text-accent-500">
                          {Math.round(state.selectedNutrientPreview.calories)}
                        </strong>{" "}
                        kcal
                      </p>
                      <p>
                        <strong className="text-blue-500">
                          {Math.round(state.selectedNutrientPreview.protein)}g
                        </strong>{" "}
                        Protein
                      </p>
                      <p>
                        <strong className="text-warning">
                          {Math.round(state.selectedNutrientPreview.carbs)}g
                        </strong>{" "}
                        Carbs
                      </p>
                      <p>
                        <strong className="text-green-500">
                          {Math.round(state.selectedNutrientPreview.fat)}g
                        </strong>{" "}
                        Fat
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="secondary" onClick={closeLogModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleLogMeal} disabled={isPending}>
                    {isPending ? "Logging..." : "Log Meal"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[300px] flex items-center justify-center text-text-low">
                Could not load recipe details.
              </div>
            )}
          </div>
        </Modal.Window>
      </ModalContext.Provider>


      const handleLogMeal = async () => {
    if (!state.selectedFood || !state.selectedFoodDetails)
      return customToast("Error", "Please select a food item");
    if (state.servings <= 0)
      return customToast("Error", "Servings must be greater than 0");
    startTransition(async () => {
      try {
        await createMealLog(
          state.currentDate.toISOString().split("T")[0],
          state.mealType,
          state.servings,
          state.servingSize,
          state.servingUnit,
          state.selectedFoodDetails!
        );
        customToast("Success", "Meal logged successfully!");
        closeLogModal();
        await loadDailyNutritionSummary();
      } catch (error) {
        console.error("Error logging meal:", error);
        customToast("Error", "Failed to log meal");
      }
    });
  };

  const [logModalOpenName, setLogModalOpenName] = useState<string>("");
  const openLogModal = (name: string) => setLogModalOpenName(name);
  const closeLogModal = () => {
    setLogModalOpenName("");
    dispatch({ type: "closeModalAndReset", payload: null });
  };
  const logModalContextValue = useMemo(
    () => ({
      openName: logModalOpenName,
      open: openLogModal,
      close: closeLogModal,
    }),
    [logModalOpenName]
  );
*/
