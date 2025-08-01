import "server-only";

import { adminDb } from "./admin";
import {
  SpoonacularRecipeInfo,
  RandomRecipesResponse,
} from "../_types/spoonacularTypes";
import {
  LoggedMeal,
  DailyNutritionSummary,
  SavedMeal,
  ActionResult,
} from "../_types/types";
import { unstable_cache } from "next/cache";
import { defaultDailyNutritionSummary } from "../_utils/utils";
import { isSameDay } from "date-fns";
const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

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

export async function getLoggedMealsForDate(
  userId: string,
  date: Date
): Promise<LoggedMeal[]> {
  try {
    const snapshot = await adminDb
      .collection("loggedMeals")
      .where("userId", "==", userId)
      .orderBy("loggedAt", "asc")
      .get();

    const loggedMeals: LoggedMeal[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const loggedAt = data.loggedAt?.toDate
        ? data.loggedAt.toDate()
        : new Date(data.loggedAt);

      if (isSameDay(loggedAt, date)) {
        const plainLoggedMeal = {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          producer: data.producer,
          nutrientsPer100g: data.nutrientsPer100g,
          ingredients: data.ingredients,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          readyInMinutes: data.readyInMinutes,
          mealType: data.mealType,
          servingSize: data.servingSize,
          calculatedNutrients: data.calculatedNutrients,
          loggedAt,
        } as LoggedMeal;
        loggedMeals.push(plainLoggedMeal);
      }
    });
    return loggedMeals;
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return [];
  }
}
export async function getLoggedMealsForDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<LoggedMeal[]> {
  try {
    const snapshot = await adminDb
      .collection("loggedMeals")
      .where("userId", "==", userId)
      .where("loggedAt", ">=", startDate)
      .where("loggedAt", "<=", endDate)
      .orderBy("loggedAt", "asc")
      .get();

    const loggedMeals: LoggedMeal[] = [];
    snapshot.forEach((doc) => {
      loggedMeals.push(doc.data() as LoggedMeal);
    });

    return loggedMeals;
  } catch (error) {
    console.error("Error fetching meal logs for date range:", error);
    return [];
  }
}

export const getDailyNutritionSummary = unstable_cache(
  async (userId: string, date: Date): Promise<DailyNutritionSummary> => {
    try {
      const loggedMeals = await getLoggedMealsForDate(userId, date);

      if (!loggedMeals) {
        return defaultDailyNutritionSummary;
      }

      const totals = loggedMeals.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calculatedNutrients.calories,
          protein: acc.protein + log.calculatedNutrients.protein,
          carbs: acc.carbs + log.calculatedNutrients.carbs,
          fat: acc.fat + log.calculatedNutrients.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const summary: DailyNutritionSummary = {
        date,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein),
        totalCarbs: Math.round(totals.carbs),
        totalFat: Math.round(totals.fat),
        loggedMeals,
      };

      return summary;
    } catch (error) {
      console.error("Error calculating daily nutrition summary:", error);
      return defaultDailyNutritionSummary;
    }
  }
);

export const getSavedMeals = async (
  userId: string
): Promise<ActionResult<SavedMeal[]>> => {
  try {
    const savedMealsQuery = adminDb
      .collection("savedMeals")
      .where("userId", "==", userId);

    const querySnapshot = await savedMealsQuery.get();
    const savedMeals: SavedMeal[] = [];

    querySnapshot.forEach((doc) => {
      savedMeals.push({ id: doc.id, ...doc.data() } as SavedMeal);
    });

    return {
      success: true,
      data: savedMeals,
    };
  } catch (error) {
    console.error("Error fetching saved meals:", error);
    return {
      success: false,
      error: "Failed to fetch saved meals",
      data: [] as SavedMeal[],
    };
  }
};
