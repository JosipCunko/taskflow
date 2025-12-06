"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  getUserChats as getUserChatsAdmin,
  deleteChat as deleteChatAdmin,
  renameChat as renameChatAdmin,
} from "./ai-admin";

export async function getChats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  try {
    const chats = await getUserChatsAdmin(session.user.id);
    return { chats };
  } catch (error) {
    console.error("Error getting chats:", error);
    return { error: "Could not retrieve chats." };
  }
}

export async function renameChatAction(chatId: string, newTitle: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  try {
    await renameChatAdmin(session.user.id, chatId, newTitle);
    return { success: true };
  } catch (error) {
    console.error("Error renaming chat:", error);
    return { error: "Could not rename chat." };
  }
}

export async function deleteChat(chatId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  try {
    await deleteChatAdmin(session.user.id, chatId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { error: "Could not delete chat." };
  }
}
