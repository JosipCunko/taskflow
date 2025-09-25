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
      });
      return chatRef.id;
    }
  } catch (error) {
    console.error("Error saving chat messages:", error);
    throw new Error("Could not save chat messages.");
  }
}

export async function getLatestChatForUser(
  userId: string
): Promise<{ messages: ChatMessage[]; chatId: string | null }> {
  try {
    const querySnapshot = await adminDb
      .collection("aiChats")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return { messages: [], chatId: null };
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      messages: data.messages || [],
      chatId: doc.id,
    };
  } catch (error) {
    console.error("Error fetching latest chat for user:", error);
    throw new Error("Could not fetch chat history.");
  }
}
