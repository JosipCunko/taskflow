"use client";

import {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useTransition,
  useCallback,
} from "react";
import {
  Search,
  Target,
  ChefHat,
  Filter,
  ChevronDown,
  ChevronUp,
  Utensils,
  Shuffle,
  Activity,
  Calendar,
} from "lucide-react";
import { customToast } from "../../_utils/toasts";
import Button from "../../_components/reusable/Button";
import Input from "../../_components/reusable/Input";
import Modal, { ModalContext } from "../../_components/Modal";
import DateInput from "@/app/_components/reusable/DateInput";
import {
  MealLog,
  SpoonacularFood,
  SpoonacularRecipeInfo,
  CuisineType,
  DietType,
  MealType,
  MealNutrition,
} from "@/app/_types/spoonacularTypes";
import {
  getDailyNutritionSummaryAction,
  getRandomRecipesAction,
  getRecipeInformationAction,
  getUserNutritionGoalsAction,
} from "@/app/_lib/spoonacularActions";
import {
  cuisineOptions,
  defaultDailyNutritionSummary,
  defaultNutritionGoals,
  dietOptions,
  getProgressColor,
  getProgressPercentage,
  mealTypeOptions,
} from "@/app/_utils/healthUtils";
import { formatDate } from "@/app/_utils/utils";
import { setUserNutritionGoalsAction } from "@/app/_lib/actions";
import {
  searchRecipes,
  searchRecipesByIngredients,
} from "@/app/_lib/spoonacular";
import { CardSpecificIcons, FoodIcons } from "@/app/_utils/icons";
import MealCard from "@/app/_components/MealCard";

/* State */
const initialState = {
  searchQuery: "",
  searchResults: [] as SpoonacularFood[],
  selectedFood: null as SpoonacularFood | SpoonacularRecipeInfo | null,
  selectedFoodDetails: null as SpoonacularRecipeInfo | null,
  mealType: "breakfast" as MealLog["mealType"],
  servings: 1,
  servingSize: 1,
  servingUnit: "serving",
  currentDate: new Date(),
  dailyNutritionSummary: defaultDailyNutritionSummary,
  nutritionGoals: defaultNutritionGoals,
  selectedCuisine: "" as CuisineType | "",
  selectedDiet: "" as DietType | "",
  selectedMealType: "" as MealType | "",
  maxReadyTime: 0,
  minHealthScore: 0,
  showFilters: false,
  ingredientSearchMode: false,
  availableIngredients: "",
  randomRecipes: [] as SpoonacularRecipeInfo[],
  favoriteRecipes: [] as number[],
  selectedNutrientPreview: null as MealNutrition | null,
  showWeeklyView: false,
};
type State = typeof initialState;
type SetFieldAction<Key extends keyof State> = {
  type: "SET_FIELD";
  payload: {
    field: Key;
    value: State[Key];
  };
};
type OtherAction =
  | { type: "resetFilters"; payload: null }
  | { type: "closeModalAndReset"; payload: null }
  | { type: "toggleIngredientMode"; payload: null };

type Action = SetFieldAction<keyof State> | OtherAction;
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FIELD":
      if (action.payload)
        return { ...state, [action.payload.field]: action.payload.value };
      return state;
    case "closeModalAndReset":
      return {
        ...state,
        selectedFood: null,
        selectedFoodDetails: null,
        servings: 1,
        servingSize: 1,
        servingUnit: "serving",
        selectedNutrientPreview: null,
      };
    case "resetFilters":
      return {
        ...state,
        selectedCuisine: "" as CuisineType | "",
        selectedDiet: "" as DietType | "",
        selectedMealType: "" as MealType | "",
        maxReadyTime: 0,
        minHealthScore: 0,
      };
    case "toggleIngredientMode":
      return {
        ...state,
        ingredientSearchMode: !state.ingredientSearchMode,
        searchResults: [] as SpoonacularFood[],
        searchQuery: "",
        availableIngredients: "",
      };
    default:
      return state;
  }
};

export default function HealthClientUI() {
  const [isPending, startTransition] = useTransition();
  const [searchAbortController, setSearchAbortController] =
    useState<AbortController | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchField = (field: keyof State, value: State[keyof State]) => {
    dispatch({ type: "SET_FIELD", payload: { field, value } });
  };

  const [goalsModalOpenName, setGoalsModalOpenName] = useState<string>("");
  const openGoalsModal = (name: string) => setGoalsModalOpenName(name);
  const closeGoalsModal = () => setGoalsModalOpenName("");
  const goalsModalContextValue = useMemo(
    () => ({
      openName: goalsModalOpenName,
      open: openGoalsModal,
      close: closeGoalsModal,
    }),
    [goalsModalOpenName]
  );

  const loadFoodDetails = useCallback(async () => {
    startTransition(async () => {
      try {
        if (!state.selectedFood) return;
        const result = await getRecipeInformationAction(state.selectedFood.id);
        dispatchField("selectedFoodDetails", result);
        if (result.nutrition) {
          const nutrition = extractNutritionFromRecipe(result, state.servings);
          dispatchField("selectedNutrientPreview", nutrition);
        }
      } catch (error) {
        console.error("Error loading food details:", error);
        customToast("Error", "Failed to load food details");
      }
    });
  }, [state.selectedFood, state.servings]);

  const extractNutritionFromRecipe = (
    recipe: SpoonacularRecipeInfo,
    servings: number
  ): MealNutrition => {
    const nutrition: MealNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
    if (!recipe.nutrition?.nutrients) return nutrition;

    const baseServings = recipe.servings > 0 ? recipe.servings : 1;
    const findNutrient = (name: string) => {
      const nutrient = recipe?.nutrition?.nutrients.find(
        (n) => n.name.toLowerCase() === name.toLowerCase()
      );
      return nutrient ? (nutrient.amount / baseServings) * servings : 0;
    };
    return {
      calories: findNutrient("Calories"),
      protein: findNutrient("Protein"),
      carbs: findNutrient("Carbohydrates"),
      fat: findNutrient("Fat"),
      fiber: findNutrient("Fiber"),
      sugar: findNutrient("Sugar"),
      sodium: findNutrient("Sodium"),
    };
  };

  const loadDailyNutritionSummary = async () => {
    startTransition(async () => {
      const result = await getDailyNutritionSummaryAction(
        state.currentDate.toISOString().split("T")[0]
      );
      dispatchField("dailyNutritionSummary", result);
    });
  };

  const loadUserNutritionGoals = async () => {
    const result = await getUserNutritionGoalsAction();
    console.log(result);
    dispatchField("nutritionGoals", result);
  };

  const loadRandomRecipes = async () => {
    startTransition(async () => {
      try {
        const result = await getRandomRecipesAction(3);
        dispatchField("randomRecipes", result);
      } catch (error) {
        console.error("Error loading random recipes:", error);
      }
    });
  };

  useEffect(() => {
    loadDailyNutritionSummary();
    loadUserNutritionGoals();
    loadRandomRecipes();
  }, []);

  useEffect(() => {
    loadDailyNutritionSummary();
  }, [state.currentDate]);

  useEffect(() => {
    if (state.selectedFood) {
      loadFoodDetails();
    }
  }, [state.selectedFood, loadFoodDetails]);

  // Recalculate nutrition when servings change
  useEffect(() => {
    if (state.selectedFoodDetails) {
      const nutrition = extractNutritionFromRecipe(
        state.selectedFoodDetails,
        state.servings
      );
      dispatchField("selectedNutrientPreview", nutrition);
    }
  }, [state.servings, state.selectedFoodDetails]);

  const handleSearch = async () => {
    if (
      (!state.searchQuery.trim() && !state.ingredientSearchMode) ||
      (!state.availableIngredients.trim() && state.ingredientSearchMode)
    )
      return;

    if (searchAbortController) {
      searchAbortController.abort();
    }

    const abortController = new AbortController();
    setSearchAbortController(abortController);

    startTransition(async () => {
      try {
        let result;
        if (state.ingredientSearchMode) {
          result = await searchRecipesByIngredients(
            state.availableIngredients,
            { number: 12 },
            abortController.signal
          );
          dispatchField("searchResults", result || ([] as SpoonacularFood[]));
        } else {
          const searchParams = {
            query: state.searchQuery,
            cuisine: state.selectedCuisine || undefined,
            diet: state.selectedDiet || undefined,
            type: state.selectedMealType || undefined,
            maxReadyTime:
              state.maxReadyTime > 0 ? state.maxReadyTime : undefined,
            number: 12,
            addRecipeInformation: true,
            fillIngredients: true,
          };
          result = await searchRecipes(searchParams, abortController.signal);
          dispatchField(
            "searchResults",
            result.results || ([] as SpoonacularFood[])
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        customToast("Error", "Search failed. Please try again.");
      } finally {
        if (!abortController.signal.aborted) {
          setSearchAbortController(null);
        }
      }
    });
  };

  const handleSearchInputChange = (value: string) => {
    dispatchField(
      state.ingredientSearchMode ? "availableIngredients" : "searchQuery",
      value
    );
  };

  const handleSaveGoals = async () => {
    startTransition(async () => {
      try {
        await setUserNutritionGoalsAction(
          state.nutritionGoals.calories,
          state.nutritionGoals.protein,
          state.nutritionGoals.carbs,
          state.nutritionGoals.fat
        );
        customToast("Success", "Nutrition goals updated!");
        closeGoalsModal();
        await loadDailyNutritionSummary();
      } catch (error) {
        console.error("Error updating goals:", error);
        customToast("Error", "Failed to update goals");
      }
    });
  };

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatchField("nutritionGoals", {
      ...state.nutritionGoals,
      [name]: parseInt(value) || 0,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center gap-4">
        <DateInput
          date={state.currentDate}
          setDate={(date) => dispatchField("currentDate", date)}
          className="min-w-fit"
          disableDaysBefore={false}
        >
          <Button variant="secondary">
            <CardSpecificIcons.DueDate size={20} />
            <span>{formatDate(state.currentDate)}</span>
          </Button>
        </DateInput>
        <ModalContext.Provider value={goalsModalContextValue}>
          <Modal.Open opens="nutrition-goals">
            <Button className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Set Goals
            </Button>
          </Modal.Open>
        </ModalContext.Provider>
      </div>

      {/* Daily Summary */}
      <div>
        <h2 className="text-xl font-semibold text-text-high flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          Daily nutrition summary for {formatDate(state.currentDate)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Calories",
              current: state.dailyNutritionSummary.totalCalories,
              goal: state.nutritionGoals.calories,
              unit: "kcal",
              icon: FoodIcons.Calories,
              color: "text-primary-500",
            },
            {
              label: "Protein",
              current: state.dailyNutritionSummary.totalProtein,
              goal: state.nutritionGoals.protein,
              unit: "g",
              icon: FoodIcons.Protein,
              color: "text-accent",
            },
            {
              label: "Carbs",
              current: state.dailyNutritionSummary.totalCarbs,
              goal: state.nutritionGoals.carbs,
              unit: "g",
              icon: FoodIcons.Carbs,
              color: "text-success",
            },
            {
              label: "Fat",
              current: state.dailyNutritionSummary.totalFat,
              goal: state.nutritionGoals.fat,
              unit: "g",
              icon: FoodIcons.Fat,
              color: "text-warning",
            },
          ].map((nutrient) => {
            const percentage = getProgressPercentage(
              nutrient.current,
              nutrient.goal
            );
            const Icon = nutrient.icon;
            return (
              <div
                key={nutrient.label}
                className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3
                  className={`text-lg font-semibold flex items-center gap-2 mb-3 ${nutrient.color}`}
                >
                  <Icon className="w-5 h-5" />
                  {nutrient.label}
                </h3>
                <div className="text-2xl font-bold text-text-high mb-2">
                  {Math.round(nutrient.current)}
                  <span className="text-sm font-normal text-text-low">
                    /{nutrient.goal} {nutrient.unit}
                  </span>
                </div>
                <div className="w-full bg-background-500 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                      percentage
                    )}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-text-low">
                  {Math.round(percentage)}% of goal
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logged Meals & Random Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-text-high flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5" />
            Meals recorded on {formatDate(state.currentDate)}
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {state.dailyNutritionSummary.mealLogs.length > 0 ? (
              state.dailyNutritionSummary.mealLogs.map((log) => (
                <MealCard
                  key={log.id}
                  data={log}
                  onActionComplete={loadDailyNutritionSummary}
                />
              ))
            ) : (
              <div className="text-center py-8 text-text-low">
                No meals logged for this day.
              </div>
            )}
          </div>
        </div>

        {/* Recipe Suggestions Column */}
        <div className="lg:col-span-2 bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-high flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recipe Suggestions
            </h2>
            <Button
              onClick={loadRandomRecipes}
              variant="secondary"
              disabled={isPending}
              className="flex items-center gap-2"
            >
              {isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Shuffle className="w-4 h-4" />
              )}
              New Suggestions
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.randomRecipes.map((recipe) => (
              <MealCard
                key={recipe.id}
                data={recipe}
                onActionComplete={loadDailyNutritionSummary}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Food Search Section */}
      <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-high flex items-center gap-2">
            <Search className="w-5 h-5" />
            Discover Recipes
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                dispatch({ type: "toggleIngredientMode", payload: null })
              }
              variant={state.ingredientSearchMode ? "primary" : "secondary"}
              className="text-sm"
            >
              <ChefHat className="w-4 h-4 mr-1" />
              {state.ingredientSearchMode ? "By Ingredients" : "By Recipe"}
            </Button>
            <Button
              onClick={() => dispatchField("showFilters", !state.showFilters)}
              variant="secondary"
              className="text-sm"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {state.showFilters ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder={
              state.ingredientSearchMode
                ? "Enter ingredients (e.g., chicken, rice, broccoli)"
                : "Search for recipes..."
            }
            value={
              state.ingredientSearchMode
                ? state.availableIngredients
                : state.searchQuery
            }
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="flex-1"
            type="text"
            name="search"
          />
          <Button onClick={handleSearch} disabled={isPending}>
            {isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {state.showFilters && (
          <div className="border-t border-background-500 pt-4 mb-4 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Cuisine
                </label>
                <select
                  value={state.selectedCuisine}
                  onChange={(e) =>
                    dispatchField("selectedCuisine", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  {cuisineOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Diet
                </label>
                <select
                  value={state.selectedDiet}
                  onChange={(e) =>
                    dispatchField("selectedDiet", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  {dietOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Meal Type
                </label>
                <select
                  value={state.selectedMealType}
                  onChange={(e) =>
                    dispatchField("selectedMealType", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background-625 border border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  {mealTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-high mb-1">
                  Max Ready Time (min)
                </label>
                <Input
                  type="number"
                  name="maxReadyTime"
                  value={state.maxReadyTime || ""}
                  onChange={(e) =>
                    dispatchField("maxReadyTime", parseInt(e.target.value) || 0)
                  }
                  className="w-full"
                  placeholder="e.g., 30"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    dispatch({ type: "resetFilters", payload: null })
                  }
                  variant="secondary"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[200px]">
          {isPending && state.searchResults.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : state.searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.searchResults.map((recipe) => (
                <MealCard
                  key={recipe.id}
                  data={recipe as SpoonacularRecipeInfo}
                  onActionComplete={loadDailyNutritionSummary}
                />
              ))}
            </div>
          ) : (
            (state.searchQuery || state.availableIngredients) &&
            !isPending &&
            state.searchResults.length === 0 && (
              <div className="text-center py-8 text-text-low">
                No recipes found. Try adjusting your search or filters.
              </div>
            )
          )}
        </div>
      </div>

      <ModalContext.Provider value={goalsModalContextValue}>
        <Modal.Window name="nutrition-goals">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target />
              Set Daily Nutrition Goals
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: "calories",
                  label: "Calories (kcal)",
                  value: state.nutritionGoals.calories,
                },
                {
                  name: "protein",
                  label: "Protein (g)",
                  value: state.nutritionGoals.protein,
                },
                {
                  name: "carbs",
                  label: "Carbohydrates (g)",
                  value: state.nutritionGoals.carbs,
                },
                {
                  name: "fat",
                  label: "Fat (g)",
                  value: state.nutritionGoals.fat,
                },
              ].map((goal) => (
                <div key={goal.name}>
                  <label className="block text-sm font-medium text-text-high mb-1">
                    {goal.label}
                  </label>
                  <Input
                    type="number"
                    name={goal.name}
                    value={goal.value}
                    onChange={handleGoalInputChange}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={closeGoalsModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoals} disabled={isPending}>
                {isPending ? "Saving..." : "Save Goals"}
              </Button>
            </div>
          </div>
        </Modal.Window>
      </ModalContext.Provider>
    </div>
  );
}
