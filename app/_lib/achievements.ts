import "server-only";
import { generateAchievementNotification } from "./notifications-admin";
import { Achievement, AppUser } from "../_types/types";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  pointsMilestones,
  streakMilestones,
  taskCompletionistMilestones,
} from "../_utils/utils";
import { getUserById } from "./user-admin";

async function addAchievementToUser(
  userId: string,
  achievement: Omit<Achievement, "userId" | "unlockedAt">
) {
  try {
    const userRef = adminDb.collection("users").doc(userId);

    // Use a transaction to ensure atomic achievement addition
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as AppUser;
      const existingAchievements = userData.achievements || [];

      // Check if achievement already exists in the transaction
      const hasAchievement = existingAchievements.some(
        (a: Achievement) => a.id === achievement.id
      );

      if (hasAchievement) {
        console.log(
          `Achievement ${achievement.id} already exists for user ${userId}`
        );
        return; // Achievement already exists, skip
      }

      const newAchievement = {
        ...achievement,
        userId,
        unlockedAt: new Date(),
      };

      // Add achievement atomically
      transaction.update(userRef, {
        achievements: FieldValue.arrayUnion(newAchievement),
      });
    });

    // Only generate notification after successful transaction
    await generateAchievementNotification(userId, achievement.type, {
      achievementId: achievement.id,
    });
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
        if (!achievements.some((a: Achievement) => a.id === achievementId)) {
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
        if (!achievements.some((a: Achievement) => a.id === achievementId)) {
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
          if (!achievements.some((a: Achievement) => a.id === achievementId)) {
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
