import { endOfWeek, format, startOfWeek } from "date-fns";
import Input from "./reusable/Input";
import Button from "./reusable/Button";
import type { DayOfWeek } from "../_types/types";
import { formatDate, infoToast, MONDAY_START_OF_WEEK } from "../_utils/utils";
import { Plus, Minus } from "lucide-react";

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

// Component for increment/decrement controls
function NumberControl({
  label,
  value,
  setValue,
  min = 1,
  max = 30,
  suffix = "",
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-low">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="p-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 transition-colors"
          disabled={value <= min}
        >
          <Minus size={16} className="text-primary-500" />
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-text-high">{value}</span>
          {suffix && <span className="text-xs text-text-gray">{suffix}</span>}
        </div>

        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          className="p-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 transition-colors"
          disabled={value >= max}
        >
          <Plus size={16} className="text-primary-500" />
        </button>
      </div>

      {/* Range slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="w-full h-2 bg-background-500 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, var(--color-primary-500) 0%, var(--color-primary-500) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-background-500) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-background-500) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-text-gray mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
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
    <div className="bg-background-650 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto min-w-[24rem] flex flex-col max-h-[90vh] sm:max-h-[85vh]">
      {/* Fixed Header */}
      <div className="text-center p-4 sm:p-6 border-b border-divider/20 flex-shrink-0">
        <h3 className="text-xl sm:text-2xl font-bold text-text-high mb-2">
          Set Repetition Rules
        </h3>
        <p className="text-text-low text-sm sm:text-base">
          Choose how often this task should repeat
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
        {/* Repetition Type Selection */}
        <div className="space-y-4">
          <p className="text-lg font-semibold text-text-high">Repeat Pattern</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {(["interval", "daysOfWeek", "timesPerWeek"] as const).map(
              (type) => {
                let label = "";
                let description = "";
                if (type === "interval") {
                  label = "Every X Days";
                  description = "Repeat every few days";
                } else if (type === "daysOfWeek") {
                  label = "Specific Days";
                  description = "Certain days of week";
                } else if (type === "timesPerWeek") {
                  label = "X Times/Week";
                  description = "Flexible weekly goal";
                }

                return (
                  <label
                    key={type}
                    className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all text-center group
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
                    <span className="text-base font-semibold mb-1">
                      {label}
                    </span>
                    <span className="text-xs opacity-80">{description}</span>
                  </label>
                );
              }
            )}
          </div>
        </div>

        {/* Conditional Configuration */}
        {activeRepetitionType === "interval" && (
          <div className="p-4 sm:p-6 bg-background-500/50 rounded-xl animate-fadeInQuick">
            <NumberControl
              label="Repeat every"
              value={intervalValue}
              setValue={setIntervalValue}
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
                        setSelectedDaysOfWeek(
                          selectedDaysOfWeek.includes(dayValue)
                            ? selectedDaysOfWeek.filter((d) => d !== dayValue)
                            : [...selectedDaysOfWeek, dayValue].sort(
                                (a, b) => a - b
                              )
                        )
                      }
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all text-sm font-medium
                                ${
                                  isSelected
                                    ? "border-primary-500 text-white shadow-lg transform scale-105"
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
              setValue={setTimesPerWeekValue}
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

        {/* Start Date */}
        {activeRepetitionType !== "none" && (
          <div className="pt-2 sm:pt-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-text-high mb-1">
                  Start Date
                </p>
                <p className="text-sm text-text-low">
                  {activeRepetitionType === "daysOfWeek" ||
                  activeRepetitionType === "timesPerWeek"
                    ? "In which week should this task be completed?"
                    : "When should this task start repeating on?"}
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <Input
                  name="modalRepetitionStartDate"
                  type="date"
                  id="modalRepetitionStartDate"
                  value={format(repetitionTaskStartDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    // Create date with local timezone to avoid timezone shifts
                    const [year, month, day] = e.target.value
                      .split("-")
                      .map(Number);
                    const localDate = new Date(
                      year,
                      month - 1,
                      day,
                      0,
                      0,
                      0,
                      0
                    );
                    setRepetitionTaskStartDate(localDate);
                  }}
                  className="w-full bg-background-550 text-center text-base sm:text-lg py-3 rounded-xl"
                />
                {activeRepetitionType === "timesPerWeek" && (
                  <p className="text-sm text-text-gray ml-2">
                    Week from{" "}
                    {formatDate(
                      startOfWeek(repetitionTaskStartDate, MONDAY_START_OF_WEEK)
                    )}
                    {" - "}
                    {formatDate(
                      endOfWeek(repetitionTaskStartDate, MONDAY_START_OF_WEEK)
                    )}
                  </p>
                )}
              </div>
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
