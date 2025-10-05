import "server-only";
import { generateAchievementNotification } from "./notifications-admin";
import { Achievement } from "../_types/types";
import { adminDb } from "./admin";
import {
  pointsMilestones,
  streakMilestones,
  taskCompletionistMilestones,
} from "../_utils/utils";
import { getUserById } from "./user-admin";
import { trackAchievementUnlocked } from "./analytics";

async function addAchievementToUser(
  userId: string,
  achievement: Omit<Achievement, "userId" | "unlockedAt">
) {
  try {
    // Reference to the achievements subcollection
    const achievementRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("achievements")
      .doc(achievement.id);

    // Check if achievement already exists
    const existingDoc = await achievementRef.get();
    if (existingDoc.exists) {
      console.log(
        `Achievement ${achievement.id} already exists for user ${userId}`
      );
      return; // Achievement already exists, skip
    }

    const newAchievement: Achievement = {
      ...achievement,
      userId,
      unlockedAt: Date.now(),
    };

    // Add achievement to subcollection
    await achievementRef.set(newAchievement);

    // Generate notification after successful write
    await generateAchievementNotification(
      userId,
      achievement.type,
      achievement.id
    );

    trackAchievementUnlocked(achievement.id);
  } catch (error) {
    console.error(
      `Error adding achievement ${achievement.id} to user ${userId}:`,
      error
    );
    throw error;
  }
}

export async function checkAndAwardAchievements(userId: string) {
  try {
    // Always fetch fresh user data to avoid stale data issues
    // user from jwt is stale
    const user = await getUserById(userId);
    if (!user || !user.notifyAchievements) {
      return;
    }

    const { rewardPoints, currentStreak, completedTasksCount, achievements } =
      user;

    // 1. Points Milestone
    for (const milestone of pointsMilestones) {
      if (rewardPoints >= milestone) {
        const achievementId = `points_milestone_${milestone}`;
        if (!achievements.some((a) => a.id === achievementId)) {
          await addAchievementToUser(user.uid, {
            id: achievementId,
            type: "points_milestone",
          });
        }
      }
    }

    // 2. Streak Milestone
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone) {
        const achievementId = `streak_milestone_${milestone}`;
        if (!achievements.some((a) => a.id === achievementId)) {
          await addAchievementToUser(user.uid, {
            id: achievementId,
            type: "streak_milestone",
          });
        }
      }
    }

    // 3. Task Completionist Milestone
    if (completedTasksCount > 0) {
      for (const milestone of taskCompletionistMilestones) {
        if (completedTasksCount >= milestone) {
          const achievementId = `task_completionist_${milestone}`;
          if (!achievements.some((a) => a.id === achievementId)) {
            await addAchievementToUser(user.uid, {
              id: achievementId,
              type: "task_completionist",
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error checking achievements for user ${userId}:`, error);
  }
}
