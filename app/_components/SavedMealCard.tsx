"use client";

import { Leaf, Droplets, FlaskConical } from "lucide-react";
import { NutrientLevels, NutrientLevel, MealNutrition } from "../_types/types";

// Nutri-Score colors
const nutriScoreColors: Record<string, string> = {
  a: "bg-[#038141] text-white",
  b: "bg-[#85bb2f] text-white",
  c: "bg-[#fecb02] text-gray-800",
  d: "bg-[#ee8100] text-white",
  e: "bg-[#e63e11] text-white",
};

// NOVA group colors and descriptions
const novaConfig: Record<number, { color: string; label: string }> = {
  1: { color: "bg-emerald-500 text-white", label: "Unprocessed" },
  2: { color: "bg-yellow-400 text-gray-800", label: "Processed culinary" },
  3: { color: "bg-orange-400 text-white", label: "Processed" },
  4: { color: "bg-red-500 text-white", label: "Ultra-processed" },
};

// Nutrient level colors
const nutrientLevelColors: Record<NutrientLevel, string> = {
  low: "text-emerald-400",
  moderate: "text-yellow-400",
  high: "text-red-400",
};

export interface SavedMealCardData {
  id: string;
  name: string;
  producer?: string;
  nutrientsPer100g: MealNutrition;
  nutriScore?: "a" | "b" | "c" | "d" | "e";
  novaGroup?: 1 | 2 | 3 | 4;
  isVegan?: boolean;
  isVegetarian?: boolean;
  palmOilFree?: boolean;
  nutrientLevels?: NutrientLevels;
  ingredients?: string[];
}

interface SavedMealCardProps {
  meal: SavedMealCardData;
  isSelected?: boolean;
  onClick?: () => void;
  showExpandedDetails?: boolean;
}

export default function SavedMealCard({
  meal,
  isSelected = false,
  onClick,
  showExpandedDetails = false,
}: SavedMealCardProps) {
  const { nutrientsPer100g } = meal;

  return (
    <div className="space-y-0">
      <div
        onClick={onClick}
        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-primary-500 bg-primary-500/10 rounded-b-none"
            : "border-divider bg-background-700 hover:border-primary-400"
        }`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-text-low truncate">
              {meal.name}
            </h4>
            {meal.producer && (
              <p className="text-sm text-text-gray truncate">{meal.producer}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-text-low font-semibold">
              {nutrientsPer100g.calories}{" "}
              <span className="text-xs font-normal">kcal</span>
            </div>
            <div className="text-xs text-text-gray">per 100g</div>
          </div>
        </div>

        {(meal.nutriScore || meal.novaGroup) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {meal.nutriScore && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  nutriScoreColors[meal.nutriScore]
                }`}
              >
                Nutri-Score {meal.nutriScore}
              </span>
            )}
            {meal.novaGroup && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  novaConfig[meal.novaGroup].color
                }`}
              >
                NOVA {meal.novaGroup} – {novaConfig[meal.novaGroup].label}
              </span>
            )}
          </div>
        )}

        {/* Macros Row */}
        <div className="flex gap-4 mt-3 text-xs text-text-gray">
          <span>
            <span className="text-yellow-400">C:</span>{" "}
            {Math.round(nutrientsPer100g.carbs)}g
          </span>
          <span>
            <span className="text-blue-400">P:</span>{" "}
            {Math.round(nutrientsPer100g.protein)}g
          </span>
          <span>
            <span className="text-green-400">F:</span>{" "}
            {Math.round(nutrientsPer100g.fat)}g
          </span>
        </div>
      </div>

      {/* Expanded Details (shown below the card when selected) */}
      {isSelected && showExpandedDetails && (
        <div className="border border-t-0 border-primary-500 bg-background-700/50 rounded-b-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <h5 className="text-sm font-semibold text-text-low mb-2 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary-400" />
              Nutrition Facts (per 100g)
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-gray">Calories</span>
                <span className="text-text-low">
                  {nutrientsPer100g.calories} kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-gray">Protein</span>
                <span className="text-text-low">
                  {nutrientsPer100g.protein}g
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-gray">Carbs</span>
                <span className="text-text-low">{nutrientsPer100g.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-gray">Fat</span>
                <span className="text-text-low">{nutrientsPer100g.fat}g</span>
              </div>
              {nutrientsPer100g.fiber !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-gray">Fiber</span>
                  <span className="text-text-low">
                    {nutrientsPer100g.fiber}g
                  </span>
                </div>
              )}
              {nutrientsPer100g.sugar !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-gray">Sugar</span>
                  <span className="text-text-low">
                    {nutrientsPer100g.sugar}g
                  </span>
                </div>
              )}
              {nutrientsPer100g.sodium !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-gray">Sodium</span>
                  <span className="text-text-low">
                    {nutrientsPer100g.sodium}mg
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Nutrient Levels */}
          {meal.nutrientLevels &&
            Object.keys(meal.nutrientLevels).length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-text-low mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary-400" />
                  Nutrient Levels
                </h5>
                <div className="space-y-1 text-sm">
                  {meal.nutrientLevels.fat && (
                    <p
                      className={
                        nutrientLevelColors[meal.nutrientLevels.fat.level]
                      }
                    >
                      Fat in {meal.nutrientLevels.fat.level} quantity (
                      {meal.nutrientLevels.fat.per100g}%)
                    </p>
                  )}
                  {meal.nutrientLevels.saturatedFat && (
                    <p
                      className={
                        nutrientLevelColors[
                          meal.nutrientLevels.saturatedFat.level
                        ]
                      }
                    >
                      Saturated fat in {meal.nutrientLevels.saturatedFat.level}{" "}
                      quantity ({meal.nutrientLevels.saturatedFat.per100g}%)
                    </p>
                  )}
                  {meal.nutrientLevels.sugars && (
                    <p
                      className={
                        nutrientLevelColors[meal.nutrientLevels.sugars.level]
                      }
                    >
                      Sugars in {meal.nutrientLevels.sugars.level} quantity (
                      {meal.nutrientLevels.sugars.per100g}%)
                    </p>
                  )}
                  {meal.nutrientLevels.salt && (
                    <p
                      className={
                        nutrientLevelColors[meal.nutrientLevels.salt.level]
                      }
                    >
                      Salt in {meal.nutrientLevels.salt.level} quantity (
                      {meal.nutrientLevels.salt.per100g}%)
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-text-low mb-2">
                Ingredients
              </h5>
              <p className="text-sm text-text-gray leading-relaxed">
                {meal.ingredients.join(", ")}
              </p>
            </div>
          )}

          {/* Ingredient Analysis */}
          {meal.isVegan !== undefined ||
            (meal.isVegetarian !== undefined && (
              <div>
                <h5 className="text-sm font-semibold text-text-low mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary-400" />
                  Ingredient Analysis
                </h5>
                <div className="flex flex-wrap gap-2">
                  {meal.isVegan && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Vegan
                    </span>
                  )}
                  {meal.isVegetarian && !meal.isVegan && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Vegetarian
                    </span>
                  )}
                  {meal.isVegan === false && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-900/50 text-orange-400">
                      Non-vegan
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
