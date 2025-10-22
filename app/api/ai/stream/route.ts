import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { ChatMessage } from "@/app/_types/types";
import { systemPrompt, AI_FUNCTIONS } from "@/app/_utils/utils";
import { executeFunctions } from "@/app/_lib/aiFunctions";
import { saveChatMessages } from "@/app/_lib/ai-admin";

const apiKey = process.env.OPENROUTER_API_KEY;

const tools = AI_FUNCTIONS.map((func) => ({
  type: "function",
  function: func,
}));

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
    });
  }

  const { messages, chatId, modelId } = await request.json();
  const userId = session.user.id;
  const startTime = Date.now();

  try {
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
          model: modelId,
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
      console.error("OpenRouter API error:", errorText);
      return new Response(
        JSON.stringify({ error: `API request failed: ${response.status}` }),
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
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
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
            const followUpMessages: (
              | ChatMessage
              | { role: "system"; content: string }
              | {
                  role: "assistant";
                  content: string | null;
                  tool_calls: typeof toolCalls;
                }
              | {
                  role: "tool";
                  tool_call_id: string;
                  name: string;
                  content: string;
                }
            )[] = [
              { role: "system", content: systemPrompt },
              ...messages,
              {
                role: "assistant",
                content: fullContent || null,
                tool_calls: toolCalls,
              },
            ];

            functionResults.forEach((result, i) => {
              followUpMessages.push({
                role: "tool",
                tool_call_id: toolCalls[i].id,
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
                  model: modelId,
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
                      } catch (e) {
                        console.error("Error parsing follow-up SSE data:", e);
                      }
                    }
                  }
                }
              }
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

          // Save chat
          const responseMessage: ChatMessage = {
            role: "assistant",
            content: fullContent,
            duration,
            functionResults: toolCalls.length > 0 ? undefined : undefined,
          };

          const newMessages: ChatMessage[] = [...messages, responseMessage];
          const newChatId = await saveChatMessages(userId, newMessages, chatId);

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
                error: "Stream error occurred",
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
    console.error("Error in stream endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
