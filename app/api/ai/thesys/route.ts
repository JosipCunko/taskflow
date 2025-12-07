import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { AI_FUNCTIONS } from "@/app/_utils/utils";
import { executeFunctions } from "@/app/_lib/aiFunctions";
import { saveChatMessages } from "@/app/_lib/ai-admin";
import { ChatMessage } from "@/app/_types/types";
import { getUserById } from "@/app/_lib/user-admin";
import { canMakePrompt, getRemainingPrompts } from "@/app/_lib/stripe";
import { adminDb } from "@/app/_lib/admin";
import { startOfDay } from "date-fns";

const apiKey = process.env.THESYS_API_KEY;

// Default model if none specified
const DEFAULT_MODEL = "c1-exp/openai/gpt-4.1/v-20250709";

// Types for SSE streaming
interface ToolCall {
  id: string;
  type: string;
  function: { name: string; arguments: string };
}

interface PartialToolCall {
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: string };
  index?: number;
}

interface StreamState {
  fullContent: string;
  toolCalls: ToolCall[];
  currentToolCall: PartialToolCall | null;
}

// Helper to send SSE events
function createSSEEncoder() {
  const encoder = new TextEncoder();
  return {
    encode: (type: string, data: Record<string, unknown>) =>
      encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`),
    encodeContent: (content: string) =>
      encoder.encode(
        `data: ${JSON.stringify({ type: "content", content })}\n\n`
      ),
  };
}

// Helper to parse a single SSE line and update stream state
function parseSSELine(
  line: string,
  state: StreamState
): { content?: string; done?: boolean } {
  if (!line.startsWith("data: ")) return {};

  const data = line.slice(6);
  if (data === "[DONE]") return { done: true };

  try {
    const json = JSON.parse(data);
    const delta = json.choices?.[0]?.delta;

    // Handle content
    if (delta?.content) {
      state.fullContent += delta.content;
      return { content: delta.content };
    }

    // Handle tool calls
    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        const index = tc.index ?? 0;

        if (tc.id) {
          // Save previous tool call if switching to new one
          if (state.currentToolCall && state.currentToolCall.index !== index) {
            finalizeToolCall(state);
          }
          // Start new tool call
          state.currentToolCall = {
            id: tc.id,
            type: tc.type || "function",
            function: {
              name: tc.function?.name || "",
              arguments: tc.function?.arguments || "",
            },
            index,
          };
        } else if (state.currentToolCall && tc.function) {
          // Continue building current tool call
          state.currentToolCall.function = state.currentToolCall.function || {
            name: "",
            arguments: "",
          };
          if (tc.function.name) {
            state.currentToolCall.function.name += tc.function.name;
          }
          if (tc.function.arguments) {
            state.currentToolCall.function.arguments += tc.function.arguments;
          }
        }
      }
    }
  } catch {
    // Ignore JSON parse errors for incomplete chunks
  }

  return {};
}

// Helper to finalize and save a tool call
function finalizeToolCall(state: StreamState): void {
  if (
    state.currentToolCall?.id &&
    state.currentToolCall.function?.name &&
    state.currentToolCall.function?.arguments
  ) {
    state.toolCalls.push({
      id: state.currentToolCall.id,
      type: "function",
      function: {
        name: state.currentToolCall.function.name,
        arguments: state.currentToolCall.function.arguments,
      },
    });
  }
}

// Helper to process a stream and extract content/tool calls
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  state: StreamState,
  onContent?: (content: string) => void
): Promise<void> {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      const result = parseSSELine(line, state);
      if (result.content && onContent) {
        onContent(result.content);
      }
    }
  }

  // Finalize any remaining tool call
  finalizeToolCall(state);
}

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

Use tables to show structured data such as financial highlights, key executives, or product lists. - Use graphs to visualize quantitative information like stock performance or revenue growth. - Use carousels to show information about products from the company. 

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

🔘 ACTIONABLE UI BUTTONS:
When generating interactive buttons or clickable elements, you can include action attributes that trigger app functionality. Use the following action format:

Available actions:
• action:navigate:/webapp/tasks - Navigate to the tasks page
• action:navigate:/webapp/today - Navigate to today's tasks
• action:navigate:/webapp/fitness - Navigate to fitness tracking
• action:navigate:/webapp/health - Navigate to health tracking
• action:complete_task:TASK_ID - Mark a specific task as complete (replace TASK_ID with actual ID)
• action:view_task:TASK_ID - View task details (replace TASK_ID with actual ID)
• action:refresh_tasks - Refresh the task list

Example usage in responses:
- After showing tasks, offer quick actions like "Complete this task" with action:complete_task:abc123
- Suggest navigation like "View all tasks" with action:navigate:/webapp/tasks
- When a task is created, offer "View task" with action:view_task:NEW_TASK_ID

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
   - Pattern: User specifies exact days

2️⃣ TIMES PER WEEK (Flexible):
   - Use "timesPerWeek": 3
   - Example: "Go to gym 3 times this week" (any days)
   - User can complete on any days they choose

3️⃣ DAILY INTERVALS:
   - Use "interval": 2 - every 2 days
   - Example: "Water plants every 3 days"

SYSTEM-MANAGED FIELDS (Never set these):
• repetitionRule.completedAt: [] - System tracks completion timestamps
• completions: 0 - System counts completions

EXAMPLES:
• "Gym 4 times a week on Mon, Wed, Fri, Sun":
  { "daysOfWeek": [0, 1, 3, 5] } (0 - Sunday, 1 - Monday, 3 - Wednesday, 5 - Friday)
  
• "Go to gym 3 times a week at any day, not on specific days":
  { "timesPerWeek": 3 }

• "Meditate every day":
  { "interval": 1 }

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
✓ Example: "I couldn't find that task. Could you describe it differently?"

TASK ATTRIBUTES & CUSTOMIZATION

PRIORITY:
• Suggest priority for urgent or important tasks

TASK PROPERTIES:
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  delayCount: number;
  autoDelay?: boolean; // Automatically delay task to next day if missed
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  experience?: "bad" | "okay" | "good" | "best";
  location?: string;
  dueDate: number;
  startDate?: number;
  startTime?: { hour: number; minute: number };
  completedAt?: number;
  /**Delayed is pending but rescheduled */
  status: "pending" | "completed" | "delayed";
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  duration?: {
    hours: number;
    minutes: number;
  };
  risk?: boolean;
  points: number;

TaskFlow includes:
• Smart task management with dependencies
• Auto-rescheduling for missed tasks
• Experience points and streaks for gamification
• Custom tags and categories
• Calendar integration
• Progress tracking and analytics
• Health and fitness tracking
• Notes and documentation

Mention these features naturally when relevant to user needs.

⚡ FINAL REMINDERS

1. You are actively managing the user's productivity system - not just answering questions
2. Function calls are your primary tool - use them confidently
3. User experience is paramount - be helpful, not robotic
4. Privacy matters - never share task details outside of user context
5. When in doubt, ask - don't assume
6. Always confirm destructive actions before executing
7. Keep learning from user preferences and adapt your suggestions

`;

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

  // Rate limiting based on subscription plan
  const user = await getUserById(session.user.id);
  if (!user) {
    return new Response(
      JSON.stringify(
        formatErrorResponse(
          "User not found.",
          "authentication_error",
          "user_not_found"
        )
      ),
      { status: 404 }
    );
  }

  // Check if it's a new day and reset prompt count
  const today = startOfDay(new Date()).getTime();
  let promptsToday = user.aiPromptsToday || 0;

  if (!user.lastPromptDate || user.lastPromptDate < today) {
    // New day, reset count
    promptsToday = 0;
  }

  const plan = user.currentPlan || "base";

  if (!canMakePrompt(plan, promptsToday)) {
    const remaining = getRemainingPrompts(plan, promptsToday);
    return new Response(
      JSON.stringify({
        ...formatErrorResponse(
          `You've reached your daily AI prompt limit. ${
            plan === "base"
              ? "Upgrade to Pro for 10 prompts/day or Ultra for unlimited prompts."
              : "Upgrade to Ultra for unlimited prompts."
          }`,
          "rate_limit_error",
          "daily_limit_exceeded"
        ),
        userFriendly: true,
        remaining,
        plan,
      }),
      { status: 429 }
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

    // Initialize SSE helpers
    const sse = createSSEEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Initialize stream state
        const state: StreamState = {
          fullContent: "",
          toolCalls: [],
          currentToolCall: null,
        };

        try {
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No reader available");

          // Process initial stream
          await processStream(reader, decoder, state, (content) => {
            controller.enqueue(sse.encodeContent(content));
          });

          // Execute tool calls if any
          if (state.toolCalls.length > 0) {
            controller.enqueue(sse.encode("tool_start", {}));

            const functionCalls = state.toolCalls.map((call) => ({
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
                content: state.fullContent || null,
                tool_calls: state.toolCalls,
              },
              ...functionResults.map((result, i) => ({
                role: "tool" as const,
                tool_call_id: state.toolCalls[i].id,
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
                // Reset content for follow-up response
                const followUpState: StreamState = {
                  fullContent: "",
                  toolCalls: [],
                  currentToolCall: null,
                };

                await processStream(
                  followUpReader,
                  decoder,
                  followUpState,
                  (content) => {
                    controller.enqueue(sse.encodeContent(content));
                  }
                );

                state.fullContent = followUpState.fullContent;
              }
            } else {
              const followUpError = await followUpResponse.text();
              console.error("Follow-up request error:", followUpError);
              controller.enqueue(
                sse.encodeContent(
                  "\n\n*Note: There was an issue processing the results. Please try again.*"
                )
              );
            }

            // Send function results to client
            controller.enqueue(
              sse.encode("tool_results", { results: functionResults })
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
            content: state.fullContent,
            duration,
            functionResults:
              state.toolCalls.length > 0
                ? state.toolCalls.map((tc) => ({
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

            // Increment prompt count for rate limiting
            const userRef = adminDb.collection("users").doc(userId);
            await userRef.update({
              aiPromptsToday: (promptsToday || 0) + 1,
              lastPromptDate: today,
            });
          } catch (saveError) {
            console.error("Error saving chat:", saveError);
          }

          // Send completion
          controller.enqueue(
            sse.encode("done", { chatId: newChatId, duration })
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            sse.encode("error", {
              error:
                "An error occurred while processing your request. Please try again.",
            })
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
