"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { deleteSavedMeal } from "@/app/_lib/healthActions";
import {
  Search as SearchIcon,
  Trash2,
  UtensilsCrossed,
  Utensils,
} from "lucide-react";
import Search from "./reusable/Search";
import Button from "./reusable/Button";
import { errorToast, successToast } from "../_utils/utils";
import Loader from "./Loader";
import { clientCache } from "../_utils/clientCache";
import { SavedMeal } from "../_types/types";
import SavedMealCard from "./SavedMealCard";

type SavedMealItem = Omit<SavedMeal, "barcode" | "quantity" | "userId">;

export default function ManageSavedMeals({
  onCloseModal,
}: {
  onCloseModal?: () => void;
}) {
  const [savedMeals, setSavedMeals] = useState<SavedMealItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const { cache, invalidateCache } = useMemo(() => {
    return clientCache(
      "savedMeals",
      5,
      "/api/health/savedMeals",
      setSavedMeals,
      [] as SavedMealItem[],
      setIsLoading,
      (message) => errorToast(message)
    );
  }, []);

  useEffect(() => {
    cache();
  }, [cache]);

  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return savedMeals;

    const query = searchQuery.toLowerCase();
    return savedMeals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(query) ||
        meal.producer?.toLowerCase().includes(query) ||
        meal.description?.toLowerCase().includes(query) ||
        meal.ingredients.some((ing) => ing.toLowerCase().includes(query))
    );
  }, [savedMeals, searchQuery]);

  const handleDelete = async (mealId: string) => {
    setDeletingId(mealId);
    startTransition(async () => {
      const result = await deleteSavedMeal(mealId);

      if (result.success) {
        successToast(result.message || "Meal deleted successfully");
        setSavedMeals((prev) => prev.filter((m) => m.id !== mealId));
        invalidateCache();
      } else {
        errorToast(result.error || "Failed to delete meal");
      }
      setDeletingId(null);
    });
  };

  if (isLoading) {
    return (
      <div className="modal-bigger relative">
        <Loader label="Loading saved meals..." />
      </div>
    );
  }

  return (
    <div className="modal-bigger">
      <div className="bg-background-600 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6 text-text-low" />
            <div className="text-text-low">
              <h2 className="text-xl font-bold">Manage Saved Meals</h2>
              <p>Search and manage your meal collection</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search meals by name, brand, or ingredients..."
            filteredCount={filteredMeals.length}
            totalCount={savedMeals.length}
            itemLabel="meals"
          />

          {/* Meals List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {savedMeals.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-12 h-12 text-text-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-low mb-2">
                  No Saved Meals
                </h3>
                <p className="text-text-gray text-pretty">
                  You haven&apos;t saved any meals yet. Start by saving your
                  first meal!
                </p>
              </div>
            ) : filteredMeals.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 text-text-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-low mb-2">
                  No Results Found
                </h3>
                <p className="text-text-gray text-pretty">
                  No meals match &quot;{searchQuery}&quot;. Try a different
                  search term.
                </p>
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div key={meal.id} className="space-y-2">
                  <SavedMealCard
                    meal={meal}
                    isSelected={selectedMealId === meal.id}
                    onClick={() =>
                      setSelectedMealId((id) =>
                        id === meal.id ? null : meal.id
                      )
                    }
                    showExpandedDetails={selectedMealId === meal.id}
                  />
                  {selectedMealId === meal.id && (
                    <div className="flex justify-end">
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(meal.id)}
                        disabled={isPending && deletingId === meal.id}
                      >
                        {deletingId === meal.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-divider">
            <Button
              variant="secondary"
              onClick={onCloseModal}
              disabled={isPending}
              className="w-full justify-center"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
