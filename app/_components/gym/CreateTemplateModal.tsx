"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search, Trash2 } from "lucide-react";
import { Exercise } from "../../_types/types";
import { defaultExercises } from "../../../public/exerciseLibrary";
import { createWorkoutTemplateAction } from "../../_lib/gymActions";
import { handleToast } from "../../_utils/utils";
import Button from "../reusable/Button";
import Input from "../reusable/Input";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: () => void;
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onTemplateCreated,
}: CreateTemplateModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load exercises for search
    setExercises(
      defaultExercises.map((ex, index) => ({ ...ex, id: index.toString() }))
    );
  }, []);

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExercise = (exerciseName: string) => {
    if (!selectedExercises.includes(exerciseName)) {
      setSelectedExercises([...selectedExercises, exerciseName]);
    }
    setShowExerciseModal(false);
    setSearchTerm("");
  };

  const removeExercise = (exerciseName: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex !== exerciseName));
  };

  const handleSubmit = async () => {
    if (!templateName.trim()) {
      handleToast({
        success: false,
        error: "Please enter a template name",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      handleToast({
        success: false,
        error: "Please add at least one exercise",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await createWorkoutTemplateAction({
      name: templateName,
      exercises: selectedExercises,
    });

    setIsSubmitting(false);

    if (result.success) {
      handleToast(result);
      setTemplateName("");
      setSelectedExercises([]);
      onTemplateCreated();
      onClose();
    } else {
      handleToast(result);
    }
  };

  const handleClose = () => {
    setTemplateName("");
    setSelectedExercises([]);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-background-600 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-high">
            Create Workout Template
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-background-500 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-text-low mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
              className="w-full px-4 py-3 bg-background-700 border border-background-500 rounded-lg text-text-high placeholder-text-low"
            />
          </div>

          {/* Selected Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-low">
                Exercises ({selectedExercises.length})
              </label>
              <Button
                onClick={() => setShowExerciseModal(true)}
                variant="secondary"
                className="text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto">
              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-text-low">
                  No exercises added yet. Click &quot;Add Exercise&quot; to get
                  started.
                </div>
              ) : (
                selectedExercises.map((exerciseName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-background-700 rounded-lg p-3 border border-background-500"
                  >
                    <span className="text-text-high">{exerciseName}</span>
                    <Button
                      variant="secondary"
                      onClick={() => removeExercise(exerciseName)}
                      className="hover:bg-background-500 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </div>

        {/* Exercise Search Modal */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
            <div className="bg-background-600 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-high">
                  Add Exercise
                </h3>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 hover:bg-background-500 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-low" />
                <Input
                  name="search-exercise"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-10 pr-4 py-2 bg-background-700 text-text-high"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-auto">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise.name)}
                    disabled={selectedExercises.includes(exercise.name)}
                    className="w-full text-left p-3 bg-background-700 hover:bg-background-500 rounded-lg border border-background-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h4 className="font-medium text-text-high">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-text-low">
                      {exercise.category} • {exercise.muscleGroups.join(", ")}
                    </p>
                    {selectedExercises.includes(exercise.name) && (
                      <p className="text-xs text-success mt-1">
                        ✓ Already added
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
