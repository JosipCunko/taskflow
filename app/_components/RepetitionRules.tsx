import Button from "./reusable/Button";
import NumberControl from "./reusable/NumberControl";
import type { DayOfWeek } from "../_types/types";
import { infoToast } from "../_utils/utils";
import { Dispatch } from "react";
import { Action } from "./AddTask";

interface RepetitionRulesProps {
  activeRepetitionType: "interval" | "daysOfWeek" | "timesPerWeek" | "none";
  setActiveRepetitionType: (
    type: "interval" | "daysOfWeek" | "timesPerWeek" | "none"
  ) => void;
  dispatch: Dispatch<Action>;
  intervalValue: number;
  timesPerWeekValue: number;
  selectedDaysOfWeek: DayOfWeek[];
  onDone: () => void; // Function to call when user clicks "Done" in the modal
}

export default function RepetitionRules({
  dispatch,
  activeRepetitionType,
  setActiveRepetitionType,
  intervalValue,
  timesPerWeekValue,
  selectedDaysOfWeek,
  onDone,
}: RepetitionRulesProps) {
  const handleDone = () => {
    if (
      activeRepetitionType === "daysOfWeek" &&
      selectedDaysOfWeek.length === 0
    ) {
      infoToast(
        "Please select at least one day for 'Specific Days' repetition."
      );
      return;
    }
    onDone();
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayLabelsLong = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="bg-background-650 rounded-2xl w-[22rem] sm:w-[26rem] flex flex-col h-[90vh] sm:h-[65vh] px-4 overflow-y-auto overflow-x-hidden mx-auto">
      <div className="text-center p-4 sm:p-6 flex-shrink-0">
        <h3 className="text-xl sm:text-2xl font-bold text-text-high mb-2">
          Set Repetition Rules
        </h3>
        <p className="text-text-low text-sm sm:text-base">
          Choose how often this task should repeat
        </p>
      </div>

      <div className="flex-1 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {(["interval", "daysOfWeek", "timesPerWeek"] as const).map((type) => {
            let label = "";
            let description = "";
            if (type === "interval") {
              label = "Every X Days";
              description = "Every few days";
            } else if (type === "daysOfWeek") {
              label = "Specific Days";
              description = "Days of the week";
            } else if (type === "timesPerWeek") {
              label = "X Times/Week";
              description = "Weekly goal";
            }

            return (
              <label
                key={type}
                className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all text-center text-nowrap group
                            ${
                              activeRepetitionType === type
                                ? "bg-primary-500/10 border-primary-500 text-primary-500"
                                : "bg-background-500 border-background-700 text-text-low hover:border-primary-400 hover:bg-background-450"
                            }`}
              >
                <input
                  type="radio"
                  name="repetitionTypeModal"
                  value={type}
                  checked={activeRepetitionType === type}
                  onChange={() => setActiveRepetitionType(type)}
                  className="sr-only"
                />
                <span className="text-base text-nowrap font-semibold mb-1">
                  {label}
                </span>
                <span className="text-xs opacity-80">{description}</span>
              </label>
            );
          })}
        </div>

        {activeRepetitionType === "interval" && (
          <div className="p-4 sm:p-6 bg-background-500/50 rounded-xl animate-fadeInQuick">
            <NumberControl
              label="Repeat every"
              value={intervalValue}
              setValue={(interval) =>
                dispatch({ type: "interval", payload: interval })
              }
              min={1}
              max={30}
              suffix={intervalValue === 1 ? "day" : "days"}
            />
          </div>
        )}

        {activeRepetitionType === "daysOfWeek" && (
          <div className="p-4 sm:p-6 bg-background-500/50 rounded-xl animate-fadeInQuick">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-text-high mb-2">
                  Select Days
                </p>
                <p className="text-sm text-text-low">
                  Choose which days of the week
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map((dayLabel, index) => {
                  const dayValue = (index % 7) as DayOfWeek;
                  const isSelected = selectedDaysOfWeek.includes(dayValue);
                  return (
                    <button
                      type="button"
                      key={dayLabel}
                      onClick={() =>
                        dispatch({
                          type: "selectedDaysOfWeek",
                          payload: selectedDaysOfWeek.includes(dayValue)
                            ? selectedDaysOfWeek.filter((d) => d !== dayValue)
                            : [...selectedDaysOfWeek, dayValue].sort(
                                (a, b) => a - b
                              ),
                        })
                      }
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all text-sm font-medium
                                ${
                                  isSelected
                                    ? "border-primary-500 text-white transform scale-105"
                                    : "bg-background-600 text-text-low border-background-700 hover:border-primary-400 hover:bg-background-550"
                                }`}
                      style={{
                        backgroundColor: isSelected
                          ? "var(--color-primary-500)"
                          : undefined,
                        borderColor: isSelected
                          ? "var(--color-primary-500)"
                          : undefined,
                      }}
                    >
                      <span className="text-xs mb-1">{dayLabel}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? "bg-white" : "bg-text-gray"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-sm text-text-gray">
                  {selectedDaysOfWeek.length > 0
                    ? "You can completed the task on: " +
                      selectedDaysOfWeek.map((d) => dayLabelsLong[d]).join(", ")
                    : "Selected: None"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeRepetitionType === "timesPerWeek" && (
          <div className="p-4 sm:p-6 bg-background-500/50 rounded-xl animate-fadeInQuick">
            <NumberControl
              label="Complete this many times per week"
              value={timesPerWeekValue}
              setValue={(timesPerWeek) =>
                dispatch({ type: "timesPerWeek", payload: timesPerWeek })
              }
              min={1}
              max={7}
              suffix={timesPerWeekValue === 1 ? "time" : "times"}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-text-gray">
                You can complete this task on any day of the week
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 border-t border-divider/20 flex-shrink-0">
        <div className="flex justify-end">
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
