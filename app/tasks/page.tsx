"use client"; // NEEDS TO BE

import TaskCard from "../_components/TaskCard";
import { Task } from "../_types/types";

const sampleTasks: Task[] = [
  {
    id: "1",
    userId: "user123",
    title: "Brainstorm new project ideas with the team",
    description:
      "Organize a meeting to discuss upcoming project initiatives and gather input from all team members. Prepare a preliminary agenda.",
    type: "Work",
    icon: "Briefcase",
    color: "#3B82F6", // Blue
    isPriority: true,
    isReminder: true,
    isToday: true,
    dueDate: new Date(),
    status: "pending",
    delayCount: 0,
    points: 10,
    tags: ["project-alpha", "meeting", "brainstorming"],
    preconditionTaskIds: [],
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: "2",
    userId: "user123",
    title: "Grocery Shopping for the Week",
    description:
      "Buy fruits, vegetables, milk, and other essentials for the week. Check pantry for stock.",
    type: "Personal",
    icon: "ShoppingCart",
    color: "#10B981", // Green
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() + 86400000 * 2), // In 2 days
    status: "pending",
    delayCount: 0,
    points: 5,
    tags: ["home", "essentials"],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "3",
    userId: "user123",
    title: "Review Design Mockups V3",
    description:
      "Provide feedback on the latest design mockups for the new landing page. Focus on UX and accessibility.",
    type: "Design Review",
    icon: "Book", // Placeholder for a design-related icon
    color: "#8B5CF6", // Purple
    isPriority: true,
    isReminder: true,
    dueDate: new Date(Date.now() - 86400000 * 1), // Due yesterday
    status: "delayed",
    delayCount: 1,
    points: 8,
    tags: ["design", "ux", "feedback", "critical"],
    preconditionTaskIds: ["1"],
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: "4",
    userId: "user123",
    title: "Submit Monthly Expense Report",
    description:
      "Compile all receipts and submit the expense report for last month through the company portal.",
    type: "Admin",
    icon: "ClipboardList",
    color: "#F59E0B", // Amber
    isPriority: false,
    isReminder: false,
    dueDate: new Date(Date.now() - 86400000 * 10), // Due 10 days ago
    status: "completed",
    delayCount: 0,
    points: 3,
    tags: ["finance", "report"],
    createdAt: new Date(Date.now() - 86400000 * 40),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    completedAt: new Date(Date.now() - 86400000 * 9),
    experience: "good",
  },
];

export default function TodayPage() {
  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today</h1>
        <p className="text-text-low">Your tasks for today</p>
      </div>

      <div className="mt-8">
        <div className="p-6 text-center text-text-low">
          {sampleTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleTasks.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={idx}
                  onEdit={(id) => console.log("Edit task:", id)}
                  onDelete={(id) => console.log("Delete task:", id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-medium">
              No tasks for today. Add a new task to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
