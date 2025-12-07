import "server-only";
import { adminDb } from "./admin";
import {
  AppUser,
  ActionResult,
  ActionError,
  Achievement,
  UserNutritionGoals,
} from "../_types/types";
import { FieldValue } from "firebase-admin/firestore";
import { defaultNutritionGoals } from "../_utils/utils";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDuration } from "../_utils/serverCache";

/**
 * Internal function to fetch user by ID from Firestore
 * This is the uncached version
 */
async function getUserByIdInternal(userId: string): Promise<AppUser | null> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    const userData = userDoc.data();
    if (!userData) {
      return null;
    }

    const achievementsSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("achievements")
      .get();

    const achievements: Achievement[] = achievementsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        userId: data.userId,
        unlockedAt: data.unlockedAt,
      };
    });

    return {
      uid: userDoc.id,
      displayName: userData.displayName,
      email: userData.email,
      provider: userData.provider,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      notifyReminders: userData.notifyReminders,
      notifyAchievements: userData.notifyAchievements,
      rewardPoints: userData.rewardPoints || 0,
      achievements, // Now from subcollection
      completedTasksCount: userData.completedTasksCount || 0,
      currentStreak: userData.currentStreak || 0,
      bestStreak: userData.bestStreak || 0,
      nutritionGoals: userData.nutritionGoals
        ? {
            calories:
              userData.nutritionGoals.dailyCalories ||
              userData.nutritionGoals.calories,
            protein:
              userData.nutritionGoals.dailyProtein ||
              userData.nutritionGoals.protein,
            carbs:
              userData.nutritionGoals.dailyCarbs ||
              userData.nutritionGoals.carbs,
            fat:
              userData.nutritionGoals.dailyFat || userData.nutritionGoals.fat,
            updatedAt: userData.nutritionGoals.updatedAt,
          }
        : {
            calories: defaultNutritionGoals.calories,
            protein: defaultNutritionGoals.protein,
            carbs: defaultNutritionGoals.carbs,
            fat: defaultNutritionGoals.fat,
            updatedAt: userData.createdAt,
          },
      ...(userData.lastLoginAt && { lastLoginAt: userData.lastLoginAt }),
      // Anonymous user fields
      isAnonymous: userData.isAnonymous,
      ...(userData.anonymousCreatedAt && {
        anonymousCreatedAt: userData.anonymousCreatedAt,
      }),
      // Subscription fields
      currentPlan: userData.currentPlan || "base",
      ...(userData.planExpiresAt && { planExpiresAt: userData.planExpiresAt }),
      ...(userData.stripeCustomerId && {
        stripeCustomerId: userData.stripeCustomerId,
      }),
      ...(userData.stripeSubscriptionId && {
        stripeSubscriptionId: userData.stripeSubscriptionId,
      }),
      freeTrialUsed: userData.freeTrialUsed || false,
      aiPromptsToday: userData.aiPromptsToday || 0,
      ...(userData.lastPromptDate && {
        lastPromptDate: userData.lastPromptDate,
      }),
      receiveUpdateNotifications: userData.receiveUpdateNotifications,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

/**
 * Get user by ID with caching
 *
 * Uses Next.js 15 unstable_cache for server-side caching.
 * Cache is invalidated when:
 * - User data is updated (via revalidateTag in updateUserAction)
 * - Automatically after 5 minutes as a safety net
 *
 * @param userId - User ID to fetch
 * @returns User data or null if not found
 */
export async function getUserById(userId: string): Promise<AppUser | null> {
  const cachedGetUser = unstable_cache(
    getUserByIdInternal,
    [`user-${userId}`],
    {
      tags: [CacheTags.user(userId), CacheTags.users()],
      revalidate: CacheDuration.USER_DATA,
    }
  );

  return cachedGetUser(userId);
}

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
      updatedAt: userData.nutritionGoals.updatedAt,
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
 * Updates user 's completeTasksCount, rewardPoints and lastLoginAt
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

    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) throw new Error("User not found");

      // Always increment completed tasks count regardless of points
      const updates: {
        completedTasksCount: FieldValue;
        rewardPoints?: FieldValue;
        lastLoginAt?: number;
      } = {
        completedTasksCount: FieldValue.increment(1),
      };

      // Only update points if there are points to add
      if (pointsDiff !== 0) {
        updates.rewardPoints = FieldValue.increment(pointsDiff);
        updates.lastLoginAt = Date.now();
      }

      transaction.update(userDocRef, updates);
    });
  } catch (error) {
    console.error(`Error updating completion stats for user ${userId}:`, error);
  }
}
