"use client";

import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../reusable/Button';

interface ScheduleChange {
  task: string;
  action: string;
  suggestedDate: string;
  reason: string;
}

interface ScheduleConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: ScheduleChange[];
  conflicts: Array<{
    task1: string;
    task2: string;
    timeDifference: string;
  }>;
}

const ScheduleConfirmationDialog: React.FC<ScheduleConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  changes,
  conflicts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-400 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold text-text">Confirm Schedule Changes</h2>
          </div>
          
          <p className="text-text-low mb-4">
            The AI has proposed the following schedule changes to optimize your productivity:
          </p>

          {conflicts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-orange-500" size={16} />
                <h3 className="font-medium text-orange-400">Conflicts Detected</h3>
              </div>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
                    <p className="text-sm text-text">
                      <strong>{conflict.task1}</strong> and <strong>{conflict.task2}</strong> are scheduled only {conflict.timeDifference} apart
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="text-green-500" size={16} />
              <h3 className="font-medium text-green-400">Proposed Changes</h3>
            </div>
            <div className="space-y-2">
              {changes.map((change, index) => (
                <div key={index} className="bg-background-500 border border-primary-800/30 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="text-blue-400 mt-1" size={14} />
                    <div>
                      <p className="text-sm font-medium text-text">
                        {change.action}: <strong>{change.task}</strong>
                      </p>
                      <p className="text-sm text-blue-400">
                        New time: {change.suggestedDate}
                      </p>
                      <p className="text-xs text-text-low mt-1">
                        Reason: {change.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConfirmationDialog;