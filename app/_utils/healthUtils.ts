import {
  CuisineType,
  DailyNutritionSummary,
  DietType,
  MealLog,
  MealType,
} from "../_types/spoonacularTypes";
import { UserNutritionGoals } from "../_types/types";

export const defaultNutritionGoals: Omit<UserNutritionGoals, "updatedAt"> = {
  calories: 2000,
  carbs: 270,
  protein: 105,
  fat: 55,
};

export const defaultDailyNutritionSummary: DailyNutritionSummary = {
  date: new Date().toISOString().split("T")[0],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  mealLogs: [] as MealLog[],
};

export const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

export const cuisineOptions: CuisineType[] = [
  "american",
  "asian",
  "british",
  "caribbean",
  "chinese",
  "french",
  "german",
  "greek",
  "indian",
  "italian",
  "japanese",
  "korean",
  "mediterranean",
  "mexican",
  "middle eastern",
  "spanish",
  "thai",
];
export const dietOptions: DietType[] = [
  "gluten free",
  "ketogenic",
  "vegetarian",
  "vegan",
  "pescetarian",
  "paleo",
  "primal",
  "whole30",
];
export const mealTypeOptions: MealType[] = [
  "main course",
  "side dish",
  "dessert",
  "appetizer",
  "salad",
  "breakfast",
  "soup",
  "snack",
];
export const getProgressPercentage = (current: number, goal: number) => {
  if (current === 0 || goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};
export const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-success";
  if (percentage >= 50) return "bg-warning";
  return "bg-info";
};
