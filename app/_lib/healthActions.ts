"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { adminDb } from "./admin";
import {
  ActionResult,
  LoggedMeal,
  NutrientLevels,
  SavedMeal,
} from "../_types/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { CacheTags } from "../_utils/serverCache";
import { startOfDay, subMonths } from "date-fns";

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

    // Barcode scanner fields
    const barcode = formData.get("barcode") as string | null;
    const quantity = formData.get("quantity") as string | null;
    const nutriScore = formData.get("nutriScore") as
      | "a"
      | "b"
      | "c"
      | "d"
      | "e"
      | null;
    const novaGroupStr = formData.get("novaGroup") as string | null;
    const novaGroup = novaGroupStr
      ? (parseInt(novaGroupStr) as 1 | 2 | 3 | 4)
      : null;
    const isVegan = formData.get("isVegan") === "true";
    const isVegetarian = formData.get("isVegetarian") === "true";
    const nutrientLevelsStr = formData.get("nutrientLevels") as string | null;
    const nutrientLevels: NutrientLevels | null = nutrientLevelsStr
      ? JSON.parse(nutrientLevelsStr)
      : null;

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
      // Barcode scanner fields
      ...(barcode && { barcode }),
      ...(quantity && { quantity }),
      ...(nutriScore && { nutriScore }),
      ...(novaGroup && { novaGroup }),
      ...(isVegan && { isVegan }),
      ...(isVegetarian && { isVegetarian }),
      ...(nutrientLevels && { nutrientLevels }),
      createdAt: Date.now(),
    };

    const docRef = adminDb.collection("savedMeals").doc();
    const savedMealWithId = {
      ...savedMealData,
      id: docRef.id,
    };
    await docRef.set(savedMealWithId);

    revalidateTag(CacheTags.userHealth(session.user.id));
    revalidatePath("/webapp/health");
    revalidatePath("/webapp");

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

    revalidateTag(CacheTags.userHealth(session.user.id));
    revalidatePath("/webapp/health");
    revalidatePath("/webapp");

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

    revalidateTag(CacheTags.userHealth(session.user.id));
    revalidatePath("/webapp/health");
    revalidatePath("/webapp");

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

    revalidateTag(CacheTags.userHealth(session.user.id));
    revalidatePath("/webapp/health");
    revalidatePath("/webapp");

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

export interface NutritionDataPoint {
  date: number;
  displayDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HistoricalNutritionData {
  dataPoints: NutritionDataPoint[];
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function getHistoricalNutritionData(
  monthsBack: number
): Promise<ActionResult<HistoricalNutritionData>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const endDate = Date.now();
    const startDate = subMonths(startOfDay(endDate), monthsBack).getTime();

    // Fetch all logged meals in the date range
    const snapshot = await adminDb
      .collection("loggedMeals")
      .where("userId", "==", session.user.id)
      .where("loggedAt", ">=", startDate)
      .where("loggedAt", "<=", endDate)
      .orderBy("loggedAt", "asc")
      .get();

    // Group meals by day
    const dailyData = new Map<
      string,
      {
        date: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }
    >();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const mealDate = startOfDay(data.loggedAt).getTime();
      const dateKey = mealDate.toString();

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: mealDate,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      }

      const dayData = dailyData.get(dateKey)!;
      dayData.calories += data.calculatedNutrients.calories;
      dayData.protein += data.calculatedNutrients.protein;
      dayData.carbs += data.calculatedNutrients.carbs;
      dayData.fat += data.calculatedNutrients.fat;
    });

    // Convert to array and format
    const dataPoints: NutritionDataPoint[] = Array.from(dailyData.values())
      .map((day) => ({
        date: day.date,
        displayDate: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calories: Math.round(day.calories),
        protein: Math.round(day.protein * 10) / 10,
        carbs: Math.round(day.carbs * 10) / 10,
        fat: Math.round(day.fat * 10) / 10,
      }))
      .sort((a, b) => a.date - b.date);

    // Calculate averages (only for days with data)
    const averages = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    if (dataPoints.length > 0) {
      const totals = dataPoints.reduce(
        (acc, day) => ({
          calories: acc.calories + day.calories,
          protein: acc.protein + day.protein,
          carbs: acc.carbs + day.carbs,
          fat: acc.fat + day.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      averages.calories = Math.round(totals.calories / dataPoints.length);
      averages.protein =
        Math.round((totals.protein / dataPoints.length) * 10) / 10;
      averages.carbs = Math.round((totals.carbs / dataPoints.length) * 10) / 10;
      averages.fat = Math.round((totals.fat / dataPoints.length) * 10) / 10;
    }

    return {
      success: true,
      data: {
        dataPoints,
        averages,
      },
    };
  } catch (error) {
    console.error("Error fetching historical nutrition data:", error);
    return {
      success: false,
      error: "Failed to fetch historical nutrition data",
    };
  }
}
