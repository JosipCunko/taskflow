// ============= Core Food Search Types =============
export interface SpoonacularSearchResponse {
  results: SpoonacularFood[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface SpoonacularFood {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: SpoonacularIngredient[];
  usedIngredients?: SpoonacularIngredient[];
  unusedIngredients?: SpoonacularIngredient[];
  likes?: number;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
}

export interface SpoonacularIngredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
}

// ============= Recipe Information Types =============
export interface SpoonacularRecipeInfo {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  cookingMinutes?: number;
  preparationMinutes?: number;
  license?: string;
  sourceName?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: AnalyzedInstruction[];
  cheap: boolean;
  creditsText?: string;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  ketogenic: boolean;
  lowFodmap: boolean;
  occasions: string[];
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  extendedIngredients: ExtendedIngredient[];
  summary: string;
  winePairing?: WinePairing;
  nutrition?: RecipeNutrition;
}

export interface AnalyzedInstruction {
  name: string;
  steps: InstructionStep[];
}

export interface InstructionStep {
  number: number;
  step: string;
  ingredients: StepIngredient[];
  equipment: StepEquipment[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface StepIngredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface StepEquipment {
  id: number;
  name: string;
  localizedName: string;
  image: string;
  temperature?: {
    number: number;
    unit: string;
  };
}

export interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean?: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: {
    us: Measure;
    metric: Measure;
  };
}

export interface Measure {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface WinePairing {
  pairedWines: string[];
  pairingText: string;
  productMatches: WineProduct[];
}

export interface WineProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  averageRating: number;
  ratingCount: number;
  score: number;
  link: string;
}

// ============= Nutrition Types =============
export interface RecipeNutrition {
  nutrients: Nutrient[];
  properties: NutrientProperty[];
  flavonoids: Flavonoid[];
  ingredients: IngredientNutrition[];
  caloricBreakdown: CaloricBreakdown;
  weightPerServing: {
    amount: number;
    unit: string;
  };
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface NutrientProperty {
  name: string;
  amount: number;
  unit: string;
}

export interface Flavonoid {
  name: string;
  amount: number;
  unit: string;
}

export interface IngredientNutrition {
  id: number;
  name: string;
  amount: number;
  unit: string;
  nutrients: Nutrient[];
}

export interface CaloricBreakdown {
  percentProtein: number;
  percentFat: number;
  percentCarbs: number;
}

// ============= Search Parameters =============
export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  excludeCuisine?: string;
  diet?: string;
  intolerances?: string;
  equipment?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
  instructionsRequired?: boolean;
  fillIngredients?: boolean;
  addRecipeInformation?: boolean;
  addRecipeInstructions?: boolean;
  addRecipeNutrition?: boolean;
  author?: string;
  tags?: string;
  recipeBoxId?: number;
  titleMatch?: string;
  maxReadyTime?: number;
  minServings?: number;
  maxServings?: number;
  ignorePantry?: boolean;
  sort?: string;
  sortDirection?: "asc" | "desc";
  minCarbs?: number;
  maxCarbs?: number;
  minProtein?: number;
  maxProtein?: number;
  minCalories?: number;
  maxCalories?: number;
  minFat?: number;
  maxFat?: number;
  offset?: number;
  number?: number;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  spoonacularId: number;
  title: string;
  image: string;
  servings: number;
  servingSize: number;
  servingUnit: string;
  nutrition: MealNutrition;
  spoonacularData: SpoonacularRecipeInfo; // Store full recipe data for reference
  loggedAt: string;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  omega3?: number;
  omega6?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminA?: number;
}

export interface DailyNutritionSummary {
  date: string; // YYYY-MM-DD format
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealLogs: MealLog[];
}

// ============= Complex Food Search Types =============
export interface ComplexFoodSearchResponse {
  results: SpoonacularFood[];
  offset: number;
  number: number;
  totalResults: number;
}

// ============= Recipe by Ingredients Types =============
export interface RecipeByIngredientsResponse {
  id: number;
  image: string;
  imageType: string;
  likes: number;
  missedIngredientCount: number;
  missedIngredients: SpoonacularIngredient[];
  title: string;
  unusedIngredients: SpoonacularIngredient[];
  usedIngredientCount: number;
  usedIngredients: SpoonacularIngredient[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BulkRecipeInfoResponse extends Array<SpoonacularRecipeInfo> {}

// ============= Random Recipes Types =============
export interface RandomRecipesResponse {
  recipes: SpoonacularRecipeInfo[];
}

// ============= Recipe Search Filters =============
export type CuisineType =
  | "african"
  | "asian"
  | "american"
  | "british"
  | "cajun"
  | "caribbean"
  | "chinese"
  | "eastern european"
  | "european"
  | "french"
  | "german"
  | "greek"
  | "indian"
  | "irish"
  | "italian"
  | "japanese"
  | "jewish"
  | "korean"
  | "latin american"
  | "mediterranean"
  | "mexican"
  | "middle eastern"
  | "nordic"
  | "southern"
  | "spanish"
  | "thai"
  | "vietnamese";

export type DietType =
  | "gluten free"
  | "ketogenic"
  | "vegetarian"
  | "lacto-vegetarian"
  | "ovo-vegetarian"
  | "vegan"
  | "pescetarian"
  | "paleo"
  | "primal"
  | "low fodmap"
  | "whole30";

export type IntoleranceType =
  | "dairy"
  | "egg"
  | "gluten"
  | "grain"
  | "peanut"
  | "seafood"
  | "sesame"
  | "shellfish"
  | "soy"
  | "sulfite"
  | "tree nut"
  | "wheat";

export type MealType =
  | "main course"
  | "side dish"
  | "dessert"
  | "appetizer"
  | "salad"
  | "bread"
  | "breakfast"
  | "soup"
  | "beverage"
  | "sauce"
  | "marinade"
  | "fingerfood"
  | "snack"
  | "drink";

export type SortOption =
  | "meta-score"
  | "popularity"
  | "healthiness"
  | "price"
  | "time"
  | "random"
  | "max-used-ingredients"
  | "min-missing-ingredients";
