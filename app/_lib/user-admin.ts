import "server-only";
import { adminDb } from "./admin";
import { AppUser, ActionResult, ActionError } from "../_types/types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

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

export const getUserById = async (userId: string): Promise<AppUser | null> => {
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
      achievements: userData.achievements || [],
      completedTasksCount: userData.completedTasksCount || 0,
      currentStreak: userData.currentStreak || 0,
      bestStreak: userData.bestStreak || 0,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

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
