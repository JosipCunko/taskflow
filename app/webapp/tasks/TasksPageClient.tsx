"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartColumn,
  Repeat,
  Clock,
  Filter,
  X,
  Calendar as CalendarIcon,
  Zap,
  Bell,
  AlertTriangle,
  Palette,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Task } from "@/app/_types/types";
import TaskCard from "@/app/_components/TaskCard";
import RepeatingTaskCard from "@/app/_components/RepeatingTaskCard";
import Modal from "@/app/_components/Modal";
import DateInput from "@/app/_components/reusable/DateInput";
import Button from "@/app/_components/reusable/Button";
import { TASK_ICONS } from "@/app/_utils/icons";
import { colorsColorPicker, getDayName } from "@/app/_utils/utils";
import { DayOfWeek } from "@/app/_types/types";

interface TaskFilters {
  dueBefore: number | null;
  priority: boolean | null;
  reminder: boolean | null;
  repeating: boolean | null;
  risk: boolean | null;
  icon: string | null;
  color: string | null;
  // Advanced repeating filters
  timesPerWeek: number | null;
  interval: number | null;
  daysOfWeek: DayOfWeek[];
}

const initialFilters: TaskFilters = {
  dueBefore: null,
  priority: null,
  reminder: null,
  repeating: null,
  risk: null,
  icon: null,
  color: null,
  timesPerWeek: null,
  interval: null,
  daysOfWeek: [],
};

export default function TasksPageClient({ tasks }: { tasks: Task[] }) {
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Filter state for icon/color modal
  const [selectedIconFilter, setSelectedIconFilter] = useState<string | null>(
    null
  );
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(
    null
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "daysOfWeek") return (value as DayOfWeek[]).length > 0;
      return value !== null;
    });
  }, [filters]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    if (!hasActiveFilters) return [];

    return tasks.filter((task) => {
      // Due date filter
      if (filters.dueBefore !== null) {
        if (task.dueDate >= filters.dueBefore) return false;
      }

      // Priority filter
      if (filters.priority !== null) {
        if (task.isPriority !== filters.priority) return false;
      }

      // Reminder filter
      if (filters.reminder !== null) {
        if (task.isReminder !== filters.reminder) return false;
      }

      // Repeating filter
      if (filters.repeating !== null) {
        if (task.isRepeating !== filters.repeating) return false;
      }

      // Risk filter
      if (filters.risk !== null) {
        if (task.risk !== filters.risk) return false;
      }

      // Icon filter
      if (filters.icon !== null) {
        if (task.icon !== filters.icon) return false;
      }

      // Color filter
      if (filters.color !== null) {
        if (task.color !== filters.color) return false;
      }

      // Advanced repeating filters (only for repeating tasks)
      if (task.isRepeating && task.repetitionRule) {
        // Times per week filter
        if (filters.timesPerWeek !== null) {
          if (task.repetitionRule.timesPerWeek !== filters.timesPerWeek)
            return false;
        }

        // Interval filter
        if (filters.interval !== null) {
          if (task.repetitionRule.interval !== filters.interval) return false;
        }

        // Days of week filter
        if (filters.daysOfWeek.length > 0) {
          const hasMatchingDay = filters.daysOfWeek.some((day) =>
            task.repetitionRule!.daysOfWeek.includes(day)
          );
          if (!hasMatchingDay) return false;
        }
      }

      return true;
    });
  }, [tasks, filters, hasActiveFilters]);

  // Split filtered tasks if no filters applied
  const regularTasks = tasks.filter(
    (task) => !task.isRepeating && task.status !== "completed"
  );
  const repeatingTasks = tasks.filter((task) => task.isRepeating);

  const clearAllFilters = () => {
    setFilters({ ...initialFilters });
    setSelectedIconFilter(null);
    setSelectedColorFilter(null);
  };

  const clearFilter = (key: keyof TaskFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "daysOfWeek" ? [] : initialFilters[key],
    }));
    if (key === "icon") setSelectedIconFilter(null);
    if (key === "color") setSelectedColorFilter(null);
  };

  const toggleBooleanFilter = (key: "priority" | "reminder" | "risk") => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === null ? true : prev[key] === true ? false : null,
    }));
  };

  const toggleRepeatingFilter = () => {
    setFilters((prev) => ({
      ...prev,
      repeating:
        prev.repeating === null ? true : prev.repeating === true ? false : null,
    }));
  };

  const toggleDayOfWeek = (day: DayOfWeek) => {
    setFilters((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const applyIconColorFilter = () => {
    setFilters((prev) => ({
      ...prev,
      icon: selectedIconFilter,
      color: selectedColorFilter,
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "daysOfWeek" && value.length > 0) count++;
      else if (key !== "daysOfWeek" && value !== null) count++;
    });
    return count;
  };

  return (
    <div className="container mx-auto p-1 sm:p-6 max-h-full overflow-auto">
      {/* Header with Filter Toggle */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <ChartColumn className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Your tasks</span>
        </h1>

        <Button
          variant="primary"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="relative"
        >
          <Filter className="w-5 h-5" />
          Filter
          {getActiveFilterCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-br from-background-700 via-background-650 to-background-600 rounded-xl p-6 border border-primary-500/20 shadow-xl">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Due Before Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Due Before
                  </label>
                  <DateInput
                    date={filters.dueBefore || Date.now()}
                    setDate={(date) =>
                      setFilters((prev) => ({ ...prev, dueBefore: date }))
                    }
                    disableDaysBefore={false}
                    className="z-[60]"
                  >
                    <div className="bg-background-500 border border-primary-500/30 rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-colors flex items-center justify-between">
                      <span className="text-text-high text-sm">
                        {filters.dueBefore
                          ? new Date(filters.dueBefore).toLocaleDateString()
                          : "Select date"}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-primary-500" />
                    </div>
                  </DateInput>
                  {filters.dueBefore && (
                    <ClearFilterButton
                      onClear={() => clearFilter("dueBefore")}
                    />
                  )}
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Priority
                  </label>
                  <button
                    onClick={() => toggleBooleanFilter("priority")}
                    className={`w-full bg-background-500 border rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-all ${
                      filters.priority === true
                        ? "border-orange-500 bg-orange-500/10"
                        : filters.priority === false
                        ? "border-gray-500 bg-gray-500/10"
                        : "border-primary-500/30"
                    }`}
                  >
                    <span className="text-text-high text-sm">
                      {filters.priority === true
                        ? "Priority Only"
                        : filters.priority === false
                        ? "Non-Priority Only"
                        : "All"}
                    </span>
                  </button>
                </div>

                {/* Reminder Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Reminder
                  </label>
                  <button
                    onClick={() => toggleBooleanFilter("reminder")}
                    className={`w-full bg-background-500 border rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-all ${
                      filters.reminder === true
                        ? "border-purple-500 bg-purple-500/10"
                        : filters.reminder === false
                        ? "border-gray-500 bg-gray-500/10"
                        : "border-primary-500/30"
                    }`}
                  >
                    <span className="text-text-high text-sm">
                      {filters.reminder === true
                        ? "With Reminder"
                        : filters.reminder === false
                        ? "Without Reminder"
                        : "All"}
                    </span>
                  </button>
                </div>

                {/* Repeating Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <Repeat className="w-4 h-4 mr-2" />
                    Task Type
                  </label>
                  <button
                    onClick={toggleRepeatingFilter}
                    className={`w-full bg-background-500 border rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-all ${
                      filters.repeating === true
                        ? "border-blue-500 bg-blue-500/10"
                        : filters.repeating === false
                        ? "border-green-500 bg-green-500/10"
                        : "border-primary-500/30"
                    }`}
                  >
                    <span className="text-text-high text-sm">
                      {filters.repeating === true
                        ? "Repeating Only"
                        : filters.repeating === false
                        ? "Regular Only"
                        : "All"}
                    </span>
                  </button>
                </div>

                {/* Risk Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Risk
                  </label>
                  <button
                    onClick={() => toggleBooleanFilter("risk")}
                    className={`w-full bg-background-500 border rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-all ${
                      filters.risk === true
                        ? "border-red-500 bg-red-500/10"
                        : filters.risk === false
                        ? "border-gray-500 bg-gray-500/10"
                        : "border-primary-500/30"
                    }`}
                  >
                    <span className="text-text-high text-sm">
                      {filters.risk === true
                        ? "At Risk Only"
                        : filters.risk === false
                        ? "Not At Risk"
                        : "All"}
                    </span>
                  </button>
                </div>

                {/* Icon & Color Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-low flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Icon & Color
                  </label>
                  <Modal>
                    <Modal.Open opens="icon-color-filter">
                      <button className="w-full bg-background-500 border border-primary-500/30 rounded-lg p-3 cursor-pointer hover:bg-background-400 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {filters.icon && (
                            <div className="flex items-center gap-1">
                              {(() => {
                                const iconData = TASK_ICONS.find(
                                  (i) => i.id === filters.icon
                                );
                                if (iconData) {
                                  const IconComponent = iconData.icon;
                                  return (
                                    <IconComponent className="w-4 h-4 text-text-high" />
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                          {filters.color && (
                            <div
                              className="w-4 h-4 rounded-full border border-primary-500/30"
                              style={{ backgroundColor: filters.color }}
                            />
                          )}
                          <span className="text-text-high text-sm">
                            {filters.icon || filters.color ? "" : "Select..."}
                          </span>
                        </div>
                        <Palette className="w-4 h-4 text-primary-500" />
                      </button>
                    </Modal.Open>
                    <Modal.Window name="icon-color-filter">
                      <IconColorFilterModal
                        selectedIcon={selectedIconFilter}
                        setSelectedIcon={setSelectedIconFilter}
                        selectedColor={selectedColorFilter}
                        setSelectedColor={setSelectedColorFilter}
                        onApply={applyIconColorFilter}
                      />
                    </Modal.Window>
                  </Modal>
                  {(filters.icon || filters.color) && (
                    <div className="flex gap-2">
                      {filters.icon && (
                        <ClearFilterButton
                          onClear={() => clearFilter("icon")}
                          label="Icon"
                        />
                      )}
                      {filters.color && (
                        <ClearFilterButton
                          onClear={() => clearFilter("color")}
                          label="Color"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Filters for Repeating Tasks */}
              <div className="mt-4 border-t border-primary-500/20 pt-4">
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex items-center text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors mb-3"
                >
                  {isAdvancedOpen ? (
                    <ChevronUp className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  Advanced Repeating Task Filters
                </button>

                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden"
                    >
                      {/* Times Per Week Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-low">
                          Times Per Week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          placeholder="e.g., 3"
                          value={filters.timesPerWeek || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setFilters((prev) => ({
                              ...prev,
                              timesPerWeek:
                                e.target.value && value > 0 ? value : null,
                            }));
                          }}
                          className="w-full bg-background-500 border border-primary-500/30 rounded-lg p-3 text-text-high text-sm focus:border-primary-500 focus:outline-none"
                        />
                        {filters.timesPerWeek && (
                          <ClearFilterButton
                            onClear={() => clearFilter("timesPerWeek")}
                          />
                        )}
                      </div>

                      {/* Interval Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-low">
                          Interval (days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g., 7"
                          value={filters.interval || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setFilters((prev) => ({
                              ...prev,
                              interval:
                                e.target.value && value > 0 ? value : null,
                            }));
                          }}
                          className="w-full bg-background-500 border border-primary-500/30 rounded-lg p-3 text-text-high text-sm focus:border-primary-500 focus:outline-none"
                        />
                        {filters.interval && (
                          <ClearFilterButton
                            onClear={() => clearFilter("interval")}
                          />
                        )}
                      </div>

                      {/* Days of Week Filter */}
                      <div className="space-y-2 md:col-span-2 lg:col-span-1">
                        <label className="text-sm font-medium text-text-low">
                          Days of Week
                        </label>
                        <div className="flex gap-1 overflow-x-auto">
                          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                            <button
                              key={day}
                              onClick={() => toggleDayOfWeek(day)}
                              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                filters.daysOfWeek.includes(day)
                                  ? "bg-primary-500 text-white"
                                  : "bg-background-500 text-text-low hover:bg-background-400"
                              }`}
                            >
                              {getDayName(day).slice(0, 3)}
                            </button>
                          ))}
                        </div>
                        {filters.daysOfWeek.length > 0 && (
                          <ClearFilterButton
                            onClear={() => clearFilter("daysOfWeek")}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Clear All Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <ClearFilterButton
                    className="flex items-center gap-2"
                    onClear={clearAllFilters}
                    label="All Filters"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.dueBefore && (
            <FilterChip
              label={`Due before ${new Date(
                filters.dueBefore
              ).toLocaleDateString()}`}
              onClear={() => clearFilter("dueBefore")}
            />
          )}
          {filters.priority !== null && (
            <FilterChip
              label={filters.priority ? "Priority" : "Non-Priority"}
              onClear={() => clearFilter("priority")}
            />
          )}
          {filters.reminder !== null && (
            <FilterChip
              label={filters.reminder ? "With Reminder" : "Without Reminder"}
              onClear={() => clearFilter("reminder")}
            />
          )}
          {filters.repeating !== null && (
            <FilterChip
              label={filters.repeating ? "Repeating" : "Regular"}
              onClear={() => clearFilter("repeating")}
            />
          )}
          {filters.risk !== null && (
            <FilterChip
              label={filters.risk ? "At Risk" : "Not At Risk"}
              onClear={() => clearFilter("risk")}
            />
          )}
          {filters.icon && (
            <FilterChip
              label="Icon Filter"
              onClear={() => clearFilter("icon")}
            />
          )}
          {filters.color && (
            <FilterChip
              label="Color Filter"
              onClear={() => clearFilter("color")}
            />
          )}
          {filters.timesPerWeek && (
            <FilterChip
              label={`${filters.timesPerWeek}x per week`}
              onClear={() => clearFilter("timesPerWeek")}
            />
          )}
          {filters.interval && (
            <FilterChip
              label={`Every ${filters.interval} days`}
              onClear={() => clearFilter("interval")}
            />
          )}
          {filters.daysOfWeek.length > 0 && (
            <FilterChip
              label={`${filters.daysOfWeek.length} day(s) selected`}
              onClear={() => clearFilter("daysOfWeek")}
            />
          )}
        </div>
      )}

      {/* Tasks Display */}
      {hasActiveFilters ? (
        // Filtered view - combine all tasks
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
              <Filter className="w-5 h-5 mr-2 text-primary-500" />
              Filtered Tasks ({filteredTasks.length})
            </h2>
          </div>

          <div className="p-1 sm:p-6 text-center text-text-low">
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task, idx) =>
                  task.isRepeating ? (
                    <RepeatingTaskCard key={task.id} task={task} />
                  ) : (
                    <TaskCard key={task.id} task={task} index={idx} />
                  )
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Filter className="w-16 h-16 text-text-gray/50 mb-4" />
                <p className="text-text-gray text-lg">
                  No tasks match your filters.
                </p>
                <Button
                  variant="primary"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Default view - separate regular and repeating
        <>
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
                <Clock className="w-5 h-5 mr-2 text-primary-500" />
                Regular Tasks ({regularTasks.length})
              </h2>
            </div>

            <div className="p-1 sm:p-6 text-center text-text-low">
              {regularTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularTasks.map((task, idx) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                </div>
              ) : (
                <p className="text-text-gray">
                  No regular tasks found. Create a new task to get started.
                </p>
              )}
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-low flex items-center mb-4">
                <Repeat className="w-5 h-5 mr-2 text-primary-500" />
                Repeating Tasks ({repeatingTasks.length})
              </h2>
              <p className="text-sm text-text-low">
                These tasks repeat automatically based on your schedule
              </p>
            </div>

            <div className="p-1 sm:p-6 text-center text-text-low">
              {repeatingTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {repeatingTasks.map((task) => (
                    <RepeatingTaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-text-gray">
                  No repeating tasks found. Create a repeating task to automate
                  your routine.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ClearFilterButton({
  onClear,
  label,
  className,
}: {
  onClear: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button variant="danger" onClick={onClear} className={className}>
      <X className="w-4 h-4" />
      Clear {label}
    </Button>
  );
}
function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/50 rounded-full text-sm text-primary-300"
    >
      <span>{label}</span>
      <button
        onClick={onClear}
        className="hover:bg-primary-500/30 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// Icon & Color Filter Modal Component
function IconColorFilterModal({
  selectedIcon,
  setSelectedIcon,
  selectedColor,
  setSelectedColor,
  onApply,
  onCloseModal,
}: {
  selectedIcon: string | null;
  setSelectedIcon: (icon: string | null) => void;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  onApply: () => void;
  onCloseModal?: () => void;
}) {
  return (
    <div className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-text-high mb-6">
        Filter by Icon & Color
      </h2>

      {/* Icon Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-low mb-3">
          Select Icon
        </label>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-4">
          {TASK_ICONS.map((icon) => (
            <button
              key={icon.id}
              onClick={() =>
                setSelectedIcon(selectedIcon === icon.id ? null : icon.id)
              }
              className={`w-10 h-10 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all hover:scale-110 grid place-items-center ${
                selectedIcon === icon.id
                  ? "ring-2 ring-primary-500 bg-primary-500/20"
                  : "bg-background-500 hover:bg-background-400"
              }`}
            >
              <icon.icon className="w-5 h-5 text-text-high" />
            </button>
          ))}
        </div>
        {selectedIcon && (
          <ClearFilterButton
            onClear={() => setSelectedIcon(null)}
            label="Icon"
          />
        )}
      </div>

      {/* Color Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-low mb-3">
          Select Color
        </label>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-4">
          {colorsColorPicker.map((color) => (
            <button
              key={color}
              onClick={() =>
                setSelectedColor(selectedColor === color ? null : color)
              }
              className={`w-10 h-10 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all hover:scale-110 ${
                selectedColor === color
                  ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                  : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {selectedColor && (
          <ClearFilterButton
            onClear={() => setSelectedColor(null)}
            label="Color"
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onApply();
            onCloseModal?.();
          }}
        >
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
