"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { saveChatMessages } from "./aiAdmin";
import { ChatMessage } from "@/app/_types/types";
import { AI_FUNCTIONS, executeFunctions } from "./aiFunctions";
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
    // Enhanced system prompt with function calling instructions
    const systemPrompt = `You are an AI assistant for TaskFlow, a personal productivity app. You help users manage their tasks and notes efficiently.

IMPORTANT FUNCTION CALLING RULES:
- When users ask you to show, delay, update, complete, or create tasks/notes, you MUST call the appropriate functions
- Always call functions when users request task or note operations
- You have access to the following functions: ${AI_FUNCTIONS.map(f => f.name).join(', ')}
- For schedule changes, ALWAYS propose the schedule first before applying changes
- Be proactive in suggesting task management improvements
- When showing tasks, provide helpful insights about priorities, deadlines, and workload

RESPONSE GUIDELINES:
- After calling functions, provide a natural language summary of what was done
- Be encouraging and supportive in your responses
- Offer productivity tips and suggestions when appropriate
- If function calls fail, explain what went wrong and suggest alternatives

Current date: ${new Date().toISOString().split('T')[0]}

Remember: You are not just answering questions - you are actively helping manage the user's productivity system through function calls.`;

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...messages
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
          functions: AI_FUNCTIONS,
          function_call: "auto",
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
    let functionResults = [];

    // Handle function calls if present
    if (message.function_call) {
      try {
        const functionCall = {
          name: message.function_call.name,
          arguments: JSON.parse(message.function_call.arguments)
        };
        
        functionResults = await executeFunctions([functionCall]);
        
        // Generate a follow-up response based on function results
        const functionResultsText = functionResults.map(result => 
          `Function ${result.name}: ${JSON.stringify(result.result)}`
        ).join('\n');

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
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
                { role: "assistant", content: aiResponse, function_call: message.function_call },
                { role: "function", name: functionCall.name, content: functionResultsText }
              ],
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
        aiResponse = "I tried to help you with that task, but encountered an error. Please try again or rephrase your request.";
      }
    }

    const endTime = Date.now();
    const duration = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    const responseMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      duration,
      functionResults: functionResults.length > 0 ? functionResults : undefined
    };

    const newMessages: ChatMessage[] = [
      ...messages,
      responseMessage,
    ];
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
