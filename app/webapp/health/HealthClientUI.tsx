"use client";

import {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useTransition,
  useCallback,
} from "react";
import { Target, Utensils, Calendar, Plus } from "lucide-react";
import { successToast, errorToast } from "../../_utils/utils";
import Button from "../../_components/reusable/Button";
import Input from "../../_components/reusable/Input";
import Modal, { ModalContext } from "../../_components/Modal";
import DateInput from "@/app/_components/reusable/DateInput";
import {
  defaultDailyNutritionSummary,
  defaultNutritionGoals,
  getProgressColor,
  formatDate,
  getProgressPercentage,
  generateNutrients,
} from "@/app/_utils/utils";
import { setUserNutritionGoalsAction } from "@/app/_lib/actions";
import { CardSpecificIcons } from "@/app/_utils/icons";
import AddLoggedMeal from "@/app/_components/AddLoggedMeal";
import AddSavedMeal from "@/app/_components/AddSavedMeal";
import LoggedMealCard from "@/app/_components/LoggedMealCard";

/* State */
const initialState = {
  currentDate: Date.now(),
  dailyNutritionSummary: defaultDailyNutritionSummary,
  nutritionGoals: defaultNutritionGoals,
};
type State = typeof initialState;
type SetFieldAction<Key extends keyof State> = {
  type: "SET_FIELD";
  payload: {
    field: Key;
    value: State[Key];
  };
};

type Action = SetFieldAction<keyof State>;
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FIELD":
      if (action.payload)
        return { ...state, [action.payload.field]: action.payload.value };
      return state;
    default:
      return state;
  }
};

export default function HealthClientUI() {
  const [isPending, startTransition] = useTransition();
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchField = useCallback(
    (field: keyof State, value: State[keyof State]) => {
      dispatch({ type: "SET_FIELD", payload: { field, value } });
    },
    []
  );

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

  const loadDailyNutritionSummary = useCallback(async () => {
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
        errorToast("Failed to load daily nutrition summary");
      }
    });
  }, [state.currentDate, dispatchField]);

  const loadUserNutritionGoals = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/nutritionGoals");
        const data = await res.json();
        dispatchField("nutritionGoals", data.data);
      } catch {
        errorToast("Failed to load nutrition goals");
      }
    });
  }, [dispatchField]);

  useEffect(() => {
    loadUserNutritionGoals();
  }, [loadUserNutritionGoals]);

  useEffect(() => {
    loadDailyNutritionSummary();
  }, [loadDailyNutritionSummary]);

  const handleSaveGoals = async () => {
    startTransition(async () => {
      try {
        await setUserNutritionGoalsAction(
          state.nutritionGoals.calories,
          state.nutritionGoals.protein,
          state.nutritionGoals.carbs,
          state.nutritionGoals.fat
        );
        successToast("Nutrition goals updated!");
        closeGoalsModal();
        await loadDailyNutritionSummary();
      } catch (error) {
        console.error("Error updating goals:", error);
        errorToast("Failed to update goals");
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
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4">
        <DateInput
          date={state.currentDate}
          setDate={(date) => dispatchField("currentDate", date)}
          className="min-w-fit w-full sm:w-auto"
          disableDaysBefore={false}
        >
          <Button variant="secondary" className="w-full sm:w-auto justify-center">
            <CardSpecificIcons.DueDate size={20} />
            <span>{formatDate(state.currentDate)}</span>
          </Button>
        </DateInput>
        <ModalContext.Provider value={goalsModalContextValue}>
          <Modal.Open opens="nutrition-goals">
            <Button className="w-full sm:w-auto justify-center">
              <Target className="w-4 aspect-square" />
              <span className="sm:inline">Set Goals</span>
            </Button>
          </Modal.Open>
        </ModalContext.Provider>

        <ModalContext.Provider value={logMealModalContextValue}>
          <Modal.Open opens="log-meal">
            <Button className="w-full sm:w-auto justify-center">
              <Plus className="w-4 aspect-square" />
              <span className="sm:inline">Log Meal</span>
            </Button>
          </Modal.Open>
        </ModalContext.Provider>

        <ModalContext.Provider value={saveMealModalContextValue}>
          <Modal.Open opens="save-meal">
            <Button className="w-full sm:w-auto justify-center">
              <Plus className="w-4 aspect-square" />
              <span className="sm:inline">Save Meal</span>
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
              nutrient.current || 0, // Displays NaN without default
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
                  {
                    Math.round(nutrient.current || 0) // Displays NaN without default
                  }
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

      {/* Logged Meals */}
      <div className="bg-background-600 border border-background-500 rounded-xl shadow-lg p-6">
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
