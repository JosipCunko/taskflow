"use server";

import { getTasksByUserId } from "./tasks";
import { calculateConsistencyStats } from "../_utils/utils";
import { getUserById } from "./user";
import { generateAchievementNotification } from "./notifications";

interface UserAchievementData {
  totalPoints: number;
  currentStreak: number;
  completedTasksCount: number;
}

interface AchievementCheck {
  type: string;
  milestones: number[];
  getCurrentValue: (data: UserAchievementData) => number;
}

const ACHIEVEMENT_CHECKS: AchievementCheck[] = [
  {
    type: "points_milestone",
    milestones: [100, 250, 500, 1000, 2500, 5000],
    getCurrentValue: (data) => data.totalPoints,
  },
  {
    type: "consistency_master",
    milestones: [10, 25, 50, 100, 200, 300, 500],
    getCurrentValue: (data) => data.currentStreak,
  },
  {
    type: "task_completionist",
    milestones: [10, 25, 50, 100, 200, 500, 1000],
    getCurrentValue: (data) => data.completedTasksCount,
  },
];

export async function checkAndGenerateAchievements(
  userId: string
): Promise<void> {
  try {
    // Get user data
    const user = await getUserById(userId);
    if (!user) return;

    // Get all tasks to calculate completed tasks count and streak
    const allTasks = await getTasksByUserId(userId);
    const completedTasks = allTasks.filter(
      (task) => task.status === "completed"
    );
    const consistencyStats = calculateConsistencyStats(completedTasks);

    const userData = {
      totalPoints: user.rewardPoints || 0,
      currentStreak: consistencyStats.currentStreakDays,
      completedTasksCount: completedTasks.length,
    };

    // Get existing achievements to avoid duplicates
    const existingAchievements = user.achievements || [];

    for (const check of ACHIEVEMENT_CHECKS) {
      const currentValue = check.getCurrentValue(userData);

      // Find the highest milestone achieved
      const achievedMilestones = check.milestones.filter(
        (milestone) => currentValue >= milestone
      );

      for (const milestone of achievedMilestones) {
        const achievementId = `${check.type}_${milestone}`;

        // Check if this achievement was already unlocked
        if (
          !existingAchievements.some(
            (a: { id: string }) => a.id === achievementId
          )
        ) {
          // Generate achievement notification
          await generateAchievementNotification(userId, check.type, {
            milestone,
            currentValue,
            achievementId,
          });

          // You would also want to save this achievement to the user record
          // This depends on your user schema and how you want to store achievements
          console.log(
            `Achievement unlocked: ${achievementId} for user ${userId}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

export async function checkPointsMilestone(
  userId: string,
  newPoints: number
): Promise<void> {
  const pointsMilestones = [100, 250, 500, 1000, 2500, 5000];

  for (const milestone of pointsMilestones) {
    if (newPoints >= milestone) {
      // Check if achievement was already unlocked
      const user = await getUserById(userId);
      const existingAchievements = user?.achievements || [];
      const achievementId = `points_milestone_${milestone}`;

      if (
        !existingAchievements.some(
          (a: { id: string }) => a.id === achievementId
        )
      ) {
        await generateAchievementNotification(userId, "points_milestone", {
          milestone,
          currentValue: newPoints,
          achievementId,
        });
      }
    }
  }
}

export async function checkStreakMilestone(
  userId: string,
  currentStreak: number
): Promise<void> {
  const streakMilestones = [10, 25, 50, 100, 200, 300, 500];

  for (const milestone of streakMilestones) {
    if (currentStreak >= milestone) {
      // Check if achievement was already unlocked
      const user = await getUserById(userId);
      const existingAchievements = user?.achievements || [];
      const achievementId = `consistency_master_${milestone}`;

      if (
        !existingAchievements.some(
          (a: { id: string }) => a.id === achievementId
        )
      ) {
        await generateAchievementNotification(userId, "consistency_master", {
          milestone,
          currentValue: currentStreak,
          achievementId,
        });
      }
    }
  }
}

export async function checkTaskCompletionMilestone(
  userId: string
): Promise<void> {
  const allTasks = await getTasksByUserId(userId);
  const completedTasksCount = allTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const taskMilestones = [10, 25, 50, 100, 200, 500, 1000];

  for (const milestone of taskMilestones) {
    if (completedTasksCount >= milestone) {
      // Check if achievement was already unlocked
      const user = await getUserById(userId);
      const existingAchievements = user?.achievements || [];
      const achievementId = `task_completionist_${milestone}`;

      if (
        !existingAchievements.some(
          (a: { id: string }) => a.id === achievementId
        )
      ) {
        await generateAchievementNotification(userId, "task_completionist", {
          milestone,
          currentValue: completedTasksCount,
          achievementId,
        });
      }
    }
  }
}
