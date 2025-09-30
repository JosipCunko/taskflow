"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import {
  saveChatMessages,
  getUserChats as getUserChatsAdmin,
  getChat as getChatAdmin,
  deleteChat as deleteChatAdmin,
} from "./aiAdmin";
import { ChatMessage, FunctionResult } from "@/app/_types/types";
import { executeFunctions } from "./aiFunctions";
import { AI_FUNCTIONS } from "@/app/_utils/utils";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const apiKey = process.env.OPENROUTER_DEEPSEEK_API_KEY;

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const tools = AI_FUNCTIONS.map((func) => ({
  type: "function",
  function: func,
}));

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
    // Enhanced system prompt with function calling instructions
    const systemPrompt = `You are an AI assistant for TaskFlow, a personal productivity app. You help users manage their tasks and notes efficiently.

IMPORTANT FUNCTION CALLING RULES:
- When users ask you to show, delay, update, complete, or create tasks/notes, you MUST call the appropriate functions
- Always call functions when users request task or note operations
- You have access to the following functions: ${AI_FUNCTIONS.map(
      (f) => f.name
    ).join(", ")}
- Be proactive in suggesting task management improvements
- When showing tasks, provide helpful insights about priorities, deadlines, and workload

RESPONSE GUIDELINES:
- After calling functions, provide a natural language summary of what was done
- Be encouraging and supportive in your responses
- Offer productivity tips and suggestions when appropriate
- If function calls fail, explain what went wrong and suggest alternatives

Current date: ${new Date().toISOString().split("T")[0]}

Remember: You are not just answering questions - you are actively helping manage the user's productivity system through function calls.`;

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

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
          messages: messagesWithSystem,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return { error: `API request failed with status ${response.status}` };
    }

    const data = await response.json();
    const message = data.choices[0].message;
    let aiResponse = message.content || "";
    let functionResults: FunctionResult[] = [];

    // Check if the response contains raw tool call markup and clean it
    if (aiResponse && aiResponse.includes("tool▁calls▁begin") || aiResponse.includes("tool▁call▁begin")) {
      console.warn("Raw tool call markup detected in response, cleaning...");
      // Remove raw tool call markup patterns
      aiResponse = aiResponse
        .replace(/<｜.*?tool.*?calls.*?begin.*?｜>/g, "")
        .replace(/<｜.*?tool.*?call.*?begin.*?｜>/g, "")
        .replace(/<｜.*?tool.*?sep.*?｜>/g, "")
        .replace(/<｜.*?tool.*?call.*?end.*?｜>/g, "")
        .replace(/<｜.*?tool.*?calls.*?end.*?｜>/g, "")
        .replace(/^[^a-zA-Z]*/, "") // Remove leading non-alphabetic characters
        .trim();
      
      // If the response is now empty or very short, provide a fallback
      if (aiResponse.length < 10) {
        aiResponse = "I apologize, but I encountered an issue processing your request. Please try rephrasing your question.";
      }
    }

    // Handle function calls if present
    if (message.tool_calls) {
      try {
        const functionCalls = message.tool_calls.map(
          (call: { function: { name: string; arguments: string } }) => ({
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments),
          })
        );

        functionResults = await executeFunctions(functionCalls);

        // Define a more specific type for API messages
        type ApiChatMessage =
          | ChatMessage
          | { role: "system"; content: string }
          | {
              role: "assistant";
              content: string | null;
              tool_calls: {
                id: string;
                type: "function";
                function: { name: string; arguments: string };
              }[];
            }
          | {
              role: "tool";
              tool_call_id: string;
              name: string;
              content: string;
            };

        // Generate a follow-up response based on function results
        const followUpMessages: ApiChatMessage[] = [
          { role: "system", content: systemPrompt },
          ...messages,
          {
            role: "assistant",
            content: aiResponse,
            tool_calls: message.tool_calls,
          },
        ];

        functionResults.forEach((result, i) => {
          followUpMessages.push({
            role: "tool",
            tool_call_id: message.tool_calls[i].id,
            name: result.name,
            content: JSON.stringify(result.result),
          });
        });

        const followUpResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat-v3.1:free",
              messages: followUpMessages,
              temperature: 0.7,
            }),
          }
        );

        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json();
          aiResponse = followUpData.choices[0].message.content;
        }
      } catch (funcError) {
        console.error("Error executing function:", funcError);
        aiResponse =
          "I tried to help you with that task, but encountered an error. Please try again or rephrase your request.";
      }
    }

    const formattedResponse = aiResponse
      ? purify.sanitize(marked(aiResponse) as string)
      : "";

    const endTime = Date.now();
    const duration = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    const responseMessage: ChatMessage = {
      role: "assistant",
      content: formattedResponse,
      duration,
      functionResults: functionResults.length > 0 ? functionResults : undefined,
    };
    /*
    { role: "assistant", content: aiResponse, duration },
      response: { role: "assistant", content: aiResponse, duration },
    */
    const newMessages: ChatMessage[] = [...messages, responseMessage];
    const newChatId = await saveChatMessages(userId, newMessages, chatId);

    return {
      response: responseMessage,
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

export async function getChat(chatId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  try {
    const chat = await getChatAdmin(session.user.id, chatId);
    return { chat };
  } catch (error) {
    console.error("Error getting chat:", error);
    return { error: "Could not retrieve chat." };
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
