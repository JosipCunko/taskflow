"use server";

import { doc, updateDoc } from "firebase/firestore";
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
