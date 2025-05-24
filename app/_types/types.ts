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
