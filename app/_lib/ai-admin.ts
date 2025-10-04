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
      const title =
        messages.length > 0 && messages[0].content.length > 30
          ? messages[0].content.substring(0, 30) + "..."
          : messages[0].content;

      const chatRef = adminDb.collection("aiChats").doc();
      await chatRef.set({
        userId,
        messages: sanitizedMessages,
        createdAt: new Date(),
        title: title,
      });
      return chatRef.id;
    }
  } catch (error) {
    console.error("Error saving chat messages:", error);
    throw new Error("Could not save chat messages.");
  }
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

    return {
      messages: data.messages || [],
      title: data.title || "Untitled Chat",
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw new Error("Could not fetch chat.");
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
