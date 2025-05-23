export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  color: string;
  isToday?: boolean; // Helper, can be derived from dueDate
  isPriority: boolean; // 'focus' tag could set this
  isReminder: boolean;
  dueDate: Date; // Stored as Timestamp in Firestore, converted to Date in app
  status: "pending" | "completed" | "delayed";
  delayCount: number;
  points: number;
  tags?: string[]; // For user-defined tags like 'morning routine', 'gym'
  createdAt: Date; // Stored as Timestamp in Firestore
  updatedAt: Date; // Stored as Timestamp in Firestore
  completedAt?: Date; // Stored as Timestamp in Firestore, set when status is 'completed'
  experience?: "bad" | "okay" | "good"; // EmojiExperience.tsx
}
