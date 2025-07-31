"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  SpoonacularRecipeInfo,
  MealNutrition,
  MealType,
  MealLog,
} from "@/app/_types/spoonacularTypes";
import { createMealLog } from "@/app/_lib/spoonacularActions";
import { customToast } from "@/app/_utils/toasts";
import Button from "./reusable/Button";
import Input from "./reusable/Input";
import {
  Utensils,
  Clock,
  Plus,
  AlertTriangle,
  Flame,
  Beef,
  Wheat,
  Drumstick,
  DollarSign,
  Heart,
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

const DietaryBadges = ({ recipe }: { recipe: SpoonacularRecipeInfo }) => {
  const badges = [];

  if (recipe.vegetarian)
    badges.push({ text: "Vegetarian", color: "bg-green-600" });
  if (recipe.vegan) badges.push({ text: "Vegan", color: "bg-green-700" });
  if (recipe.glutenFree)
    badges.push({ text: "Gluten Free", color: "bg-blue-600" });
  if (recipe.dairyFree)
    badges.push({ text: "Dairy Free", color: "bg-purple-600" });
  if (recipe.ketogenic) badges.push({ text: "Keto", color: "bg-red-600" });
  if (recipe.veryHealthy)
    badges.push({ text: "Very Healthy", color: "bg-success" });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge) => (
        <span
          key={badge.text}
          className={`px-2 py-1 text-xs font-medium text-white rounded-md ${badge.color}`}
        >
          {badge.text}
        </span>
      ))}
    </div>
  );
};

export default function SpoonacularMealCard({
  recipe,
  onActionComplete,
}: {
  recipe: SpoonacularRecipeInfo;
  onActionComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedData, setSelectedData] = useState({
    mealType: "lunch" as MealLog["mealType"],
    servings: 1,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumeric = name === "servings";
    setSelectedData((prev) => ({
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
        potassium: 0,
        calcium: 0,
        zinc: 0,
        magnesium: 0,
        omega3: 0,
        omega6: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminA: 0,
      };

      if (!recipe.nutrition?.nutrients) return nutrition;

      const baseServings = recipe.servings > 0 ? recipe.servings : 1;
      const findNutrient = (name: string) => {
        const nutrient = recipe.nutrition?.nutrients.find(
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
        potassium: findNutrient("potassium"),
        calcium: findNutrient("calcium"),
        zinc: findNutrient("zinc"),
        magnesium: findNutrient("magnesium"),
        omega3: findNutrient("omega 3"),
        omega6: findNutrient("omega 6"),
        vitaminC: findNutrient("vitamin c"),
        vitaminD: findNutrient("vitamin d"),
        vitaminA: findNutrient("vitamin a"),
      };
    },
    [recipe]
  );

  const currentNutrition = useMemo((): MealNutrition => {
    return extractNutritionFromRecipe(selectedData.servings);
  }, [selectedData.servings, extractNutritionFromRecipe]);

  const handleLog = () => {
    startTransition(async () => {
      const result = await createMealLog(
        new Date().toISOString().split("T")[0],
        selectedData.mealType,
        selectedData.servings,
        recipe
      );
      if (result.success) {
        customToast("Success", "Meal logged successfully!");
        onActionComplete();
      } else {
        customToast("Error", result.error || "Failed to log meal.");
      }
    });
  };

  const difficultyBadge = getDifficultyBadge(recipe.readyInMinutes);

  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-4 space-y-4">
      {/* Header with Title and Image */}
      <div className="flex gap-4 items-start">
        <Image
          src={getRecipeImageUrl(recipe.id, recipe.imageType)}
          alt={recipe.title}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-high">{recipe.title}</h2>
          <div className="flex items-center gap-4 text-sm text-text-low mt-1 flex-wrap">
            {recipe.readyInMinutes && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {recipe.readyInMinutes} min
              </span>
            )}
            <Button variant="tag" className={difficultyBadge.color}>
              {difficultyBadge.text}
            </Button>
            <span className="flex items-center gap-1">
              <Utensils size={14} /> {recipe.servings} servings
            </span>
            {recipe.healthScore > 0 && (
              <span className="flex items-center gap-1">
                <Heart size={14} />
                <span
                  className={`font-semibold ${getHealthScoreColor(
                    recipe.healthScore
                  )}`}
                >
                  {recipe.healthScore}
                </span>
              </span>
            )}
            {recipe.pricePerServing > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                <span className="text-text-medium">
                  ${(recipe.pricePerServing / 100).toFixed(2)}/serving
                </span>
              </span>
            )}
          </div>

          <DietaryBadges recipe={recipe} />
        </div>
      </div>

      {/* Cuisines and Dish Types */}
      {(recipe.cuisines.length > 0 || recipe.dishTypes.length > 0) && (
        <div className="space-y-2">
          {recipe.cuisines.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-high font-medium">Cuisines:</span>
              <div className="flex flex-wrap gap-1">
                {recipe.cuisines.slice(0, 3).map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-2 py-1 bg-primary-600 text-white text-xs rounded-md capitalize"
                  >
                    {cuisine}
                  </span>
                ))}
                {recipe.cuisines.length > 3 && (
                  <span className="text-text-low text-xs">
                    +{recipe.cuisines.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          {recipe.dishTypes.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-high font-medium">Types:</span>
              <div className="flex flex-wrap gap-1">
                {recipe.dishTypes.slice(0, 3).map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-background-500 text-text-high text-xs rounded-md capitalize"
                  >
                    {type}
                  </span>
                ))}
                {recipe.dishTypes.length > 3 && (
                  <span className="text-text-low text-xs">
                    +{recipe.dishTypes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <NutritionDisplay
        nutrients={currentNutrition}
        servingSize={recipe.nutrition?.weightPerServing?.amount || 1}
        servingUnit={recipe.nutrition?.weightPerServing?.unit || "serving"}
      />

      {/* Logging Controls */}
      <div className="space-y-4 pt-4 border-t border-background-500">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-high mb-1">
              Meal Type
            </label>
            <select
              name="mealType"
              value={selectedData.mealType}
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
              Servings
            </label>
            <Input
              name="servings"
              type="number"
              value={selectedData.servings}
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
    </div>
  );
}
