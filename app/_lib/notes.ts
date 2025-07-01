import "server-only";
import { adminDb } from "@/app/_lib/admin";
import { Note } from "@/app/_types/types";
import { Timestamp } from "firebase-admin/firestore";

export async function loadNotesByUserId(userId: string): Promise<Note[]> {
  if (!userId) {
    console.error("User ID is required to load notes.");
    return [];
  }

  try {
    const notesSnapshot = await adminDb
      .collection("notes")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    if (notesSnapshot.empty) {
      return [];
    }

    const notes: Note[] = notesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId as string,
        title: (data.title as string) || "",
        content: (data.content as string) || "",
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      };
    });

    return notes;
  } catch (error) {
    console.error("Error loading notes for user:", userId, error);
    throw new Error("Failed to load notes. Please try again later.");
  }
}
