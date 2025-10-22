"use client";

import React, { useRef, useState, useTransition } from "react";
import Input from "./reusable/Input";
import { createSavedMeal } from "@/app/_lib/healthActions";
import { Plus, Save, Trash2, Utensils } from "lucide-react";
import Button from "./reusable/Button";
import { successToast, errorToast } from "../_utils/utils";

export default function AddSavedMeal({
  onCloseModal,
}: {
  onCloseModal?: () => void;
}) {
  const [ingredients, setIngredients] = useState([""]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const ingredientsString = ingredients
        .filter((ing) => ing.trim())
        .join(", ");
      formData.set("ingredients", ingredientsString);

      const result = await createSavedMeal(formData);

      if (result.success) {
        formRef.current?.reset();
        setIngredients([""]);
        successToast("Meal saved successfully");
        onCloseModal?.();
      } else {
        errorToast(result.error || "Failed to save meal");
      }
    });
  };

  return (
    <div className="modal-bigger">
      <div className="bg-background-600 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 to-primary-800 p-6">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6 text-text-low" />
            <div>
              <h2 className="text-xl font-bold">Save New Meal</h2>
              <p>Add a meal to your saved collection</p>
            </div>
          </div>
        </div>

        <form ref={formRef} action={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-low">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <label htmlFor="name">Meal Name *</label>
              <Input type="text" name="name" required />
              <label htmlFor="producer">Brand/Producer</label>
              <Input type="text" name="producer" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description">Description</label>
              <Input
                type="text"
                name="description"
                placeholder="Brief description of the meal..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-low">
              Nutrition per 100g
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="calories" className="text-xs text-text-gray">
                  Calories
                </label>
                <Input name="calories" type="text" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fat" className="text-xs text-text-gray">
                  Fat (g)
                </label>
                <Input name="fat" type="text" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="carbs" className="text-xs text-text-gray">
                  Carbs (g)
                </label>
                <Input name="carbs" type="text" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="protein" className="text-xs text-text-gray">
                  Protein (g)
                </label>
                <Input name="protein" type="text" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-low flex-1">
                Ingredients
              </h3>
              <Button onClick={addIngredient} variant="secondary">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    name={`ingredients[${index}]`}
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <Button
                      variant="danger"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center justify-end">
            <Button
              variant="secondary"
              onClick={onCloseModal}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="w-5 h-5" />
              {isPending ? "Saving Meal..." : "Save Meal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
