import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateUserRewardPoints(
  userId: string,
  pointsDiff: number
): Promise<void> {
  if (!userId || typeof pointsDiff !== "number" || pointsDiff === 0) {
    // No user or no change, do nothing
    return;
  }
  try {
    const userDocRef = doc(db, "users", userId);
    // Atomically increment/decrement the user's rewardPoints
    // If the field doesn't exist, increment starts it at pointsDiff
    await updateDoc(userDocRef, {
      rewardPoints: increment(pointsDiff),
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
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        notifyReminders: userData.notifyReminders ?? true,
        notifyAchievements: userData.notifyAchievements ?? true,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<{
  rewardPoints: number;
  achievements: { id: string; unlockedAt: Date }[];
} | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        rewardPoints: userData.rewardPoints ?? 0,
        achievements: (userData.achievements ?? []).map(
          (achievement: { id: string; unlockedAt?: { toDate(): Date } }) => ({
            id: achievement.id,
            unlockedAt: achievement.unlockedAt?.toDate() ?? new Date(),
          })
        ),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}
