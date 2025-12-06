import "server-only";
import { adminDb } from "./admin";
import { ChatMessage } from "../_types/types";

// Utility function to remove undefined properties from objects, not necessary with adminDb.settings({ ignoreUndefinedProperties: true });
function sanitizeForFirestore(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  }
  return obj;
}

export async function getUserChats(
  userId: string
): Promise<{ id: string; title: string }[]> {
  try {
    const querySnapshot = await adminDb
      .collection("aiChats")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || "Untitled Chat",
    }));
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw new Error("Could not fetch user chats.");
  }
}

export async function getChat(
  userId: string,
  chatId: string
): Promise<{ messages: ChatMessage[]; title: string } | null> {
  try {
    const doc = await adminDb.collection("aiChats").doc(chatId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (data?.userId !== userId) {
      // Security check
      return null;
    }

    // Return messages as-is - C1Component handles all rendering on the frontend
    // The raw content format is required for proper rich UI element rendering
    return {
      messages: data.messages || [],
      title: data.title || "Untitled Chat",
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw new Error("Could not fetch chat.");
  }
}

export async function saveChatMessages(
  userId: string,
  messages: ChatMessage[],
  chatId?: string | null
): Promise<string> {
  try {
    // Sanitize messages to remove undefined properties
    const sanitizedMessages = sanitizeForFirestore(messages);

    if (chatId) {
      const chatRef = adminDb.collection("aiChats").doc(chatId);
      await chatRef.update({ messages: sanitizedMessages });
      return chatId;
    } else {
      const chatRef = adminDb.collection("aiChats").doc();
      await chatRef.set({
        userId,
        messages: sanitizedMessages,
        createdAt: new Date(),
        title: "New Chat",
      });
      return chatRef.id;
    }
  } catch (error) {
    console.error("Error saving chat messages:", error);
    throw new Error("Could not save chat messages.");
  }
}

export async function renameChat(
  userId: string,
  chatId: string,
  newTitle: string
): Promise<void> {
  try {
    const chatRef = adminDb.collection("aiChats").doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      throw new Error("Chat not found.");
    }

    const data = doc.data();
    if (data?.userId !== userId) {
      throw new Error("User not authorized to rename this chat.");
    }

    await chatRef.update({ title: newTitle });
  } catch (error) {
    console.error("Error renaming chat:", error);
    throw new Error("Could not rename chat.");
  }
}

export async function deleteChat(
  userId: string,
  chatId: string
): Promise<void> {
  try {
    const chatRef = adminDb.collection("aiChats").doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      throw new Error("Chat not found.");
    }
    const data = doc.data();
    if (data?.userId !== userId) {
      throw new Error("User not authorized to delete this chat.");
    }
    await chatRef.delete();
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Could not delete chat.");
  }
}
