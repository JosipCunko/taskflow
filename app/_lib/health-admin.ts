import "server-only";

import { adminDb } from "./admin";
import {
  LoggedMeal,
  DailyNutritionSummary,
  SavedMeal,
  ActionResult,
} from "../_types/types";
import { unstable_cache } from "next/cache";
import { defaultDailyNutritionSummary } from "../_utils/utils";
import { isSameDay } from "date-fns";
import { CacheTags, CacheDuration } from "../_utils/serverCache";

export async function getLoggedMealsForDate(
  userId: string,
  date: number
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
      const loggedAt = data.loggedAt;

      if (isSameDay(loggedAt, date)) {
        const plainLoggedMeal = {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          producer: data.producer,
          nutrientsPer100g: data.nutrientsPer100g,
          ingredients: data.ingredients,
          createdAt: data.createdAt,
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
  startDate: number,
  endDate: number
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

async function getDailyNutritionSummaryInternal(
  userId: string,
  date: number
): Promise<DailyNutritionSummary> {
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
      date: date,
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

export const getDailyNutritionSummary = async (
  userId: string,
  date: number
): Promise<DailyNutritionSummary> => {
  const cachedGetNutritionSummary = unstable_cache(
    getDailyNutritionSummaryInternal,
    [`health:user:${userId}`],
    {
      tags: [CacheTags.userHealth(userId)],
      revalidate: CacheDuration.GYM_HEALTH,
    }
  );
  return cachedGetNutritionSummary(userId, date);
};

async function getSavedMealsInternal(
  userId: string
): Promise<ActionResult<SavedMeal[]>> {
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
}

export const getSavedMeals = async (
  userId: string
): Promise<ActionResult<SavedMeal[]>> => {
  const cachedGetSavedMeals = unstable_cache(
    getSavedMealsInternal,
    [`health:user:${userId}`],
    {
      tags: [CacheTags.userHealth(userId)],
      revalidate: CacheDuration.GYM_HEALTH,
    }
  );

  return cachedGetSavedMeals(userId);
};
