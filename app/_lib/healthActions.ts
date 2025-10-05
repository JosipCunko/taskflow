"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { adminDb } from "./admin";
import { ActionResult, LoggedMeal, SavedMeal } from "../_types/types";
import { revalidatePath } from "next/cache";

export async function createSavedMeal(
  formData: FormData
): Promise<ActionResult<SavedMeal>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const producer = formData.get("producer") as string;
    const calories = parseFloat(formData.get("calories") as string);
    const carbs = parseFloat(formData.get("carbs") as string);
    const protein = parseFloat(formData.get("protein") as string);
    const fat = parseFloat(formData.get("fat") as string);
    const readyInMinutes = parseFloat(formData.get("readyInMinutes") as string);
    const ingredients = (formData.get("ingredients") as string)
      .split(",")
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient.length > 0);

    if (
      !name ||
      isNaN(calories) ||
      isNaN(carbs) ||
      isNaN(protein) ||
      isNaN(fat)
    ) {
      return {
        success: false,
        error: "Please fill in all required fields with valid numbers",
      };
    }

    const savedMealData = {
      userId: session.user.id,
      name,
      ...(description && { description }),
      ...(producer && { producer }),
      nutrientsPer100g: {
        calories,
        carbs,
        protein,
        fat,
      },
      ingredients,
      ...(readyInMinutes && { readyInMinutes }),
      createdAt: Date.now(),
    };

    const docRef = adminDb.collection("savedMeals").doc();
    const savedMealWithId = {
      ...savedMealData,
      id: docRef.id,
    };
    await docRef.set(savedMealWithId);

    revalidatePath("/webapp/health");

    return {
      success: true,
      message: "Meal saved successfully!",
      data: savedMealWithId,
    };
  } catch (error) {
    console.error("Error creating saved meal:", error);
    return { success: false, error: "Failed to save meal. Please try again." };
  }
}
export async function deleteSavedMeal(mealId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    await adminDb.collection("savedMeals").doc(mealId).delete();

    revalidatePath("/webapp/health");

    return {
      success: true,
      message: "Saved meal deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting saved meal:", error);
    return {
      success: false,
      error: "Failed to delete saved meal",
    };
  }
}

export async function createLoggedMeal(
  formData: FormData
): Promise<ActionResult<LoggedMeal>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const savedMealId = formData.get("savedMealId") as string;
    const servingSize = parseFloat(formData.get("servingSize") as string);
    const mealType = formData.get("mealType") as LoggedMeal["mealType"];
    if (!savedMealId || isNaN(servingSize) || servingSize <= 0 || !mealType) {
      return {
        success: false,
        error: "Please select a meal and enter a valid serving size",
      };
    }

    // Get the saved meal data
    const savedMealDoc = await adminDb
      .collection("savedMeals")
      .doc(savedMealId)
      .get();

    if (!savedMealDoc.exists) {
      return { success: false, error: "Selected meal not found" };
    }

    const savedMealData = savedMealDoc.data() as SavedMeal;

    // Calculate nutrients based on serving size
    const multiplier = servingSize / 100; // serving size is in grams, nutrients are per 100g

    const calculatedNutrients = {
      calories: Math.round(
        savedMealData.nutrientsPer100g.calories * multiplier
      ),
      carbs:
        Math.round(savedMealData.nutrientsPer100g.carbs * multiplier * 10) / 10,
      protein:
        Math.round(savedMealData.nutrientsPer100g.protein * multiplier * 10) /
        10,
      fat:
        Math.round(savedMealData.nutrientsPer100g.fat * multiplier * 10) / 10,
    };

    const loggedMealData: Omit<LoggedMeal, "id"> = {
      ...savedMealData,
      createdAt: Date.now(),
      servingSize,
      calculatedNutrients,
      loggedAt: Date.now(),
      mealType,
    };

    const docRef = adminDb.collection("loggedMeals").doc();
    const loggedMealWithId = {
      ...loggedMealData,
      id: docRef.id,
    };
    await docRef.set(loggedMealWithId);

    revalidatePath("/webapp/health");

    return {
      success: true,
      message: `Logged ${servingSize}g of ${savedMealData.name} successfully!`,
      data: loggedMealWithId,
    };
  } catch (error) {
    console.error("Error creating logged meal:", error);
    return { success: false, error: "Failed to log meal. Please try again." };
  }
}

export async function updateLoggedMeal(
  loggedMealId: string,
  updates: {
    name?: string;
    mealType?: LoggedMeal["mealType"];
    servingSize?: number;
  }
): Promise<ActionResult<LoggedMeal>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const loggedMealRef = adminDb.collection("loggedMeals").doc(loggedMealId);
    const doc = await loggedMealRef.get();
    if (!doc.exists) {
      return {
        success: false,
        error: "Logged meal not found",
      };
    }

    const currentLoggedMeal = doc.data() as LoggedMeal;
    if (currentLoggedMeal.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized to update this meal",
      };
    }

    let updatedCalculatedNutrients = currentLoggedMeal.calculatedNutrients;
    if (
      updates.servingSize &&
      updates.servingSize !== currentLoggedMeal.servingSize
    ) {
      const multiplier = updates.servingSize / 100;
      updatedCalculatedNutrients = {
        calories: Math.round(
          currentLoggedMeal.nutrientsPer100g.calories * multiplier
        ),
        carbs:
          Math.round(
            currentLoggedMeal.nutrientsPer100g.carbs * multiplier * 10
          ) / 10,
        protein:
          Math.round(
            currentLoggedMeal.nutrientsPer100g.protein * multiplier * 10
          ) / 10,
        fat:
          Math.round(currentLoggedMeal.nutrientsPer100g.fat * multiplier * 10) /
          10,
      };
    }

    const updateData: Partial<LoggedMeal> = {
      ...updates,
      calculatedNutrients: updatedCalculatedNutrients,
    };
    await loggedMealRef.update(updateData);

    const updatedLoggedMeal: LoggedMeal = {
      ...currentLoggedMeal,
      ...updateData,
    };
    revalidatePath("/webapp/health");

    return {
      success: true,
      message: "Logged meal updated successfully",
      data: updatedLoggedMeal,
    };
  } catch (error) {
    console.error("Error updating logged meal:", error);
    return {
      success: false,
      error: "Failed to update logged meal",
    };
  }
}

export async function deleteLoggedMeal(
  loggedMealId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    await adminDb.collection("loggedMeals").doc(loggedMealId).delete();
    return {
      success: true,
      message: "Meal deleted",
    };
  } catch (error) {
    console.error("Error deleting meal log:", error);
    return {
      success: false,
      error: "Failed to delete meal log",
    };
  }
}
