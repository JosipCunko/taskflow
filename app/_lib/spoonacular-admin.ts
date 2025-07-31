import "server-only";

import { adminDb } from "./admin";
import {
  SpoonacularRecipeInfo,
  MealLog,
  MealNutrition,
  DailyNutritionSummary,
  BulkRecipeInfoResponse,
  RandomRecipesResponse,
} from "../_types/spoonacularTypes";
import { unstable_cache } from "next/cache";
import {
  defaultDailyNutritionSummary,
  SPOONACULAR_BASE_URL,
} from "../_utils/healthUtils";
const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

async function makeSpoonacularRequestServer<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  try {
    if (!SPOONACULAR_API_KEY) {
      throw new Error("SPOONACULAR_API_KEY environment variable is required");
    }

    const searchParams = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ...Object.fromEntries(
        Object.entries(params).filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      ),
    });
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}${endpoint}?${searchParams.toString()}`
    );
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Spoonacular API error: ${response.status} ${errorData}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Spoonacular API request failed:", error);
    throw new Error("Spoonacular API request failed");
  }
}

async function getRandomRecipesPreCached(
  options: {
    limitLicense?: boolean;
    includeTags?: string;
    excludeTags?: string;
    number?: number;
  } = {}
): Promise<RandomRecipesResponse> {
  return makeSpoonacularRequestServer<RandomRecipesResponse>(
    "/recipes/random",
    {
      limitLicense: options.limitLicense,
      "include-tags": options.includeTags,
      "exclude-tags": options.excludeTags,
      number: options.number || 1,
    }
  );
}
export const getRandomRecipes = unstable_cache(getRandomRecipesPreCached);

// ============= Recipe Information Functions =============

/**
 * Get detailed information about a recipe by ID
 * GET /recipes/{id}/information
 */
export async function getRecipeInformation(
  recipeId: number,
  options: {
    includeNutrition?: boolean;
    addWinePairing?: boolean;
    addTasteData?: boolean;
  } = {}
): Promise<SpoonacularRecipeInfo> {
  return makeSpoonacularRequestServer<SpoonacularRecipeInfo>(
    `/recipes/${recipeId}/information`,
    {
      includeNutrition: options.includeNutrition || true,
      addWinePairing: options.addWinePairing || false,
      addTasteData: options.addTasteData || false,
    }
  );
}

/**
 * Get information about multiple recipes at once
 * GET /recipes/informationBulk
 */
export async function getBulkRecipeInformation(
  recipeIds: number[],
  includeNutrition: boolean = true
): Promise<BulkRecipeInfoResponse> {
  return makeSpoonacularRequestServer<BulkRecipeInfoResponse>(
    "/recipes/informationBulk",
    {
      ids: recipeIds.join(","),
      includeNutrition,
    }
  );
}

// ============= Meal Logging Helper Functions =============
export function extractNutritionFromRecipe(
  recipe: SpoonacularRecipeInfo,
  servings: number = 1
): MealNutrition {
  const nutrition: MealNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  if (recipe.nutrition && recipe.nutrition.nutrients) {
    const nutrients = recipe.nutrition.nutrients;

    const findNutrient = (name: string): number => {
      const nutrient = nutrients.find((n) =>
        n.name.toLowerCase().includes(name.toLowerCase())
      );
      return nutrient ? (nutrient.amount * servings) / recipe.servings : 0;
    };

    nutrition.calories = findNutrient("Calories");
    nutrition.protein = findNutrient("Protein");
    nutrition.carbs = findNutrient("Carbohydrates");
    nutrition.fat = findNutrient("Fat");
    nutrition.fiber = findNutrient("Fiber");
    nutrition.sugar = findNutrient("Sugar");
    nutrition.sodium = findNutrient("Sodium");
  }

  return nutrition;
}

// ============= DB Functions =============

export async function getMealLogsForDate(
  userId: string,
  date: string
): Promise<MealLog[]> {
  try {
    const snapshot = await adminDb
      .collection("mealLogs")
      .where("userId", "==", userId)
      .where("date", "==", date)
      .orderBy("loggedAt", "asc")
      .get();

    const mealLogs: MealLog[] = [];
    snapshot.forEach((doc) => {
      mealLogs.push(doc.data() as MealLog);
    });

    return mealLogs;
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return [];
  }
}

export const getDailyNutritionSummary = unstable_cache(
  async (userId: string, date: string): Promise<DailyNutritionSummary> => {
    try {
      const mealLogs = await getMealLogsForDate(userId, date);

      if (!mealLogs) {
        return defaultDailyNutritionSummary;
      }

      const totals = mealLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.nutrition.calories,
          protein: acc.protein + log.nutrition.protein,
          carbs: acc.carbs + log.nutrition.carbs,
          fat: acc.fat + log.nutrition.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const summary: DailyNutritionSummary = {
        date,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein),
        totalCarbs: Math.round(totals.carbs),
        totalFat: Math.round(totals.fat),
        mealLogs,
      };

      return summary;
    } catch (error) {
      console.error("Error calculating daily nutrition summary:", error);
      return defaultDailyNutritionSummary;
    }
  }
);

export async function getMealLogsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MealLog[]> {
  try {
    const snapshot = await adminDb
      .collection("mealLogs")
      .where("userId", "==", userId)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "asc")
      .orderBy("loggedAt", "asc")
      .get();

    const mealLogs: MealLog[] = [];
    snapshot.forEach((doc) => {
      mealLogs.push(doc.data() as MealLog);
    });

    return mealLogs;
  } catch (error) {
    console.error("Error fetching meal logs for date range:", error);
    return [];
  }
}
