"use client";

import {
  ComplexFoodSearchResponse,
  RecipeByIngredientsResponse,
  RecipeSearchParams,
} from "../_types/spoonacularTypes";
import { SPOONACULAR_BASE_URL } from "../_utils/healthUtils";

const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

async function makeSpoonacularRequest<T>(
  endpoint: string,
  params: Record<string, unknown> = {},
  signal?: AbortSignal
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
      `${SPOONACULAR_BASE_URL}${endpoint}?${searchParams.toString()}`,
      {
        signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Spoonacular API error: ${response.status} ${errorData}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request was aborted");
    }
    console.error("Spoonacular API request failed:", error);
    throw new Error("Spoonacular API request failed");
  }
}

// ============= Recipe Search Functions =============

/**
 * Search for recipes using complex search with filters
 * GET /recipes/complexSearch
 */
export async function searchRecipes(
  params: RecipeSearchParams,
  signal?: AbortSignal
): Promise<ComplexFoodSearchResponse> {
  return makeSpoonacularRequest<ComplexFoodSearchResponse>(
    "/recipes/complexSearch",
    {
      ...params,
      offset: params.offset || 0,
      number: params.number || 10,
    },
    signal
  );
}

/**
 * Search for recipes by ingredients
 * GET /recipes/findByIngredients
 */
export async function searchRecipesByIngredients(
  ingredients: string,
  options: {
    number?: number;
    ranking?: 1 | 2; // 1 = maximize used ingredients, 2 = minimize missing ingredients
    ignorePantry?: boolean;
  } = {},
  signal?: AbortSignal
): Promise<RecipeByIngredientsResponse[]> {
  return makeSpoonacularRequest<RecipeByIngredientsResponse[]>(
    "/recipes/findByIngredients",
    {
      ingredients,
      number: options.number || 10,
      ranking: options.ranking || 1,
      ignorePantry: options.ignorePantry || true,
    },
    signal
  );
}
