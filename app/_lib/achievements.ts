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

async function addAchievementToUser(
  userId: string,
  achievement: Omit<Achievement, "userId" | "unlockedAt">
) {
  const newAchievement = {
    ...achievement,
    userId,
    unlockedAt: new Date(),
  };
  await adminDb
    .collection("users")
    .doc(userId)
    .update({
      achievements: FieldValue.arrayUnion(newAchievement),
    });
  await generateAchievementNotification(userId, achievement.type, {
    achievementId: achievement.id,
  });
}

export async function checkAndAwardAchievements(user: AppUser) {
  if (!user || !user.notifyAchievements) return;

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
}
