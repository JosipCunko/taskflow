import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { AI_FUNCTIONS } from "@/app/_utils/utils";
import { executeFunctions } from "@/app/_lib/aiFunctions";
import { saveChatMessages } from "@/app/_lib/ai-admin";
import { ChatMessage } from "@/app/_types/types";

const apiKey = process.env.THESYS_API_KEY;

// Default model if none specified
const DEFAULT_MODEL = "c1-exp/openai/gpt-4.1";

// Thesys-enhanced system prompt for rich UI generation
const thesysSystemPrompt = `You are TaskFlow AI, an intelligent productivity assistant integrated into TaskFlow - a comprehensive personal task and life management application. Your role is to help users maximize their productivity, manage their tasks effectively, and maintain a healthy work-life balance.

CORE IDENTITY & PERSONALITY
• Be proactive, encouraging, and supportive - celebrate wins and motivate during challenges
• Use a friendly, conversational tone while maintaining professionalism
• Show empathy and understanding about workload stress and productivity challenges
• Use emojis sparingly and naturally to add warmth (not excessive)
• Think like a productivity coach, not just a task executor

🎨 RICH UI GENERATION GUIDELINES

You have access to powerful UI components. Use them appropriately:

📊 DATA VISUALIZATION:
• Use bar charts, line charts, or pie charts when showing task completion statistics
• Use progress indicators for goal tracking
• Use timeline visualizations for schedules

📋 TABLES & LISTS:
• Use tables for structured data like task lists with multiple columns
• Use formatted lists with icons for task summaries
• Use accordions for expandable task details

💬 INFORMATION DISPLAY:
• Use info cards for important announcements or tips
• Use alert/warning elements for overdue tasks or urgent matters
• Use success messages for completed actions
• Use callouts for productivity tips

🎯 INTERACTIVE ELEMENTS:
• Suggest follow-up actions with clear button-like prompts
• Use formatted code blocks for any technical content
• Use blockquotes for motivational quotes

FORMATTING BEST PRACTICES:
• Use headers (##, ###) to organize information
• Use bullet points and numbered lists for clarity
• Use bold and italic for emphasis
• Use horizontal rules (---) to separate sections
• Use markdown tables when comparing items

🔧 AVAILABLE FUNCTIONS & WHEN TO USE THEM

You have access to these functions: ${AI_FUNCTIONS.map((f) => f.name).join(
  ", "
)}

CRITICAL FUNCTION CALLING RULES:
✓ ALWAYS call functions when users explicitly request task operations
✓ Call show_tasks when users ask similar questions to: "what tasks do I have", "show my tasks", "what do I need to do"
✓ Call create_task when users say similar things to: "create task", "add task", "remind me to", "I need to"
✓ Call complete_task when users say similar things to: "mark as done", "complete task", "I finished"
✓ Call update_task when users say similar things to: "change task", "update task", "modify task"
✓ Call delay_task when users say similar things to: "postpone", "reschedule", "move task"

✗ DON'T call functions for:
  - General questions about productivity
  - Requests for advice or tips
  - Casual conversation
  - Clarifying questions (ask first, then act)

⚠️ IMPORTANT: ONLY perform actions the user explicitly requests. Never:
  - Automatically complete tasks without being asked
  - Create tasks unless user specifically requests it
  - Delete or modify tasks without explicit instruction
  - Make assumptions about what the user wants to do

📅 DATE & TIME HANDLING
• Use natural formats: "Friday, November 22" not "2024-11-22"

🔁 REPEATING TASKS - CRITICAL INSTRUCTIONS

TaskFlow supports three types of repeating tasks:

1️⃣ SPECIFIC DAYS OF THE WEEK:
   - Use "daysOfWeek": [0, 1, 4] (0 - Sunday, 1 - Monday, 4 - Friday)
   - Example: "Gym every Monday, Wednesday, and Friday"

2️⃣ TIMES PER WEEK (Flexible):
   - Use "timesPerWeek": 3
   - Example: "Go to gym 3 times this week" (any day of the week that the task needs to be completed on)

3️⃣ DAILY INTERVALS:
   - Use "interval": 2 - every 2 days
   - Example: "Water plants every 3 days"

SYSTEM-MANAGED FIELDS (Never set these):
• repetitionRule.completedAt: [] - System tracks completion timestamps
• completions: 0 - System counts completions

RESPONSE GUIDELINES & BEST PRACTICES

AFTER FUNCTION CALLS:
✓ Provide clear confirmation of what was done
✓ Summarize key details (date, priority, etc.)
✓ Offer relevant follow-up suggestions
✓ If multiple tasks affected, provide a summary count
✓ When showing tasks, use tables or formatted lists for better readability

ERROR HANDLING:
✓ Explain what went wrong in simple terms
✓ Suggest specific fixes or alternatives
✓ Never expose technical error details

PROACTIVE ASSISTANCE:
✓ Notice patterns and suggest improvements
✓ Celebrate achievements with encouraging messages
✓ Use visual indicators for progress and streaks`;

// Convert AI_FUNCTIONS to OpenAI-compatible tools format
const tools = AI_FUNCTIONS.map((func) => ({
  type: "function" as const,
  function: func,
}));

// OpenAI-compatible error response interface
interface ThesysAPIError {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

// Helper to format error responses in OpenAI-compatible format
function formatErrorResponse(
  message: string,
  type: string = "api_error",
  code: string = "unknown_error",
  param: string | null = null
): ThesysAPIError {
  return {
    error: {
      message,
      type,
      param,
      code,
    },
  };
}

// Helper to parse Thesys API errors
function parseThesysError(errorText: string): {
  message: string;
  code: string;
  userFriendly: boolean;
} {
  try {
    const errorJson = JSON.parse(errorText);

    // Handle OpenAI-compatible error format from Thesys
    if (errorJson.error?.message) {
      const code = errorJson.error.code || "api_error";
      const message = errorJson.error.message;

      // Map common error codes to user-friendly messages
      const userFriendlyErrors: Record<
        string,
        { message: string; userFriendly: boolean }
      > = {
        invalid_api_key: {
          message:
            "Authentication failed. Please check your API configuration.",
          userFriendly: true,
        },
        rate_limit_exceeded: {
          message: "Too many requests. Please wait a moment and try again.",
          userFriendly: true,
        },
        model_not_found: {
          message:
            "The selected AI model is not available. Please try a different model.",
          userFriendly: true,
        },
        context_length_exceeded: {
          message: "The conversation is too long. Please start a new chat.",
          userFriendly: true,
        },
        insufficient_quota: {
          message: "API quota exceeded. Please try again later.",
          userFriendly: true,
        },
      };

      if (userFriendlyErrors[code]) {
        return { ...userFriendlyErrors[code], code };
      }

      // Check for tool use not supported error
      if (
        code === "404" ||
        message.includes("No endpoints found that support tool use")
      ) {
        return {
          message:
            "This AI model doesn't support task operations. Please try a different model.",
          code: "tool_use_not_supported",
          userFriendly: true,
        };
      }

      return { message, code, userFriendly: false };
    }

    return {
      message: "An unexpected error occurred",
      code: "unknown_error",
      userFriendly: false,
    };
  } catch {
    return {
      message: errorText || "An unexpected error occurred",
      code: "parse_error",
      userFriendly: false,
    };
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "You must be logged in to use the AI assistant.",
          "authentication_error",
          "unauthorized"
        )
      ),
      { status: 401 }
    );
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "AI service is not configured. Please contact support.",
          "configuration_error",
          "missing_api_key"
        )
      ),
      { status: 500 }
    );
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "Invalid request format.",
          "invalid_request_error",
          "invalid_json"
        )
      ),
      { status: 400 }
    );
  }

  const { messages, modelId, chatId } = requestBody;
  const userId = session.user.id;
  const startTime = Date.now();

  // Use provided model or default
  const model = modelId || DEFAULT_MODEL;

  // Validate messages
  if (!messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "Invalid messages format. Expected an array.",
          "invalid_request_error",
          "invalid_messages"
        )
      ),
      { status: 400 }
    );
  }

  try {
    const messagesWithSystem = [
      { role: "system", content: thesysSystemPrompt },
      ...messages,
    ];

    /**
     The C1 API supports the following standard OpenAI chat completion parameters:
     * model (string, required): The model ID to use for the generation.
     * messages (array, required): A list of message objects that form the conversation history.
     * stream (boolean, optional): If true, the response will be streamed back in chunks.
     * temperature (number, optional): Controls randomness. Defaults to 1.0.
     * max_tokens (integer, optional): The maximum number of tokens to generate.
     * top_p (number, optional): Nucleus sampling parameter.
     * stop (string or array, optional): Sequences where the API will stop generating further tokens.
     */
    const response = await fetch(
      "https://api.thesys.dev/v1/embed/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: messagesWithSystem,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Thesys API error:", errorText);

      const parsedError = parseThesysError(errorText);

      return new Response(
        JSON.stringify({
          ...formatErrorResponse(
            parsedError.message,
            "api_error",
            parsedError.code
          ),
          userFriendly: parsedError.userFriendly,
        }),
        { status: response.status }
      );
    }

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        const toolCalls: {
          id: string;
          type: string;
          function: { name: string; arguments: string };
        }[] = [];
        let currentToolCall: {
          id?: string;
          type?: string;
          function?: { name?: string; arguments?: string };
          index?: number;
        } | null = null;

        try {
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No reader available");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const json = JSON.parse(data);
                  const delta = json.choices?.[0]?.delta;

                  if (delta?.content) {
                    fullContent += delta.content;
                    // Send content chunks to client
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "content",
                          content: delta.content,
                        })}\n\n`
                      )
                    );
                  }

                  // Handle tool calls
                  if (delta?.tool_calls) {
                    for (const tc of delta.tool_calls) {
                      const index = tc.index ?? 0;

                      if (tc.id) {
                        // New tool call
                        if (
                          currentToolCall &&
                          currentToolCall.index !== index
                        ) {
                          // Save previous tool call
                          if (
                            currentToolCall.id &&
                            currentToolCall.function?.name &&
                            currentToolCall.function?.arguments
                          ) {
                            toolCalls.push({
                              id: currentToolCall.id,
                              type: "function",
                              function: {
                                name: currentToolCall.function.name,
                                arguments: currentToolCall.function.arguments,
                              },
                            });
                          }
                        }
                        currentToolCall = {
                          id: tc.id,
                          type: tc.type || "function",
                          function: {
                            name: tc.function?.name || "",
                            arguments: tc.function?.arguments || "",
                          },
                          index,
                        };
                      } else if (currentToolCall && tc.function) {
                        // Continue building current tool call
                        if (tc.function.name) {
                          currentToolCall.function =
                            currentToolCall.function || {
                              name: "",
                              arguments: "",
                            };
                          currentToolCall.function.name += tc.function.name;
                        }
                        if (tc.function.arguments) {
                          currentToolCall.function =
                            currentToolCall.function || {
                              name: "",
                              arguments: "",
                            };
                          currentToolCall.function.arguments +=
                            tc.function.arguments;
                        }
                      }
                    }
                  }
                } catch {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }

          // Save last tool call if exists
          if (
            currentToolCall?.id &&
            currentToolCall.function?.name &&
            currentToolCall.function?.arguments
          ) {
            toolCalls.push({
              id: currentToolCall.id,
              type: "function",
              function: {
                name: currentToolCall.function.name,
                arguments: currentToolCall.function.arguments,
              },
            });
          }

          // Execute tool calls if any
          if (toolCalls.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "tool_start" })}\n\n`
              )
            );

            const functionCalls = toolCalls.map((call) => ({
              name: call.function.name,
              arguments: JSON.parse(call.function.arguments),
            }));

            const functionResults = await executeFunctions(functionCalls);

            // Make follow-up request with tool results
            const followUpMessages = [
              { role: "system", content: thesysSystemPrompt },
              ...(Array.isArray(messages) ? messages : []),
              {
                role: "assistant",
                content: fullContent || null,
                tool_calls: toolCalls,
              },
              ...functionResults.map((result, i) => ({
                role: "tool" as const,
                tool_call_id: toolCalls[i].id,
                name: result.name,
                content: JSON.stringify(result.result),
              })),
            ];

            const followUpResponse = await fetch(
              "https://api.thesys.dev/v1/embed/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model,
                  messages: followUpMessages,
                  temperature: 0.7,
                  stream: true,
                }),
              }
            );

            if (followUpResponse.ok) {
              const followUpReader = followUpResponse.body?.getReader();
              if (followUpReader) {
                fullContent = ""; // Reset for follow-up content

                while (true) {
                  const { done, value } = await followUpReader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      if (data === "[DONE]") continue;

                      try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta;

                        if (delta?.content) {
                          fullContent += delta.content;
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({
                                type: "content",
                                content: delta.content,
                              })}\n\n`
                            )
                          );
                        }
                      } catch {
                        // Ignore JSON parse errors for incomplete chunks
                      }
                    }
                  }
                }
              }
            } else {
              // Handle follow-up error gracefully
              const followUpError = await followUpResponse.text();
              console.error("Follow-up request error:", followUpError);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "content",
                    content:
                      "\n\n*Note: There was an issue processing the results. Please try again.*",
                  })}\n\n`
                )
              );
            }

            // Send function results to client
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_results",
                  results: functionResults,
                })}\n\n`
              )
            );
          }

          // Calculate duration
          const endTime = Date.now();
          const duration = parseFloat(
            ((endTime - startTime) / 1000).toFixed(2)
          );

          // Save chat messages to database
          const responseMessage: ChatMessage = {
            role: "assistant",
            content: fullContent,
            duration,
            functionResults:
              toolCalls.length > 0
                ? toolCalls.map((tc) => ({
                    name: tc.function.name,
                    result: JSON.parse(tc.function.arguments),
                  }))
                : undefined,
            modelId: model,
          };

          const allMessages: ChatMessage[] = [
            ...(messages as ChatMessage[]),
            responseMessage,
          ];

          let newChatId = chatId;
          try {
            newChatId = await saveChatMessages(userId, allMessages, chatId);
          } catch (saveError) {
            console.error("Error saving chat:", saveError);
            // Continue without failing the request
          }

          // Send completion
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                chatId: newChatId,
                duration,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error:
                  "An error occurred while processing your request. Please try again.",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in Thesys stream endpoint:", error);
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "An unexpected error occurred. Please try again.",
          "internal_error",
          "server_error"
        )
      ),
      { status: 500 }
    );
  }
}
