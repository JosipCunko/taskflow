import { format } from "date-fns";
import Input from "./reusable/Input";
import Button from "./reusable/Button";
import type { DayOfWeek } from "../_types/types";
import { infoToast } from "../utils";

interface RepetitionRulesModalProps {
  activeRepetitionType: "interval" | "daysOfWeek" | "timesPerWeek" | "none";
  setActiveRepetitionType: (
    type: "interval" | "daysOfWeek" | "timesPerWeek" | "none"
  ) => void;
  intervalValue: number;
  setIntervalValue: (value: number) => void;
  timesPerWeekValue: number;
  setTimesPerWeekValue: (value: number) => void;
  selectedDaysOfWeek: DayOfWeek[];
  setSelectedDaysOfWeek: (days: DayOfWeek[]) => void;
  repetitionTaskStartDate: Date;
  setRepetitionTaskStartDate: (date: Date) => void;
  onDone: () => void; // Function to call when user clicks "Done" in the modal
}

export default function RepetitionRulesModal({
  activeRepetitionType,
  setActiveRepetitionType,
  intervalValue,
  setIntervalValue,
  timesPerWeekValue,
  setTimesPerWeekValue,
  selectedDaysOfWeek,
  setSelectedDaysOfWeek,
  repetitionTaskStartDate,
  setRepetitionTaskStartDate,
  onDone,
}: RepetitionRulesModalProps) {
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

  return (
    <div className="p-6 bg-background-650 rounded-lg shadow-xl max-w-md w-full mx-auto space-y-6">
      <h3 className="text-xl font-semibold text-text-high text-center mb-4">
        Set Repetition Rules
      </h3>

      <div className="space-y-2">
        <p className="block text-sm font-medium text-text-low">Repeat task:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(["interval", "daysOfWeek", "timesPerWeek"] as const).map((type) => {
            let label = "";
            if (type === "interval") label = "Every X Days";
            else if (type === "daysOfWeek") label = "Specific Days";
            else if (type === "timesPerWeek") label = "X Times/Week";

            return (
              <label
                key={type}
                className={`flex items-center justify-center p-3 rounded-md border cursor-pointer transition-all text-center
                            ${
                              activeRepetitionType === type
                                ? "bg-primary-500 border-primary-600 text-white"
                                : "bg-background-500 border-divider text-text-low hover:border-primary-400"
                            }`}
              >
                <input
                  type="radio"
                  name="repetitionTypeModal" // Unique name for modal context
                  value={type}
                  checked={activeRepetitionType === type}
                  onChange={() => setActiveRepetitionType(type)}
                  className="sr-only"
                />
                <span className="text-sm">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Conditional UI for Interval */}
      {activeRepetitionType === "interval" && (
        <div className="space-y-2 p-3 bg-background-500 rounded-md border border-divider animate-fadeInQuick">
          <label
            htmlFor="modalIntervalValue"
            className="block text-xs font-medium text-text-low"
          >
            Every
          </label>
          <div className="flex items-center gap-2">
            <Input
              name="modalIntervalValue"
              type="number"
              id="modalIntervalValue"
              min="1"
              value={String(intervalValue)}
              onChange={(e) =>
                setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 bg-background-550 text-sm"
            />
            <span className="text-sm text-text-low">days</span>
          </div>
        </div>
      )}

      {/* Conditional UI for Specific Days of Week */}
      {activeRepetitionType === "daysOfWeek" && (
        <div className="space-y-2 p-3 bg-background-500 rounded-md border border-divider animate-fadeInQuick">
          <p className="text-xs font-medium text-text-low mb-1">
            On these days:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(
              (dayLabel, index) => {
                const dayValue = ((index + 1) % 7) as DayOfWeek;
                return (
                  <button
                    type="button"
                    key={dayLabel}
                    onClick={() =>
                      setSelectedDaysOfWeek(
                        selectedDaysOfWeek.includes(dayValue)
                          ? selectedDaysOfWeek.filter((d) => d !== dayValue)
                          : [...selectedDaysOfWeek, dayValue].sort(
                              (a, b) => a - b
                            )
                      )
                    }
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors
                                    ${
                                      selectedDaysOfWeek.includes(dayValue)
                                        ? "bg-primary-500 text-white border-primary-500"
                                        : "bg-background-600 text-text-low border-background-500 hover:border-primary-400"
                                    }`}
                  >
                    {" "}
                    {dayLabel}{" "}
                  </button>
                );
              }
            )}
          </div>
          <p className="text-2xs text-text-gray mt-1">
            Selected:{" "}
            {selectedDaysOfWeek
              .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
              .join(", ") || "None"}
          </p>
        </div>
      )}

      {/* Conditional UI for Times per Week */}
      {activeRepetitionType === "timesPerWeek" && (
        <div className="space-y-2 p-3 bg-background-500 rounded-md border border-divider animate-fadeInQuick">
          <label
            htmlFor="modalTimesPerWeekValue"
            className="block text-xs font-medium text-text-low"
          >
            Occur this many times per week (any day):
          </label>
          <Input
            type="number"
            name="modalTimesPerWeekValue"
            id="modalTimesPerWeekValue"
            min="1"
            max="7"
            value={String(timesPerWeekValue)}
            onChange={(e) =>
              setTimesPerWeekValue(
                Math.max(1, Math.min(7, parseInt(e.target.value) || 1))
              )
            }
            className="w-20 bg-background-550  text-sm"
          />
        </div>
      )}

      {/* Repetition Start Date - common if any repetition type is active */}
      {activeRepetitionType !== "none" && (
        <div className="pt-3 border-t border-divider">
          <label
            htmlFor="modalRepetitionStartDate"
            className="block text-sm font-medium text-text-low mb-1"
          >
            Start repeating on
          </label>
          <Input
            name="modalRepetitionStartDate"
            type="date"
            id="modalRepetitionStartDate"
            value={format(repetitionTaskStartDate, "yyyy-MM-dd")}
            onChange={(e) =>
              setRepetitionTaskStartDate(new Date(e.target.value + "T00:00:00"))
            }
            className="w-full bg-background-550 border-divider text-sm"
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="primary" onClick={handleDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
