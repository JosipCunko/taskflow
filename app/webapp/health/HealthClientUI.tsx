"use client";

import { useState, useEffect, useMemo, useReducer, useTransition } from "react";
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
  Plus,
} from "lucide-react";
import { customToast } from "../../_utils/toasts";
import Button from "../../_components/reusable/Button";
import Input from "../../_components/reusable/Input";
import Modal, { ModalContext } from "../../_components/Modal";
import DateInput from "@/app/_components/reusable/DateInput";
import {
  SpoonacularFood,
  SpoonacularRecipeInfo,
  CuisineType,
  DietType,
  MealType,
} from "@/app/_types/spoonacularTypes";
import {
  cuisineOptions,
  defaultDailyNutritionSummary,
  defaultNutritionGoals,
  dietOptions,
  getProgressColor,
  formatDate,
  getProgressPercentage,
  mealTypeOptions,
  generateNutrients,
} from "@/app/_utils/utils";
import { setUserNutritionGoalsAction } from "@/app/_lib/actions";
import { searchRecipes, searchRecipesByIngredients } from "@/app/_lib/health";
import { CardSpecificIcons } from "@/app/_utils/icons";
import AddLoggedMeal from "@/app/_components/AddLoggedMeal";
import AddSavedMeal from "@/app/_components/AddSavedMeal";
import LoggedMealCard from "@/app/_components/LoggedMealCard";
import SpoonacularMealCard from "@/app/_components/SpoonacularMealCard";

/* State */
const initialState = {
  searchQuery: "",
  searchResults: [] as SpoonacularFood[],
  currentDate: new Date(),
  dailyNutritionSummary: defaultDailyNutritionSummary,
  nutritionGoals: defaultNutritionGoals,
  selectedCuisine: "" as CuisineType | "",
  selectedDiet: "" as DietType | "",
  selectedMealType: "" as MealType | "",
  showFilters: false,
  ingredientSearchMode: false,
  availableIngredients: "",
  randomRecipes: [] as SpoonacularRecipeInfo[],
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
  | { type: "toggleIngredientMode"; payload: null };

type Action = SetFieldAction<keyof State> | OtherAction;
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FIELD":
      if (action.payload)
        return { ...state, [action.payload.field]: action.payload.value };
      return state;
    case "resetFilters":
      return {
        ...state,
        selectedCuisine: "" as CuisineType | "",
        selectedDiet: "" as DietType | "",
        selectedMealType: "" as MealType | "",
        maxReadyTime: 0,
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchField = (field: keyof State, value: State[keyof State]) => {
    dispatch({ type: "SET_FIELD", payload: { field, value } });
  };

  /* Modals */
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
  const [logMealModalOpenName, setLogMealModalOpenName] = useState<string>("");
  const openLogMealModal = (name: string) => setLogMealModalOpenName(name);
  const closeLogMealModal = () => setLogMealModalOpenName("");
  const logMealModalContextValue = useMemo(
    () => ({
      openName: logMealModalOpenName,
      open: openLogMealModal,
      close: closeLogMealModal,
    }),
    [logMealModalOpenName]
  );

  const [saveMealModalOpenName, setSaveMealModalOpenName] =
    useState<string>("");
  const openSaveMealModal = (name: string) => setSaveMealModalOpenName(name);
  const closeSaveMealModal = () => setSaveMealModalOpenName("");
  const saveMealModalContextValue = useMemo(
    () => ({
      openName: saveMealModalOpenName,
      open: openSaveMealModal,
      close: closeSaveMealModal,
    }),
    [saveMealModalOpenName]
  );

  const loadDailyNutritionSummary = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/health/dailySummary", {
          method: "POST",
          body: JSON.stringify({
            date: state.currentDate,
          }),
        });
        const data = await res.json();
        if (data.data) {
          dispatchField("dailyNutritionSummary", data.data);
        }
      } catch (error) {
        console.error("Error loading daily nutrition summary:", error);
        customToast("Error", "Failed to load daily nutrition summary");
      }
    });
  };

  const loadUserNutritionGoals = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/nutritionGoals");
        const data = await res.json();
        dispatchField("nutritionGoals", data.data);
      } catch {
        customToast("Error", "Failed to load nutrition goals");
      }
    });
  };

  const loadRandomRecipes = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/health/randomRecipes", {
          method: "POST",
          body: JSON.stringify({
            number: 3,
            includeTags: undefined,
            excludeTags: undefined,
            limitLicense: undefined,
          }),
        });
        const data = await res.json();
        if (data.data) {
          dispatchField("randomRecipes", data.data);
        }
      } catch (error) {
        console.error("Error loading random recipes:", error);
        customToast("Error", "Failed to load recipe suggestions");
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

  const handleSearch = async () => {
    if (
      (!state.searchQuery.trim() && !state.ingredientSearchMode) ||
      (!state.availableIngredients.trim() && state.ingredientSearchMode)
    )
      return;

    startTransition(async () => {
      try {
        let result;
        if (state.ingredientSearchMode) {
          result = await searchRecipesByIngredients(
            state.availableIngredients,
            { number: 12 }
          );
          dispatchField("searchResults", result || ([] as SpoonacularFood[]));
        } else {
          const searchParams = {
            query: state.searchQuery,
            cuisine: state.selectedCuisine || undefined,
            diet: state.selectedDiet || undefined,
            type: state.selectedMealType || undefined,
            number: 12,
            addRecipeInformation: true,
            fillIngredients: true,
          };
          result = await searchRecipes(searchParams);
          dispatchField(
            "searchResults",
            result.results || ([] as SpoonacularFood[])
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        customToast("Error", "Search failed. Please try again.");
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
            <Button>
              <Target className="w-4 aspect-square" />
              Set Goals
            </Button>
          </Modal.Open>
        </ModalContext.Provider>

        <ModalContext.Provider value={logMealModalContextValue}>
          <Modal.Open opens="log-meal">
            <Button>
              <Plus className="w-4 aspect-square" />
              Log your meal
            </Button>
          </Modal.Open>
        </ModalContext.Provider>

        <ModalContext.Provider value={saveMealModalContextValue}>
          <Modal.Open opens="save-meal">
            <Button>
              <Plus className="w-4 aspect-square" />
              Save your meal
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
          {generateNutrients(
            state.dailyNutritionSummary,
            state.nutritionGoals
          ).map((nutrient) => {
            const percentage = getProgressPercentage(
              nutrient.current!,
              nutrient.goal!
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
                  {Math.round(nutrient.current!)}
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
            {state.dailyNutritionSummary.loggedMeals.length > 0 ? (
              state.dailyNutritionSummary.loggedMeals.map((loggedMeal) => (
                <LoggedMealCard
                  key={loggedMeal.id}
                  loggedMeal={loggedMeal}
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
            {isPending
              ? // Loading skeleton for random recipes
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-background-500 rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-32 bg-background-400 rounded mb-3" />
                    <div className="h-4 w-3/4 bg-background-400 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-background-400 rounded" />
                  </div>
                ))
              : state.randomRecipes.map((recipe) => (
                  <SpoonacularMealCard
                    key={recipe.id}
                    recipe={recipe as SpoonacularRecipeInfo}
                  />
                ))}
          </div>
        </div>
      </div>

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

        {state.showFilters && !state.ingredientSearchMode && (
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
                <SpoonacularMealCard
                  key={recipe.id}
                  recipe={recipe as SpoonacularRecipeInfo}
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
          <div className="modal">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target />
              Set Daily Nutrition Goals
            </h2>
            <div className="space-y-4">
              {generateNutrients(
                state.dailyNutritionSummary,
                state.nutritionGoals
              ).map((goal) => (
                <div key={goal.label}>
                  <label className="block text-sm font-medium text-text-high mb-1">
                    {goal.label}
                  </label>
                  <Input
                    type="number"
                    name={goal.label}
                    value={goal.goal}
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

      <ModalContext.Provider value={saveMealModalContextValue}>
        <Modal.Window name="save-meal">
          <AddSavedMeal />
        </Modal.Window>
      </ModalContext.Provider>

      <ModalContext.Provider value={logMealModalContextValue}>
        <Modal.Window name="log-meal">
          <AddLoggedMeal />
        </Modal.Window>
      </ModalContext.Provider>
    </div>
  );
}
