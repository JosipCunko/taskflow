"use server";

import { adminDb } from "@/app/_lib/admin";
import { Timestamp } from "firebase-admin/firestore";
import { ActionResult } from "@/app/_types/types";
import { revalidatePath } from "next/cache";

export async function addNoteAction(
  userId: string,
  initialTitle: string = "Untitled Note",
  initialContent: string = ""
): Promise<ActionResult & { newNoteId?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required to add a note." };
  }

  try {
    const newNoteRef = adminDb.collection("notes").doc();
    const newNoteData = {
      userId,
      title: initialTitle,
      content: initialContent,
      updatedAt: Timestamp.now(),
    };
    await newNoteRef.set(newNoteData);
    revalidatePath("/notes");
    return {
      success: true,
      message: "Note added successfully.",
      newNoteId: newNoteRef.id,
    };
  } catch (error) {
    console.error("Error adding note:", error);
    return { success: false, error: "Failed to add note." };
  }
}

export async function updateNoteAction(
  noteId: string,
  title: string,
  content: string,
  userId: string
): Promise<ActionResult> {
  if (!noteId || !userId) {
    return { success: false, error: "Note ID and User ID are required." };
  }

  try {
    const noteRef = adminDb.collection("notes").doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return { success: false, error: "Note not found." };
    }
    if (noteDoc.data()?.userId !== userId) {
      return { success: false, error: "Unauthorized to update this note." };
    }

    await noteRef.update({
      title,
      content,
      updatedAt: Timestamp.now(),
    });
    revalidatePath("/notes");
    return { success: true, message: "Note updated successfully." };
  } catch (error) {
    console.error("Error updating note:", noteId, error);
    return { success: false, error: "Failed to update note." };
  }
}

export async function deleteNoteAction(
  noteId: string,
  userId: string
): Promise<ActionResult> {
  if (!noteId || !userId) {
    return { success: false, error: "Note ID and User ID are required." };
  }

  try {
    const noteRef = adminDb.collection("notes").doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      // If the note doesn't exist, arguably it's already "deleted" from the user's perspective.
      // Depending on strictness, could return success or specific error.
      // Returning an error for now as it indicates a potential issue with the noteId passed.
      return { success: false, error: "Note not found." };
    }
    if (noteDoc.data()?.userId !== userId) {
      return { success: false, error: "Unauthorized to delete this note." };
    }

    await noteRef.delete();
    revalidatePath("/notes");
    return { success: true, message: "Note deleted successfully." };
  } catch (error) {
    console.error("Error deleting note:", noteId, error);
    return { success: false, error: "Failed to delete note." };
  }
}
