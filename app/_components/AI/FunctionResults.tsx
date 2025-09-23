import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Calendar, FileText, Plus, Edit3, Clock, BarChart3 } from 'lucide-react';
import ScheduleConfirmationDialog from './ScheduleConfirmationDialog';
import Button from '../reusable/Button';
import { FunctionResult } from '@/app/_types/types';

interface FunctionResultsProps {
  results: FunctionResult[];
}

const FunctionResults: React.FC<FunctionResultsProps> = ({ results }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedScheduleData, setSelectedScheduleData] = useState<FunctionResult['result'] | null>(null);
  
  if (!results || results.length === 0) return null;

  const getFunctionIcon = (functionName: string) => {
    switch (functionName) {
      case 'show_tasks':
        return <BarChart3 size={16} className="text-blue-500" />;
      case 'delay_task':
        return <Clock size={16} className="text-orange-500" />;
      case 'update_task':
        return <Edit3 size={16} className="text-purple-500" />;
      case 'complete_task':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'create_task':
        return <Plus size={16} className="text-blue-500" />;
      case 'show_notes':
      case 'create_note':
      case 'update_note':
        return <FileText size={16} className="text-indigo-500" />;
      case 'propose_schedule':
        return <Calendar size={16} className="text-emerald-500" />;
      default:
        return <CheckCircle size={16} className="text-gray-500" />;
    }
  };

  const getFunctionDisplayName = (functionName: string) => {
    const names: Record<string, string> = {
      show_tasks: 'Tasks Retrieved',
      delay_task: 'Task Delayed',
      update_task: 'Task Updated',
      complete_task: 'Task Completed',
      create_task: 'Task Created',
      show_notes: 'Notes Retrieved',
      create_note: 'Note Created',
      update_note: 'Note Updated',
      propose_schedule: 'Schedule Proposed'
    };
    return names[functionName] || functionName;
  };

  const renderTaskList = (tasks: FunctionResult['result']['tasks']) => (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {tasks?.map((task, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-background-600 rounded border-l-4" 
             style={{ borderLeftColor: task.color || '#3B82F6' }}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{task.icon || '📋'}</span>
            <div>
              <p className="text-sm font-medium text-text">{task.title}</p>
              <p className="text-xs text-text-low">{task.dueDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {task.isPriority && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Priority</span>}
            {task.risk && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Risk</span>}
            <span className="text-xs text-text-low">{task.points}pts</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNoteList = (notes: FunctionResult['result']['notes']) => (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {notes?.map((note, index) => (
        <div key={index} className="p-2 bg-background-600 rounded">
          <p className="text-sm font-medium text-text">{note.title}</p>
          <p className="text-xs text-text-low mt-1">{note.content}</p>
          <p className="text-xs text-text-low mt-1">Updated: {note.updatedAt}</p>
        </div>
      ))}
    </div>
  );

  const handleConfirmSchedule = async () => {
    // This would trigger the AI to call apply_schedule_changes function
    // For now, we'll just close the dialog
    setShowConfirmation(false);
    // TODO: Integrate with chat to send confirmation message
  };

  const renderScheduleProposal = (result: FunctionResult['result']) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-background-600 p-2 rounded">
          <p className="font-medium">Total Tasks: {result.summary?.totalTasks || 0}</p>
        </div>
        <div className="bg-background-600 p-2 rounded">
          <p className="font-medium">Priority Tasks: {result.summary?.priorityTasks || 0}</p>
        </div>
        <div className="bg-background-600 p-2 rounded">
          <p className="font-medium">Conflicts: {result.summary?.conflictsDetected || 0}</p>
        </div>
        <div className="bg-background-600 p-2 rounded">
          <p className="font-medium">Suggestions: {result.summary?.suggestionsProvided || 0}</p>
        </div>
      </div>
      
      {result.conflicts && result.conflicts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-400 mb-2">Conflicts Detected:</h4>
          <div className="space-y-1">
            {result.conflicts.map((conflict: any, index: number) => (
              <p key={index} className="text-xs text-text-low bg-orange-500/10 p-2 rounded">
                {conflict.task1} and {conflict.task2} are {conflict.timeDifference} apart
              </p>
            ))}
          </div>
        </div>
      )}
      
      {result.suggestions && result.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-400 mb-2">Suggestions:</h4>
          <div className="space-y-1">
            {result.suggestions.map((suggestion: any, index: number) => (
              <p key={index} className="text-xs text-text-low bg-blue-500/10 p-2 rounded">
                {suggestion.action}: {suggestion.task} to {suggestion.suggestedDate} - {suggestion.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {result.requiresConfirmation && result.suggestions && result.suggestions.length > 0 && (
        <div className="mt-4">
          <Button
            onClick={() => {
              setSelectedScheduleData(result);
              setShowConfirmation(true);
            }}
            className="w-full"
          >
            Apply Schedule Changes
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="mt-3 space-y-3">
        {results.map((result, index) => (
          <div key={index} className="bg-background-600 rounded-lg p-3 border border-primary-800/30">
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
                    <div className="bg-background-700 p-2 rounded">
                      <p className="font-medium">{result.result.task.title}</p>
                      {result.result.task.dueDate && (
                        <p className="text-xs">Due: {result.result.task.dueDate}</p>
                      )}
                      {result.result.task.points && (
                        <p className="text-xs">Points: {result.result.task.points}</p>
                      )}
                    </div>
                  )}
                  
                  {result.result.note && (
                    <div className="bg-background-700 p-2 rounded">
                      <p className="font-medium">{result.result.note.title}</p>
                      <p className="text-xs">{result.result.note.content}</p>
                    </div>
                  )}
                  
                  {/* Schedule proposal display */}
                  {result.name === 'propose_schedule' && result.result.schedule && 
                    renderScheduleProposal(result.result)
                  }
                  
                  {/* Count information */}
                  {result.result.count !== undefined && (
                    <p className="text-xs mt-2">
                      Showing {result.result.count} of {result.result.totalCount} items
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedScheduleData && (
        <ScheduleConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmSchedule}
          changes={selectedScheduleData.suggestions || []}
          conflicts={selectedScheduleData.conflicts || []}
        />
      )}
    </>
  );
};

export default FunctionResults;