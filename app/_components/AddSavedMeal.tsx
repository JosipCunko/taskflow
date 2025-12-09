"use client";

import React, { useRef, useState, useTransition } from "react";
import Input from "./reusable/Input";
import { createSavedMeal } from "@/app/_lib/healthActions";
import {
  Plus,
  Save,
  Trash2,
  Utensils,
  Camera,
  Leaf,
  AlertCircle,
  X,
} from "lucide-react";
import Button from "./reusable/Button";
import { successToast, errorToast } from "../_utils/utils";
import { BarcodeProductResponse } from "../_types/types";
import Loader from "./Loader";

// Nutri-Score colors
const nutriScoreColors: Record<string, string> = {
  a: "bg-green-500",
  b: "bg-lime-400",
  c: "bg-yellow-400",
  d: "bg-orange-400",
  e: "bg-red-500",
};

// NOVA group descriptions
const novaDescriptions: Record<number, string> = {
  1: "Unprocessed",
  2: "Processed culinary",
  3: "Processed",
  4: "Ultra-processed",
};

export default function AddSavedMeal({
  onCloseModal,
}: {
  onCloseModal?: () => void;
}) {
  const [ingredients, setIngredients] = useState([""]);
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] =
    useState<BarcodeProductResponse | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for prefilling
  const [formValues, setFormValues] = useState({
    name: "",
    producer: "",
    description: "",
    calories: "",
    fat: "",
    carbs: "",
    protein: "",
  });

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBarcodeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/health/barcode", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        errorToast(result.error || "Failed to scan barcode");
        return;
      }

      const product: BarcodeProductResponse = result.data;
      setScannedProduct(product);

      // Build description with extra info
      const descParts: string[] = [];
      if (product.quantity) descParts.push(product.quantity);
      if (product.nutriScore)
        descParts.push(`Nutri-Score: ${product.nutriScore.toUpperCase()}`);
      if (product.novaGroup)
        descParts.push(
          `NOVA: ${product.novaGroup} (${novaDescriptions[product.novaGroup]})`
        );
      if (product.isVegan) descParts.push("Vegan");
      else if (product.isVegetarian) descParts.push("Vegetarian");

      // Prefill form
      setFormValues({
        name: product.name,
        producer: product.producer || "",
        description: descParts.join(" • "),
        calories: product.nutrientsPer100g.calories.toString(),
        fat: product.nutrientsPer100g.fat.toString(),
        carbs: product.nutrientsPer100g.carbs.toString(),
        protein: product.nutrientsPer100g.protein.toString(),
      });

      // Set ingredients
      if (product.ingredients.length > 0) {
        setIngredients(product.ingredients);
      }

      successToast(`Found: ${product.name}`);
    } catch {
      errorToast("Failed to process barcode image");
    } finally {
      setIsScanning(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearScannedData = () => {
    setScannedProduct(null);
    setFormValues({
      name: "",
      producer: "",
      description: "",
      calories: "",
      fat: "",
      carbs: "",
      protein: "",
    });
    setIngredients([""]);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const ingredientsString = ingredients
        .filter((ing) => ing.trim())
        .join(", ");
      formData.set("ingredients", ingredientsString);

      // Add barcode data if scanned
      if (scannedProduct) {
        formData.set("barcode", scannedProduct.barcode);
        if (scannedProduct.quantity)
          formData.set("quantity", scannedProduct.quantity);
        if (scannedProduct.nutriScore)
          formData.set("nutriScore", scannedProduct.nutriScore);
        if (scannedProduct.novaGroup)
          formData.set("novaGroup", scannedProduct.novaGroup.toString());
        if (scannedProduct.isVegan) formData.set("isVegan", "true");
        if (scannedProduct.isVegetarian) formData.set("isVegetarian", "true");
      }

      const result = await createSavedMeal(formData);

      if (result.success) {
        formRef.current?.reset();
        setIngredients([""]);
        setScannedProduct(null);
        setFormValues({
          name: "",
          producer: "",
          description: "",
          calories: "",
          fat: "",
          carbs: "",
          protein: "",
        });
        successToast("Meal saved successfully");
        onCloseModal?.();
      } else {
        errorToast(result.error || "Failed to save meal");
      }
    });
  };

  return (
    <div className="modal-bigger">
      <div className="bg-background-600 rounded-xl overflow-hidden relative">
        {isScanning && <Loader label="Scanning barcode..." />}

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
          {/* Barcode Scanner Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-low">
                Scan Barcode
              </h3>
              {scannedProduct && (
                <button
                  type="button"
                  onClick={clearScannedData}
                  className="text-text-gray hover:text-text-low flex items-center gap-1 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {!scannedProduct ? (
              <div
                className="border-2 border-dashed border-background-400 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-10 h-10 mx-auto mb-3 text-text-gray" />
                <p className="text-text-low font-medium mb-1">
                  Upload barcode image
                </p>
                <p className="text-text-gray text-sm">
                  Take a photo of a food barcode to auto-fill nutrition info
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleBarcodeUpload}
                />
              </div>
            ) : (
              <div className="bg-background-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {scannedProduct.imageUrl && (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-low truncate">
                      {scannedProduct.name}
                    </p>
                    {scannedProduct.producer && (
                      <p className="text-sm text-text-gray">
                        {scannedProduct.producer}
                      </p>
                    )}
                    <p className="text-xs text-text-gray mt-1">
                      Barcode: {scannedProduct.barcode}
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  {scannedProduct.nutriScore && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        nutriScoreColors[scannedProduct.nutriScore]
                      }`}
                    >
                      Nutri-Score {scannedProduct.nutriScore.toUpperCase()}
                    </span>
                  )}
                  {scannedProduct.novaGroup && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-background-500 text-text-low">
                      NOVA {scannedProduct.novaGroup}
                    </span>
                  )}
                  {scannedProduct.isVegan && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Vegan
                    </span>
                  )}
                  {scannedProduct.isVegetarian && !scannedProduct.isVegan && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Vegetarian
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-gray flex items-center gap-1 text-pretty">
                  <AlertCircle className="w-3 h-3" />
                  Data from Open Food Facts. Review and edit before saving.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-low">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <label htmlFor="name">Meal Name</label>
              <Input
                type="text"
                name="name"
                required
                value={formValues.name}
                onChange={handleFormChange}
              />
              <label htmlFor="producer">Brand/Producer</label>
              <Input
                type="text"
                name="producer"
                value={formValues.producer}
                onChange={handleFormChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description">Description</label>
              <Input
                type="text"
                name="description"
                placeholder="Brief description of the meal..."
                value={formValues.description}
                onChange={handleFormChange}
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
                <Input
                  name="calories"
                  type="text"
                  required
                  value={formValues.calories}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fat" className="text-xs text-text-gray">
                  Fat (g)
                </label>
                <Input
                  name="fat"
                  type="text"
                  required
                  value={formValues.fat}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="carbs" className="text-xs text-text-gray">
                  Carbs (g)
                </label>
                <Input
                  name="carbs"
                  type="text"
                  required
                  value={formValues.carbs}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="protein" className="text-xs text-text-gray">
                  Protein (g)
                </label>
                <Input
                  name="protein"
                  type="text"
                  required
                  value={formValues.protein}
                  onChange={handleFormChange}
                />
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
            <Button type="submit" disabled={isPending || isScanning}>
              <Save className="w-5 h-5" />
              {isPending ? "Saving Meal..." : "Save Meal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
