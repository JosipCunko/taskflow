"use client";

import React, { useState, useTransition, useMemo } from "react";
import { updateLoggedMeal, deleteLoggedMeal } from "@/app/_lib/healthActions";
import { customToast } from "@/app/_utils/toasts";
import Button from "./reusable/Button";
import Input from "./reusable/Input";
import { Trash2, Edit, Save, X, Utensils, AlertTriangle } from "lucide-react";
import { isToday } from "date-fns";
import { LoggedMeal, MealNutrition } from "../_types/types";
import { Tooltip } from "react-tooltip";
import { generateNutrients, mealTypes } from "../_utils/utils";

export default function LoggedMealCard({
  loggedMeal,
  onActionComplete,
}: {
  loggedMeal: LoggedMeal;
  onActionComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name: loggedMeal.name,
    servingsSize: loggedMeal.servingSize,
    mealType: loggedMeal.mealType,
  });

  const canEditOrDelete = useMemo(() => {
    return isToday(loggedMeal.loggedAt);
  }, [loggedMeal.loggedAt]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({
      ...prev,
      [name]: name === "servingsSize" ? parseFloat(value) : value,
    }));
  };

  const handleUpdate = () => {
    if (!canEditOrDelete) return;
    setIsEditing(false);
    startTransition(async () => {
      try {
        await updateLoggedMeal(loggedMeal.id, {
          name: editableData.name,
          servingSize: editableData.servingsSize,
          mealType: editableData.mealType,
        });

        customToast("Success", "Meal updated successfully!");
        onActionComplete();
      } catch (error) {
        console.error(error);
        customToast("Error", "Failed to update meal.");
      } finally {
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    if (!canEditOrDelete) return;
    startTransition(async () => {
      try {
        await deleteLoggedMeal(loggedMeal.id);
        customToast("Success", "Meal deleted.");
        onActionComplete();
      } catch (error) {
        console.error(error);
        customToast("Error", "Failed to delete meal.");
      }
    });
  };

  return (
    <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-4 space-y-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          {isEditing ? (
            <Input
              type="text"
              name="title"
              value={editableData.name}
              onChange={handleInputChange}
              className="text-lg font-bold"
            />
          ) : (
            <h2 className="text-xl font-bold text-text-low">
              {loggedMeal.name}
            </h2>
          )}
          <div className="flex items-center gap-4 text-sm text-text-low mt-1">
            <span className="capitalize px-2 py-1 bg-primary-500 text-white rounded-md text-xs font-medium">
              {loggedMeal.mealType}
            </span>
            <span className="flex items-center gap-1">
              <Utensils size={14} /> {loggedMeal.servingSize} g
            </span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="p-4 bg-background-625 rounded-lg border border-background-500 space-y-3">
          <h3 className="font-semibold text-text-low">Edit Meal Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-low mb-1">
                Title
              </label>
              <Input
                type="text"
                name="title"
                value={editableData.name}
                onChange={handleInputChange}
                placeholder="Meal title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-low mb-1">
                  Servings Size
                </label>
                <Input
                  type="number"
                  name="servingsSize"
                  value={editableData.servingsSize}
                  onChange={handleInputChange}
                  min={0.1}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-low mb-1">
                  Meal Type
                </label>
                <select
                  name="mealType"
                  value={editableData.mealType}
                  onChange={handleInputChange}
                  className="w-full capitalize px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-low focus:ring-primary-500"
                >
                  {mealTypes.map((type: LoggedMeal["mealType"]) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <NutritionDisplay nutrients={loggedMeal.calculatedNutrients} />

      <div className="flex gap-2 justify-end pt-4 border-t border-background-500">
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditableData({
                  name: loggedMeal.name,
                  servingsSize: loggedMeal.servingSize,
                  mealType: loggedMeal.mealType,
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
          <div className="tooltip-container flex justify-end gap-2 items-center">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!canEditOrDelete}
              data-tooltip-content={
                !canEditOrDelete ? "Can only delete meals from today" : ""
              }
              data-tooltip-id="delete-tooltip"
            >
              <Trash2 size={16} /> Delete
            </Button>
            <Tooltip
              id="delete-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              disabled={!canEditOrDelete}
              data-tooltip-content={
                !canEditOrDelete ? "Can only edit meals from today" : ""
              }
              data-tooltip-id="edit-tooltip"
            >
              <Edit size={16} /> Edit
            </Button>
            <Tooltip
              id="edit-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const NutritionDisplay = ({ nutrients }: { nutrients: MealNutrition }) => {
  if (!nutrients || nutrients.calories <= 0) {
    return (
      <div className="text-center text-text-low p-4">
        No detailed nutrition data available.
      </div>
    );
  }
  const calculatedCalories =
    nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9;
  const calorieDiscrepancy = Math.abs(nutrients.calories - calculatedCalories);
  const totalMacroCalories =
    (nutrients.protein + nutrients.carbs) * 4 + nutrients.fat * 9;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {generateNutrients(nutrients).map((macro) => {
          const Icon = macro.icon;
          return (
            <div
              key={macro.label}
              className="bg-background-625 border border-background-500 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${macro.color}`} />
                <span className="text-sm font-medium text-text-low">
                  {macro.label}
                </span>
              </div>
              <div className="text-xl font-bold text-text-low">
                {macro.current}
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
          <div className="text-sm font-medium text-text-low">
            Calories by Macro
          </div>
          <div className="flex rounded-lg overflow-hidden h-4 tooltip-container">
            <div
              className="bg-blue-500"
              style={{
                width: `${
                  ((nutrients.protein * 4) / totalMacroCalories) * 100
                }%`,
              }}
              data-tooltip-content={`Protein: ${Math.round(
                ((nutrients.protein * 4) / totalMacroCalories) * 100
              )}%`}
              data-tooltip-id="protein-tooltip"
            />
            <Tooltip
              id="protein-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
            <div
              className="bg-yellow-500"
              style={{
                width: `${((nutrients.carbs * 4) / totalMacroCalories) * 100}%`,
              }}
              data-tooltip-content={`Carbs: ${Math.round(
                ((nutrients.carbs * 4) / totalMacroCalories) * 100
              )}%`}
              data-tooltip-id="carbs-tooltip"
            />
            <Tooltip
              id="carbs-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
            <div
              className="bg-green-500"
              style={{
                width: `${((nutrients.fat * 9) / totalMacroCalories) * 100}%`,
              }}
              data-tooltip-content={`Fat: ${Math.round(
                ((nutrients.fat * 9) / totalMacroCalories) * 100
              )}%`}
              data-tooltip-id="fat-tooltip"
            />
            <Tooltip
              id="fat-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
          </div>
        </div>
      )}
    </div>
  );
};
