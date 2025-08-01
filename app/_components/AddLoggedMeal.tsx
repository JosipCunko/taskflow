"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { createLoggedMeal } from "@/app/_lib/healthActions";
import { BookOpen, Plus, Calculator, Utensils } from "lucide-react";
import Input from "./reusable/Input";
import Button from "./reusable/Button";
import { LoggedMeal } from "../_types/types";
import { customToast } from "../_utils/toasts";
import Loader from "./Loader";
import { clientCache } from "../_utils/clientCache";
import { mealTypes } from "../_utils/utils";

interface SavedMeal {
  id: string;
  name: string;
  description?: string;
  producer?: string;
  nutrientsPer100g: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  ingredients: string[];
}

export default function AddLoggedMeal({
  onCloseModal,
}: {
  onCloseModal?: () => void;
}) {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<SavedMeal | null>(null);
  const [servingSize, setServingSize] = useState<number>(100);
  const [mealType, setMealType] = useState<LoggedMeal["mealType"]>("breakfast");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const { cache, invalidateCache } = useMemo(() => {
    return clientCache(
      "savedMeals",
      5,
      "/api/health/savedMeals",
      setSavedMeals,
      [] as SavedMeal[],
      setIsLoading,
      (message) => customToast("Error", message)
    );
  }, []);

  useEffect(() => {
    cache();
  }, [cache]);

  // Calculate nutrients based on serving size
  const calculateNutrients = (meal: SavedMeal, serving: number) => {
    const multiplier = serving / 100;
    return {
      calories: Math.round(meal.nutrientsPer100g.calories * multiplier),
      carbs: Math.round(meal.nutrientsPer100g.carbs * multiplier * 10) / 10,
      protein: Math.round(meal.nutrientsPer100g.protein * multiplier * 10) / 10,
      fat: Math.round(meal.nutrientsPer100g.fat * multiplier * 10) / 10,
    };
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedMeal) {
      customToast("Error", "Please select a meal");
      return;
    }

    startTransition(async () => {
      formData.set("savedMealId", selectedMeal.id);
      formData.set("servingSize", servingSize.toString());
      formData.set("mealType", mealType);

      const result = await createLoggedMeal(formData);

      if (result.success) {
        customToast("Success", result.message || "Meal logged successfully");
        setSelectedMeal(null);
        setServingSize(100);
        invalidateCache();
      } else {
        customToast("Error", result.error || "Failed to log meal");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="modal-bigger relative">
        <Loader label="Loading saved meals..." />
      </div>
    );
  }

  return (
    <div className="modal-bigger">
      <div className="bg-background-600 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 to-primary-800 p-6">
          <div className="flex items-center gap-3">
            <Plus className="w-4 aspect-square text-text-low" />
            <div className="text-text-low">
              <h2 className="text-xl font-bold">Log a Meal</h2>
              <p>Track your food intake</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 relative">
          {savedMeals.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-text-gray mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-low mb-2">
                No Saved Meals
              </h3>
              <p className="text-text-gray">
                Save some meals first to start logging your intake
              </p>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-low border-b border-divider pb-2">
                  Select Meal
                </h3>

                <div className="grid gap-3">
                  {savedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() =>
                        setSelectedMeal((sm) =>
                          sm?.id === meal.id ? null : meal
                        )
                      }
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedMeal?.id === meal.id
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-divider bg-background-700 hover:border-primary-400"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-low">
                            {meal.name}
                          </h4>
                          {meal.producer && (
                            <p className="text-sm text-text-gray">
                              {meal.producer}
                            </p>
                          )}
                          {meal.description && (
                            <p className="text-sm text-text-gray mt-1">
                              {meal.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-text-low font-medium">
                            {meal.nutrientsPer100g.calories} cal
                          </div>
                          <div className="text-text-gray">per 100g</div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3 text-xs text-text-gray">
                        <span>C: {meal.nutrientsPer100g.carbs}g</span>
                        <span>P: {meal.nutrientsPer100g.protein}g</span>
                        <span>F: {meal.nutrientsPer100g.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeal && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-low border-b border-divider pb-2">
                    Serving Size
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="servingSize"
                        className="text-sm font-medium "
                      >
                        Amount (grams)
                      </label>
                      <Input
                        name="servingSize"
                        type="number"
                        value={servingSize}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setServingSize(
                            Math.min(parseFloat(e.target.value) || 0, 9999)
                          )
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-text-low flex items-center gap-2">
                        <Calculator className="w-4 aspect-square" />
                        Calculated Nutrients
                      </h4>

                      <div className="bg-background-700 rounded-lg p-4 space-y-2">
                        {(() => {
                          const nutrients = calculateNutrients(
                            selectedMeal,
                            servingSize
                          );
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-text-gray text-sm">
                                  Calories:
                                </span>
                                <span className="text-text-low font-semibold">
                                  {nutrients.calories} cal
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-text-gray text-sm">
                                  Carbs:
                                </span>
                                <span className="text-text-low">
                                  {nutrients.carbs}g
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-text-gray text-sm">
                                  Protein:
                                </span>
                                <span className="text-text-low">
                                  {nutrients.protein}g
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-text-gray text-sm">
                                  Fat:
                                </span>
                                <span className="text-text-low">
                                  {nutrients.fat}g
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMeal && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-low border-b border-divider pb-2">
                    Meal Type
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mealTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          mealType === type
                            ? "border-primary-500 bg-primary-500/10 text-primary-500"
                            : "border-divider bg-background-700 text-text-gray hover:border-primary-300 hover:text-primary-300"
                        }`}
                      >
                        <span className="text-sm font-medium capitalize">
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeal && (
                // padding of the parent box
                <div className="absolute bottom-6 right-6 flex justify-end w-full">
                  <Button
                    type="submit"
                    disabled={isPending || servingSize <= 0 || !mealType}
                  >
                    <Utensils className="w-4 aspect-square" />
                    {isPending ? "Logging Meal..." : "Log Meal"}
                  </Button>
                </div>
              )}
            </form>
          )}

          <Button
            variant="secondary"
            onClick={onCloseModal}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
