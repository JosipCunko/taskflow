"use client";

import { Task, AppUser } from "../_types/types";
import { format, subDays, startOfDay, isToday, isSameDay } from "date-fns";

interface FourteenDayOverviewProps {
  user: AppUser;
  allTasks: Task[];
}

interface DayData {
  date: Date;
  dayNumber: number;
  dayName: string;
  tasksCompleted: number;
  isToday: boolean;
}

export default function FourteenDayOverview({ user, allTasks }: FourteenDayOverviewProps) {
  // Generate last 14 days
  const today = new Date();
  const days: DayData[] = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i);
    const dayStart = startOfDay(date);
    
    // Count regular tasks completed on this day
    const regularTasksCompleted = allTasks.filter(
      (task) =>
        !task.isRepeating &&
        task.status === "completed" &&
        task.completedAt &&
        isSameDay(startOfDay(task.completedAt), dayStart)
    ).length;
    
    // Count repeating tasks completed on this day
    const repeatingTasksCompleted = allTasks.filter((task) => {
      if (!task.isRepeating || !task.repetitionRule) return false;
      
      return task.repetitionRule.completedAt.some((completedDate) =>
        isSameDay(startOfDay(completedDate), dayStart)
      );
    }).length;
    
    days.push({
      date,
      dayNumber: date.getDate(),
      dayName: format(date, "EEE"),
      tasksCompleted: regularTasksCompleted + repeatingTasksCompleted,
      isToday: isToday(date),
    });
  }

  return (
    <div className="bg-background-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-low">14-Day Overview</h2>
        <div className="text-right">
          <div className="text-sm text-text-gray">Current Streak</div>
          <div className="text-lg font-bold text-primary">{user.currentStreak} day{user.currentStreak !== 1 ? 's' : ''}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3 mb-3">
        {days.slice(0, 7).map((day, index) => (
          <DayBox key={index} day={day} />
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {days.slice(7, 14).map((day, index) => (
          <DayBox key={index + 7} day={day} />
        ))}
      </div>
    </div>
  );
}

interface DayBoxProps {
  day: DayData;
}

function DayBox({ day }: DayBoxProps) {
  const hasCompletedTasks = day.tasksCompleted > 0;
  
  return (
    <div
      className={`
        relative rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-between
        ${
          hasCompletedTasks
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-background-600 border border-background-500"
        }
        ${day.isToday ? "ring-2 ring-blue-400/50" : ""}
        transition-all duration-200 hover:bg-opacity-80
      `}
    >
      <div className="text-xs text-text-gray font-medium mb-1">
        {day.dayName}
      </div>
      
      <div
        className={`
          text-xl font-bold mb-1
          ${hasCompletedTasks ? "text-green-400" : "text-text-low"}
        `}
      >
        {day.dayNumber}
      </div>
      
      {hasCompletedTasks && (
        <div className="text-xs text-green-400 font-medium leading-tight">
          {day.tasksCompleted} habit{day.tasksCompleted !== 1 ? 's' : ''}
          <br />
          completed
        </div>
      )}
      
      {day.isToday && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
      )}
    </div>
  );
}
