import { format } from "date-fns";
import { CardSpecificIcons, getTaskIconByName } from "../utils";
import { Task } from "../_types/types";

export default function TaskCardSmall({ task }: { task: Task }) {
  const IconComponent = getTaskIconByName(task.icon);
  return (
    <li
      className="flex items-start space-x-3 p-3 mb-3 bg-background-700 rounded-md shadow hover:shadow-lg hover:bg-background-625 transition-all cursor-default"
      style={{
        borderLeft: `4px solid ${task.color}`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComponent
          className="w-5 h-5"
          style={{ color: task.color || "var(--color-text-medium)" }}
        />
      </div>
      <div>
        <h4 className="font-semibold text-text-high">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-text-low mt-1">{task.description}</p>
        )}

        {task.startTime && (
          <p className="text-xs text-text-gray mt-1">
            {task.startTime.hour}:{task.startTime.minute}
          </p>
        )}
        {task.dueDate && (
          <p className="text-xs text-text-gray mt-1">
            {format(task.dueDate, "p")}
          </p>
        )}
        {task.duration && (
          <span className="mt-2 text-xs flex items-center gap-1.5 ">
            <CardSpecificIcons.Time size={12} />
            {task.duration.hours ? <span>{task.duration.hours}h</span> : ""}
            {task.duration.minutes ? <span>{task.duration.minutes}m</span> : ""}
          </span>
        )}
      </div>
    </li>
  );
}
