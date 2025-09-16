"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { saveChatMessages } from "./aiAdmin";
import { ChatMessage } from "@/app/_types/types";
const apiKey = process.env.OPENROUTER_DEEPSEEK_API_KEY;

export async function getDeepseekResponse(
  messages: ChatMessage[],
  chatId?: string | null
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  const userId = session.user.id;
  const startTime = Date.now();

  if (!apiKey) {
    return { error: "OpenRouter API key not found." };
  }
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return { error: `API request failed with status ${response.status}` };
    }
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const endTime = Date.now();
    const duration = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "assistant", content: aiResponse, duration },
    ];
    const newChatId = await saveChatMessages(userId, newMessages, chatId);

    return {
      response: { role: "assistant", content: aiResponse, duration },
      chatId: newChatId,
    };
  } catch (error) {
    console.error(
      "Failed to perform a chat interaction with DeepseekV3.1:",
      error
    );
    return { error: "An unexpected error occurred." };
  }
}
