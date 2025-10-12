import "server-only";
import { adminDb } from "@/app/_lib/admin";
import { Note } from "@/app/_types/types";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDuration } from "../_utils/serverCache";

async function loadNotesByUserIdInternal(userId: string): Promise<Note[]> {
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
        updatedAt: data.updatedAt,
      };
    });

    return notes;
  } catch (error) {
    console.error("Error loading notes for user:", userId, error);
    throw new Error("Failed to load notes. Please try again later.");
  }
}

export async function loadNotesByUserId(userId: string): Promise<Note[]> {
  const cachedGetNotes = unstable_cache(
    loadNotesByUserIdInternal,
    [`notes-user-${userId}`],
    {
      tags: [CacheTags.userNotes(userId), CacheTags.notes()],
      revalidate: CacheDuration.NOTES,
    }
  );

  return cachedGetNotes(userId);
}
