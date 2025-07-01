import "server-only";
import { adminDb } from "./admin";
import { User } from "next-auth";
import { FieldValue } from "firebase-admin/firestore";

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

export async function getUserById(
  userId: string
): Promise<
  (User & { createdAt: Date; displayName: string; photoURL: string }) | null
> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      if (userData) {
        return {
          createdAt: userData.createdAt.toDate(),
          id: userId,
          email: userData.email,
          image: userData.photoURL,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          provider: userData.provider,
          notifyReminders: userData.notifyReminders,
          notifyAchievements: userData.notifyAchievements,
          rewardPoints: userData.rewardPoints,
          achievements: userData.achievements ?? [],
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<{ success: boolean; message?: string; error?: string }> {
  const userRef = adminDb.collection("users").doc(userId);
  try {
    await userRef.update(data);
    return { success: true, message: "User updated" };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to update user" };
  }
}
