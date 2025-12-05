"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage, FunctionResult } from "@/app/_types/types";
import ThinkingIndicator from "./ThinkingIndicator";
import Image from "next/image";
import Textarea from "../reusable/Textarea";
import EmptyChat from "./EmptyChat";
import FunctionResults from "./FunctionResults";
import ModelDropdown, { models, AIModel } from "./ModelDropdown";
import { errorToast } from "@/app/_utils/utils";
import { C1Component, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

interface ChatProps {
  initialMessages: ChatMessage[];
  chatId: string | null;
  userName?: string | null;
  userImage?: string | null;
}

const getModelNameFromId = (modelId: string | undefined): string => {
  if (!modelId) return "AI Assistant";
  const model = models.find((m) => m.id === modelId);
  return model?.name || "AI Assistant";
};

// TaskFlow theme for C1Component - matches globals.css
const taskflowTheme = {
  mode: "dark" as const,
  theme: {
    // Backgrounds
    backgroundFills: "#0b0f20",
    containerFills: "#121a33",
    sunkFills: "#192444",
    elevatedFills: "#0e1327",
    overlayFills: "rgba(11, 15, 32, 0.9)",
    invertedFills: "#ffffff",

    // Text colors
    primaryText: "#c5d1e1",
    secondaryText: "#6b7280",
    disabledText: "#3a455b",
    linkText: "#3399ff",

    // Accent/Brand colors
    accentPrimaryText: "#3399ff",
    accentSecondaryText: "#56b3ff",
    brandText: "#3399ff",
    brandSecondaryText: "#56b3ff",

    // Status colors
    successPrimaryText: "#00c853",
    dangerPrimaryText: "#cf6679",
    infoPrimaryText: "#2d89e6",
    alertPrimaryText: "#ffd600",

    // Interactive elements
    interactiveDefault: "#192444",
    interactiveHover: "#121a33",
    interactivePressed: "#0e1327",
    interactiveAccent: "#3399ff",
    interactiveAccentHover: "#2d89e6",
    interactiveAccentPressed: "#2779cc",

    // Strokes/borders
    strokeDefault: "#16426b",
    strokeInteractiveEl: "#192444",
    strokeEmphasis: "#3399ff",
    strokeAccent: "#3399ff",
    strokeSuccess: "#00c853",
    strokeDanger: "#cf6679",
    strokeInfo: "#2d89e6",

    // Chat specific
    chatContainerBg: "#0b0f20",
    chatAssistantResponseBg: "#121a33",
    chatAssistantResponseText: "#c5d1e1",
    chatUserResponseBg: "rgba(51, 153, 255, 0.1)",
    chatUserResponseText: "#c5d1e1",

    // Fills for various states
    successFills: "rgba(0, 200, 83, 0.15)",
    dangerFills: "rgba(207, 102, 121, 0.15)",
    infoFills: "rgba(45, 137, 230, 0.15)",
    alertFills: "rgba(255, 214, 0, 0.15)",

    // Highlight
    highlightSubtle: "rgba(51, 153, 255, 0.1)",
    highlightStrong: "rgba(51, 153, 255, 0.25)",

    // Chart colors
    defaultChartPalette: [
      "#3399ff",
      "#ff944d",
      "#00c853",
      "#a0d8ff",
      "#ffd600",
      "#cf6679",
    ],

    // Rounded corners
    roundedS: "0.5rem",
    roundedM: "0.75rem",
    roundedL: "1rem",
    roundedXl: "1.5rem",
  },
};

export default function Chat({
  initialMessages,
  chatId: initialChatId,
  userName,
  userImage,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(models[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    setChatId(initialChatId);
  }, [initialMessages, initialChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const fakeEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(fakeEvent);
  };

  // Handle C1Component actions (user interactions with rich UI)
  const handleC1Action = useCallback(
    (event: { humanFriendlyMessage: string; llmFriendlyMessage: string }) => {
      console.log("C1 Action:", event);
      // Could be used to trigger follow-up messages or actions
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage = input;
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setInput("");
    setIsPending(true);
    setStreamingContent("");

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Use Thesys API endpoint
      const response = await fetch("/api/ai/thesys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          chatId: chatId,
          modelId: selectedModel.id,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Handle Thesys/OpenAI compatible error format
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          // Handle OpenAI-compatible error format
          if (errorData.error?.message) {
            errorMsg = errorData.error.message;
          } else if (errorData.error) {
            errorMsg =
              typeof errorData.error === "string"
                ? errorData.error
                : JSON.stringify(errorData.error);
          }
          if (errorData.userFriendly) {
            errorToast(errorMsg);
            setMessages(newMessages.slice(0, -1));
            setIsPending(false);
            setStreamingContent("");
            return;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      let functionResults: FunctionResult[] | undefined;
      let duration = 0;
      let newChatId = chatId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content") {
                accumulatedContent += parsed.content;
                // Store raw content for C1Component rendering
                setStreamingContent(accumulatedContent);
              } else if (parsed.type === "tool_start") {
                // Tool execution started - append indicator to content
                setStreamingContent(
                  accumulatedContent + "\n\n*Executing actions...*"
                );
              } else if (parsed.type === "tool_results") {
                functionResults = parsed.results;
              } else if (parsed.type === "done") {
                duration = parsed.duration;
                newChatId = parsed.chatId;
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Only log if it's not a JSON parse error from incomplete chunks
              if (data && data !== "[DONE]") {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
      }

      // Store raw content for C1Component - it handles its own rendering
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: accumulatedContent,
        duration,
        functionResults,
        modelId: selectedModel.id,
        modelName: selectedModel.name,
      };

      setMessages([...newMessages, assistantMessage]);
      setStreamingContent("");

      if (newChatId && !chatId) {
        setChatId(newChatId);
        router.replace(`/webapp/ai/${newChatId}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Stream error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get AI response";
        errorToast(errorMessage);
        setMessages(newMessages.slice(0, -1));
      }
    } finally {
      setIsPending(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <ThemeProvider {...taskflowTheme}>
      <div className="flex flex-col h-full w-full">
        {messages.length === 0 ? (
          <EmptyChat onExampleClick={handleExampleClick} />
        ) : (
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto pt-16 md:pt-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.role === "assistant" ? (
                      <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                        <Bot size={18} className="text-primary-500" />
                      </div>
                    ) : userImage ? (
                      <Image
                        src={userImage}
                        width={32}
                        height={32}
                        alt={userName || "User"}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-background-600 flex items-center justify-center">
                        <User size={18} className="text-primary-400" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {msg.role === "assistant" ? (
                      <>
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-primary-400">
                            {msg.modelName || getModelNameFromId(msg.modelId)}
                          </span>
                        </div>
                        <div className="rounded-lg p-4 bg-background-600 border border-background-500">
                          {msg.content ? (
                            <div className="text-sm leading-relaxed ai-response prose prose-invert max-w-none c1-message-container">
                              <C1Component
                                c1Response={msg.content}
                                isStreaming={false}
                                onAction={handleC1Action}
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-text-low italic">
                              No response generated
                            </p>
                          )}
                          {msg.functionResults && (
                            <div className="mt-3">
                              <FunctionResults results={msg.functionResults} />
                            </div>
                          )}
                          {msg.duration && (
                            <p className="text-xs text-blue-400 mt-2">
                              {msg.duration}s
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 text-right">
                          <span className="text-sm font-semibold text-text-high">
                            {userName || "You"}
                          </span>
                        </div>
                        <div className="rounded-lg p-4 bg-primary-500/10 border border-primary-500/30">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                      <Bot size={18} className="text-primary-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-primary-400">
                        {selectedModel.name}
                      </span>
                    </div>
                    {streamingContent ? (
                      <div className="rounded-lg p-4 bg-background-600 border border-background-500">
                        <div className="text-sm leading-relaxed ai-response prose prose-invert max-w-none c1-message-container">
                          <C1Component
                            c1Response={streamingContent}
                            isStreaming={true}
                            onAction={handleC1Action}
                          />
                        </div>
                      </div>
                    ) : (
                      <ThinkingIndicator />
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="p-3 md:p-6 border-t border-background-600">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-stretch gap-2"
            >
              <div className="flex-shrink-0 order-2 sm:order-1">
                <ModelDropdown
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  className="w-full sm:w-auto"
                />
              </div>
              <div className="flex-1 flex items-end gap-2 bg-background-600 border border-background-500 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus-within:border-primary-500/50 transition-colors order-1 sm:order-2">
                <Textarea
                  name="message"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm sm:text-base max-h-32 overflow-y-auto"
                  disabled={isPending}
                />
                <button
                  type="submit"
                  className="bg-primary-500 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary-600 flex-shrink-0 mb-0.5"
                  disabled={isPending || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
