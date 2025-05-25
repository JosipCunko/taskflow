import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isToday?: boolean; // Helper, can be derived from dueDate
  isPriority: boolean; // 'focus' tag could set this
  isReminder: boolean;
  dueDate: Date; // Stored as Timestamp in Firestore, converted to Date in app
  status: "pending" | "completed" | "delayed";
  delayCount: number;
  tags?: string[]; // For user-defined tags like 'morning routine', 'gym'
  createdAt: Date; // Stored as Timestamp in Firestore
  updatedAt: Date; // Stored as Timestamp in Firestore
  completedAt?: Date; // Stored as Timestamp in Firestore, set when status is 'completed'
  experience?: "bad" | "okay" | "good" | "best"; // EmojiExperience.tsx
}

export type EmojiOption = {
  id: "bad" | "okay" | "good" | "best";
  emoji: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  selected?: boolean;
};

export interface SearchedTask {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
}

export interface TimeManagementStats {
  onTimeTasksCount: number;
  totalRelevantTasksForTiming: number; // Completed or missed tasks that had a due date
  averageDelayDays: number; // For tasks that were completed but after their original due date
  onTimeCompletionRate: number;
}

export interface ConsistencyStats {
  currentStreakDays: number;
  bestStreakDays: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: Date;
  type:
    | "TASK_COMPLETED"
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "EXPERIENCE_RATED"
    | "TASK_DELAYED"
    | "TASK_MISSED"
    | "TASK_DELETED";
  taskId?: string;
  taskSnapshot?: Partial<Task>;
  details?: string;
  activityIcon?: keyof typeof import("lucide-react");
  activityColor?: string;
}

export interface userProfileType {
  displayName: string;
  email: string;
  photoURL: string;
  rewardPoints: number;
  memberSince: Date;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ActionError extends Error {
  message: string;
}
