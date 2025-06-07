import { Task } from "../_types/types";
import { CardSpecificIcons } from "../utils";

export default function DurationCalculator({ task }: { task: Task }) {
  // Calculate duration if not provided in task object
  let calculatedDuration = task.duration;

  if (!calculatedDuration && task.startTime) {
    const startTimeInMinutes = task.startTime.hour * 60 + task.startTime.minute;
    const endTimeInMinutes =
      task.dueDate.getHours() * 60 + task.dueDate.getMinutes();

    if (endTimeInMinutes > startTimeInMinutes) {
      const totalMinutes = endTimeInMinutes - startTimeInMinutes;

      if (totalMinutes < 20 * 60) {
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
