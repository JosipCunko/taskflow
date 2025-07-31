"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { adminDb } from "./admin";
import { ActionResult } from "../_types/types";
import { MealLog, SpoonacularRecipeInfo } from "../_types/spoonacularTypes";
import { extractNutritionFromRecipe } from "./spoonacular-admin";

export async function createMealLog(
  date: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  servings: number = 1,
  recipe: SpoonacularRecipeInfo
): Promise<ActionResult<MealLog>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const nutrition = extractNutritionFromRecipe(recipe, servings);
    const mealLogRef = adminDb.collection("mealLogs").doc();
    const mealLog: MealLog = {
      id: mealLogRef.id,
      userId: session.user.id,
      date,
      mealType,
      spoonacularId: recipe.id,
      title: recipe.title,
      image: recipe.image,
      servings,
      nutrition,
      spoonacularData: recipe,
    };
    await mealLogRef.set(mealLog);
    return {
      success: true,
      data: mealLog,
    };
  } catch (error) {
    console.error("Error creating meal log:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create meal log",
    };
  }
}

export async function updateMealLog(
  mealLogId: string,
  updates: Partial<Pick<MealLog, "servings" | "mealType" | "title">>
): Promise<ActionResult<MealLog>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const mealLogRef = adminDb.collection("mealLogs").doc(mealLogId);
    const doc = await mealLogRef.get();

    if (!doc.exists) {
      return {
        success: false,
        error: "Meal log not found",
      };
    }

    const currentMealLog = doc.data() as MealLog;

    let updatedNutrition = currentMealLog.nutrition;
    if (updates.servings && updates.servings !== currentMealLog.servings) {
      updatedNutrition = extractNutritionFromRecipe(
        currentMealLog.spoonacularData,
        updates.servings
      );
    }

    const updatedMealLog = {
      ...currentMealLog,
      ...updates,
      nutrition: updatedNutrition,
    };

    await mealLogRef.update(updatedMealLog);

    return {
      success: true,
      message: "Meal successfully updated",
      data: updatedMealLog,
    };
  } catch (error) {
    console.error("Error updating meal log:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update meal log",
    };
  }
}

export async function deleteMealLog(mealLogId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    await adminDb.collection("mealLogs").doc(mealLogId).delete();
    return {
      success: true,
      message: "Meal deleted",
    };
  } catch (error) {
    console.error("Error deleting meal log:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete meal log",
    };
  }
}
