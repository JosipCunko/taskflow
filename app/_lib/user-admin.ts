import "server-only";
import { adminDb } from "./admin";
import {
  AppUser,
  ActionResult,
  ActionError,
  Achievement,
} from "../_types/types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";

export async function getUserPreferences(userId: string): Promise<{
  notifyReminders?: boolean;
  notifyAchievements?: boolean;
} | null> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      return {
        notifyReminders: userData?.notifyReminders ?? true,
        notifyAchievements: userData?.notifyAchievements ?? true,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
}

export const getUserById = unstable_cache(
  async (userId: string): Promise<AppUser | null> => {
    try {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      const userData = userDoc.data();
      if (!userData) {
        return null;
      }

      return {
        uid: userDoc.id,
        displayName: userData.displayName,
        email: userData.email,
        provider: userData.provider,
        photoURL: userData.photoURL,
        createdAt: (userData.createdAt as Timestamp).toDate(),
        notifyReminders: userData.notifyReminders,
        notifyAchievements: userData.notifyAchievements,
        rewardPoints: userData.rewardPoints || 0,
        achievements: (
          (userData.achievements || []) as (Omit<Achievement, "unlockedAt"> & {
            unlockedAt: Timestamp;
          })[]
        ).map((achievement) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt.toDate(),
        })),
        completedTasksCount: userData.completedTasksCount || 0,
        currentStreak: userData.currentStreak || 0,
        bestStreak: userData.bestStreak || 0,
        gainedPoints: userData.gainedPoints || [],
      };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }
);

export async function updateUserRewardPoints(
  userId: string,
  pointsDiff: number
): Promise<void> {
  if (
    !userId ||
    typeof pointsDiff !== "number" ||
    pointsDiff === 0 ||
    isNaN(pointsDiff)
  ) {
    return;
  }
  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.update({
      rewardPoints: FieldValue.increment(pointsDiff),
    });
  } catch (error) {
    console.error(`Error updating reward points for user ${userId}:`, error);
  }
}

/**
 * Updates user 's completeTasksCount, rewardPoints and gainedPoints
 */
export async function updateUserCompletionStats(
  userId: string,
  pointsDiff: number
): Promise<void> {
  if (!userId || typeof pointsDiff !== "number" || isNaN(pointsDiff)) {
    return;
  }
  try {
    const userDocRef = adminDb.collection("users").doc(userId);

    // Use transaction to get current data and update gainedPoints
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) throw new Error("User not found");

      const userData = userDoc.data();
      const currentGainedPoints = userData?.gainedPoints || [];
      const currentRewardPoints = userData?.rewardPoints || 0;

      // Always increment completed tasks count regardless of points
      const updates: {
        completedTasksCount: FieldValue;
        rewardPoints?: FieldValue;
        gainedPoints?: number[];
      } = {
        completedTasksCount: FieldValue.increment(1),
      };

      // Only update points if there are points to add
      if (pointsDiff !== 0) {
        updates.rewardPoints = FieldValue.increment(pointsDiff);

        // Update gainedPoints array - maintain max length of 7
        const newTotalPoints = currentRewardPoints + pointsDiff;
        let updatedGainedPoints = [...currentGainedPoints, newTotalPoints];
        if (updatedGainedPoints.length > 7) {
          updatedGainedPoints = updatedGainedPoints.slice(-7); // Keep only last 7 entries
        }
        updates.gainedPoints = updatedGainedPoints;
      }

      transaction.update(userDocRef, updates);
    });
  } catch (error) {
    console.error(`Error updating completion stats for user ${userId}:`, error);
  }
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<AppUser, "id" | "createdAt">>
): Promise<ActionResult> {
  const userRef = adminDb.collection("users").doc(userId);
  try {
    await userRef.update(data);
    return { success: true, message: "User updated" };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to update user" };
  }
}
