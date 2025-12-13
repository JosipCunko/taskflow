"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Exercise } from "../../_types/types";
import { defaultExercises } from "../../../public/exerciseLibrary";
import { createWorkoutTemplateAction } from "../../_lib/fitnessActions";
import { handleToast } from "../../_utils/utils";
import Button from "../reusable/Button";
import Input from "../reusable/Input";
import Search from "../reusable/Search";

interface CreateTemplateModalProps {
  onCloseModal?: () => void;
  onTemplateCreated: () => void;
}

export default function CreateTemplateModal({
  onCloseModal,
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
      handleClose();
    } else {
      handleToast(result);
    }
  };

  const handleClose = () => {
    setTemplateName("");
    setSelectedExercises([]);
    setSearchTerm("");
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="modal-bigger">
      <div className="bg-background-600 rounded-2xl p-6 h-full flex flex-col">
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

        <div className="gap-6 flex flex-col flex-1">
          <div>
            <label className="block text-sm font-medium text-text-low mb-2">
              Template Name
            </label>
            <Input
              name="template-name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
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
        </div>

        <div className="flex gap-3 mt-6">
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

        {/* Exercise Search Modal */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black/50 rounded-2xl flex items-center justify-center p-4 z-[60]">
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

              <Search
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search exercises..."
                filteredCount={filteredExercises.length}
                totalCount={exercises.length}
                itemLabel="exercises"
              />

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
