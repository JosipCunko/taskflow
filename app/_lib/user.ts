"use server";

import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "next-auth";
import { ActionError, ActionResult } from "../_types/types";
import { revalidatePath } from "next/cache";

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<ActionResult> {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, data);
    revalidatePath("/profile");
    return { success: true, message: "User updated" };
  } catch (err) {
    const error = err as ActionError;
    return { success: false, error: error.message || "Failed to update user" };
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
