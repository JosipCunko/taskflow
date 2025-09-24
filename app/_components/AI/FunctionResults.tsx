import React from "react";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  Edit3,
  Clock,
  BarChart3,
} from "lucide-react";
import { FunctionResult, Task } from "@/app/_types/types";
import TaskCardSmall from "../TaskCardSmall";

interface FunctionResultsProps {
  results: FunctionResult[];
}

const FunctionResults: React.FC<FunctionResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  const getFunctionIcon = (functionName: string) => {
    switch (functionName) {
      case "show_tasks":
        return <BarChart3 size={16} className="text-blue-500" />;
      case "delay_task":
        return <Clock size={16} className="text-orange-500" />;
      case "update_task":
        return <Edit3 size={16} className="text-purple-500" />;
      case "complete_task":
        return <CheckCircle size={16} className="text-green-500" />;
      case "create_task":
        return <Plus size={16} className="text-blue-500" />;
      case "show_notes":
      case "create_note":
      case "update_note":
        return <FileText size={16} className="text-indigo-500" />;
      default:
        return <CheckCircle size={16} className="text-gray-500" />;
    }
  };

  const getFunctionDisplayName = (functionName: string) => {
    const names: Record<string, string> = {
      show_tasks: "Tasks Retrieved",
      delay_task: "Task Delayed",
      update_task: "Task Updated",
      complete_task: "Task Completed",
      create_task: "Task Created",
      show_notes: "Notes Retrieved",
      create_note: "Note Created",
      update_note: "Note Updated",
    };
    return names[functionName] || functionName;
  };

  const renderTaskList = (tasks: Array<Task> | undefined) => (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {tasks?.map((task, index) => (
        <TaskCardSmall task={task} key={index} />
      ))}
    </div>
  );

  const renderNoteList = (
    notes:
      | Array<{
          id: string;
          title: string;
          content: string;
          updatedAt: string;
        }>
      | undefined
  ) => (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {notes?.map((note, index) => (
        <div key={index} className="p-2 bg-background-600 rounded">
          <p className="text-sm font-medium text-text">{note.title}</p>
          <p className="text-xs text-text-low mt-1">{note.content}</p>
          <p className="text-xs text-text-low mt-1">
            Updated: {note.updatedAt}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-3 space-y-3">
      {results.map((result, index) => (
        <div
          key={index}
          className="bg-background-600 rounded-lg p-3 border border-primary-800/30"
        >
          <div className="flex items-center space-x-2 mb-2">
            {getFunctionIcon(result.name)}
            <span className="text-sm font-medium text-text">
              {getFunctionDisplayName(result.name)}
            </span>
            {result.result.success === false && (
              <AlertCircle size={14} className="text-red-500" />
            )}
          </div>

          <div className="text-sm text-text-low">
            {result.result.error ? (
              <p className="text-red-400">{result.result.error}</p>
            ) : (
              <>
                {result.result.message && (
                  <p className="mb-2 text-green-400">{result.result.message}</p>
                )}

                {/* Task-specific displays */}
                {result.result.tasks && renderTaskList(result.result.tasks)}

                {/* Note-specific displays */}
                {result.result.notes && renderNoteList(result.result.notes)}

                {/* Single task/note displays */}
                {result.result.task && (
                  <TaskCardSmall task={result.result.task} />
                )}

                {result.result.note && (
                  <div className="bg-background-700 p-2 rounded">
                    <p className="font-medium">{result.result.note.title}</p>
                    <p className="text-xs">{result.result.note.content}</p>
                  </div>
                )}

                {/* Count information */}
                {result.result.count !== undefined && (
                  <p className="text-xs mt-2">
                    Showing {result.result.count} of {result.result.totalCount}{" "}
                    items
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FunctionResults;
