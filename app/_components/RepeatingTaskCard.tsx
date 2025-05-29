"use client";
import { useState } from "react";
import {
  Check,
  RotateCcw,
  CalendarClock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import type { Task } from "@/app/_types/types";
import {
  format,
  isToday as checkIsTodayDateFns,
  getDay,
  isAfter,
  isBefore,
} from "date-fns";
// Assuming you'll have a server action for this
import { completeRepeatingTaskInstanceAction } from "@/app/_lib/actions";
import { toast } from "react-hot-toast";
import { DayOfWeek } from "../_types/types";
import { getTaskIconByName } from "../utils";

// This prop includes the pre-calculated details from the server component
interface RepeatingTaskCardProps {
  task: Task & {
    // Task here includes the extra display properties
    currentInstanceStatus:
      | "pending"
      | "completed"
      | "missed"
      | "not_due_today"
      | "fully_completed_for_period";
    displayOccurrences: Date[];
  };
}

export default function RepeatingTaskCard({ task }: RepeatingTaskCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MainIcon = getTaskIconByName(task.icon);

  const handleCompleteInstance = async () => {
    if (task.currentInstanceStatus !== "pending") {
      toast.error(
        "This task instance is not currently pending or is not due today."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await completeRepeatingTaskInstanceAction(
        task.id,
        new Date()
      ); // Server action takes today's date
      if (result.success) {
        toast.success(result.message || "Instance marked complete!");
        // Optimistic update or re-fetch might be needed depending on UX
      } else {
        toast.error(result.error || "Failed to complete instance.");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRepetitionText = (rule: Task["repetitionRule"]) => {
    if (!rule) return "Not repeating";
    switch (rule.frequency) {
      case "daily":
        return "Repeats daily";
      case "weekly":
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          const days = rule.daysOfWeek
            .map(
              (d: number) =>
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
            )
            .join(", ");
          return `Weekly on ${days}`;
        }
        if (rule.timesPerWeek) return `Repeats ${rule.timesPerWeek}x per week`;
        return "Repeats weekly";
      // ... other cases
      default:
        return "Custom repetition";
    }
  };

  // Check if today is one of the *potential* scheduled days based on rule (not checking completions here)
  const isScheduledForToday = () => {
    if (
      !task.repetitionRule ||
      !task.startDate ||
      (task.endDate && isBefore(new Date(), task.startDate))
    )
      return false;
    if (task.endDate && isAfter(new Date(), task.endDate)) return false;

    switch (task.repetitionRule.frequency) {
      case "daily":
        return true;
      case "weekly":
        if (task.repetitionRule.daysOfWeek)
          return task.repetitionRule.daysOfWeek.includes(
            getDay(new Date()) as DayOfWeek
          );
        if (task.repetitionRule.timesPerWeek) return true; // Potentially due any day this week
        break;
      // Add other frequencies
    }
    return false;
  };

  const todayIsScheduled = isScheduledForToday();

  return (
    <div
      className="p-4 bg-background-625 rounded-lg shadow-md border-l-4"
      style={{ borderColor: task.color || "var(--color-divider)" }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <MainIcon
            size={20}
            className="mt-0.5 flex-shrink-0"
            style={{ color: task.color || "var(--color-text-low)" }}
          />
          <div>
            <h3 className="text-base font-semibold text-text-high">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-text-medium mt-0.5">
                {task.description}
              </p>
            )}
            <p className="text-xs text-primary-400/80 mt-1 italic">
              {getRepetitionText(task.repetitionRule)}
            </p>
          </div>
        </div>
        {/* Action Button for today's instance */}
        {todayIsScheduled && task.currentInstanceStatus === "pending" && (
          <button
            onClick={handleCompleteInstance}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-primary-500/20 text-primary-400 transition-colors disabled:opacity-50"
            title="Mark as complete for today"
          >
            {isSubmitting ? (
              <RotateCcw size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
          </button>
        )}
        {todayIsScheduled && task.currentInstanceStatus === "completed" && (
          <div
            className="flex items-center gap-1 text-green-400 p-2 text-sm"
            title="Completed for today"
          >
            <CheckCircle2 size={18} /> Done
          </div>
        )}
        {todayIsScheduled &&
          task.currentInstanceStatus === "fully_completed_for_period" && (
            <div
              className="flex items-center gap-1 text-blue-400 p-2 text-sm"
              title="All occurrences for this period are complete"
            >
              <Zap size={18} /> All Done
            </div>
          )}
        {(!todayIsScheduled ||
          task.currentInstanceStatus === "not_due_today") &&
          !task.displayOccurrences.find((d) => checkIsTodayDateFns(d)) && (
            <div
              className="flex items-center gap-1 text-text-medium p-2 text-sm"
              title="Not scheduled for today"
            >
              <CalendarClock size={18} />
            </div>
          )}

        {/* <button title="Edit Task" className="p-1 text-text-low hover:text-primary-400"><Edit3 size={16} /></button> */}
      </div>

      {/* Display next few occurrences */}
      {task.displayOccurrences && task.displayOccurrences.length > 0 && (
        <div className="mt-3 pt-3 border-t border-divider/50">
          <p className="text-xs font-medium text-text-low mb-1.5">Upcoming:</p>
          <div className="flex flex-wrap gap-1.5">
            {task.displayOccurrences.map((date: Date, index: number) => (
              <span
                key={index}
                className="text-xs bg-background-500 text-text-medium px-2 py-0.5 rounded-full"
              >
                {format(date, "MMM d")}
                {checkIsTodayDateFns(date) && " (Today)"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
