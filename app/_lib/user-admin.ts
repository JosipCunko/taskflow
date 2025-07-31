import "server-only";
import { adminDb } from "./admin";
import {
  AppUser,
  ActionResult,
  ActionError,
  Achievement,
  UserNutritionGoals,
} from "../_types/types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";
import { defaultNutritionGoals } from "../_utils/healthUtils";

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
        nutritionGoals: userData.nutritionGoals
          ? {
              calories: userData.nutritionGoals.dailyCalories,
              protein: userData.nutritionGoals.dailyProtein,
              carbs: userData.nutritionGoals.dailyCarbs,
              fat: userData.nutritionGoals.dailyFat,
              updatedAt: (
                userData.nutritionGoals.updatedAt as Timestamp
              ).toDate(),
            }
          : {
              calories: defaultNutritionGoals.calories,
              protein: defaultNutritionGoals.protein,
              carbs: defaultNutritionGoals.carbs,
              fat: defaultNutritionGoals.fat,
              updatedAt: (userData.createdAt as Timestamp).toDate(),
            },
      };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }
);

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

export async function getUserNutritionGoals(
  userId: string
): Promise<UserNutritionGoals> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();
    if (!userData?.nutritionGoals) {
      throw new Error("There are no nutrition goals linked to the user");
    }
    return {
      ...userData.nutritionGoals,
      updatedAt: userData.nutritionGoals.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Error getting nutrition goals:", error);
    return defaultNutritionGoals;
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
      const lastLogin = userData?.lastLoginAt?.toDate() || new Date();
      const isNewDay = new Date().getDate() !== lastLogin.getDate();

      const gainedPoints: number[] = userData?.gainedPoints || [
        0, 0, 0, 0, 0, 0, 0,
      ];

      // Always increment completed tasks count regardless of points
      const updates: {
        completedTasksCount: FieldValue;
        rewardPoints?: FieldValue;
        gainedPoints?: number[];
        lastLoginAt?: Date;
      } = {
        completedTasksCount: FieldValue.increment(1),
      };

      // Only update points if there are points to add
      if (pointsDiff !== 0) {
        updates.rewardPoints = FieldValue.increment(pointsDiff);
        updates.lastLoginAt = new Date();

        if (isNewDay) {
          // Shift array to the left and add a new day
          gainedPoints.shift();
          gainedPoints.push(pointsDiff);
        } else {
          // Add points to the current day (last element)
          gainedPoints[gainedPoints.length - 1] += pointsDiff;
        }
        updates.gainedPoints = gainedPoints;
      }

      transaction.update(userDocRef, updates);
    });
  } catch (error) {
    console.error(`Error updating completion stats for user ${userId}:`, error);
  }
}
