import { Task } from "../_types/types";
import { CardSpecificIcons } from "../utils";

export default function DurationCalculator({ task }: { task: Task }) {
  // Use explicit duration if provided
  let calculatedDuration = task.duration;

  // Only calculate duration from times if no explicit duration and reasonable start time is set
  if (!calculatedDuration && task.startTime) {
    const startTimeInMinutes = task.startTime.hour * 60 + task.startTime.minute;
    const endTimeInMinutes =
      task.dueDate.getHours() * 60 + task.dueDate.getMinutes();

    // Don't show duration for these edge cases:
    // 1. If start time is 00:00 (likely default)
    // 2. If end time is 23:59 (likely default)
    // 3. If duration would be unreasonably long (>12 hours)
    // 4. If start time equals end time
    const isStartTimeDefault = startTimeInMinutes === 0;
    const isEndTimeDefault = endTimeInMinutes === 23 * 60 + 59;
    const startEqualsEnd = startTimeInMinutes === endTimeInMinutes;

    if (
      !isStartTimeDefault &&
      !isEndTimeDefault &&
      !startEqualsEnd &&
      endTimeInMinutes > startTimeInMinutes
    ) {
      const totalMinutes = endTimeInMinutes - startTimeInMinutes;

      // Only show duration if it's reasonable (between 1 minutes and 12 hours)
      if (totalMinutes >= 1 && totalMinutes <= 12 * 60) {
        calculatedDuration = {
          hours: Math.floor(totalMinutes / 60),
          minutes: totalMinutes % 60,
        };
      }
    }
  }

  // Display duration if it exists and has meaningful time
  if (
    calculatedDuration &&
    (calculatedDuration.hours > 0 || calculatedDuration.minutes > 0)
  ) {
    return (
      <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 w-fit">
        <CardSpecificIcons.Time size={14} />
        <span>
          {calculatedDuration.hours > 0 && `${calculatedDuration.hours}h `}
          {calculatedDuration.minutes > 0 && `${calculatedDuration.minutes}m`}
        </span>
      </div>
    );
  }

  return null;
}
