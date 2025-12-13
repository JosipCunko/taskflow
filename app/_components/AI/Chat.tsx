"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage, FunctionResult } from "@/app/_types/types";
import ThinkingIndicator from "./ThinkingIndicator";
import Image from "next/image";
import Textarea from "../reusable/Textarea";
import FunctionResults from "./FunctionResults";
import ModelDropdown, { models, AIModel } from "./ModelDropdown";
import { errorToast, successToast, taskflowTheme } from "@/app/_utils/utils";
import dynamic from "next/dynamic";
import "@crayonai/react-ui/styles/index.css";
import { completeTaskAction } from "@/app/_lib/actions";
import { motion } from "framer-motion";
import { PromptLimitInfo } from "./AIPageClient";
import UpgradePlan from "../UpgradePlan";

// Dynamically import C1Component with SSR disabled to prevent "document is not defined" errors
const C1Component = dynamic(
  () => import("@thesysai/genui-sdk").then((mod) => mod.C1Component),
  { ssr: false }
);

const ThemeProvider = dynamic(
  () => import("@thesysai/genui-sdk").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

// Action types supported by C1Component interactions
type CustomActionType =
  | "navigate"
  | "complete_task"
  | "view_task"
  | "refresh_tasks"
  | "followup";

interface ParsedAction {
  type: CustomActionType;
  payload?: string;
  originalMessage: string;
}

// Parse action string from llmFriendlyMessage
// Format: "action:type:payload" or just a message for follow-up
function parseC1Action(llmFriendlyMessage: string): ParsedAction {
  if (llmFriendlyMessage.startsWith("action:")) {
    const parts = llmFriendlyMessage.split(":");
    const type = parts[1] as CustomActionType;
    const payload = parts.slice(2).join(":"); // Rejoin in case payload contains colons
    return { type, payload, originalMessage: llmFriendlyMessage };
  }
  // Default to follow-up action for non-action messages
  return { type: "followup", originalMessage: llmFriendlyMessage };
}

interface ChatProps {
  initialMessages: ChatMessage[];
  chatId: string | null;
  userName?: string | null;
  userImage?: string | null;
  promptLimitInfo: PromptLimitInfo;
}

const getModelNameFromId = (modelId: string | undefined): string => {
  if (!modelId) return "AI Assistant";
  const model = models.find((m) => m.id === modelId);
  return model?.name || "AI Assistant";
};

export default function Chat({
  initialMessages,
  chatId: initialChatId,
  userName,
  userImage,
  promptLimitInfo,
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

  // Track remaining prompts locally (decrements after each successful message)
  const [remainingPrompts, setRemainingPrompts] = useState<
    number | "unlimited"
  >(promptLimitInfo.remaining);
  const hasReachedLimit =
    remainingPrompts !== "unlimited" && remainingPrompts <= 0;

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

  // Send a follow-up message to the AI (used by action handlers)
  const sendFollowUpMessage = useCallback(
    async (message: string) => {
      if (isPending || hasReachedLimit) return;

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: message },
      ];
      setMessages(newMessages);
      setIsPending(true);
      setStreamingContent("");

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/thesys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            chatId: chatId,
            modelId: selectedModel.id,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

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
                  setStreamingContent(accumulatedContent);
                } else if (parsed.type === "tool_results") {
                  functionResults = parsed.results;
                } else if (parsed.type === "done") {
                  duration = parsed.duration;
                  newChatId = parsed.chatId;
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

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

        // Decrement remaining prompts after successful message
        if (remainingPrompts !== "unlimited") {
          setRemainingPrompts((prev) =>
            prev === "unlimited" ? "unlimited" : Math.max(0, prev - 1)
          );
        }

        if (newChatId && !chatId) {
          setChatId(newChatId);
          router.replace(`/webapp/ai/${newChatId}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          errorToast("Failed to send follow-up message");
          setMessages(messages); // Restore original messages
        }
      } finally {
        setIsPending(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      chatId,
      selectedModel,
      isPending,
      router,
      remainingPrompts,
      hasReachedLimit,
    ]
  );

  // Handle custom actions like complete_task, navigate, etc.
  const executeCustomAction = useCallback(
    async (action: ParsedAction): Promise<boolean> => {
      switch (action.type) {
        case "navigate":
          if (action.payload) {
            router.push(action.payload);
            return true;
          }
          return false;

        case "complete_task":
          if (action.payload) {
            try {
              const formData = new FormData();
              formData.append("taskId", action.payload);
              const result = await completeTaskAction(formData);
              if (result.success) {
                successToast("Task completed!");
                return true;
              } else {
                errorToast(result.error || "Failed to complete task");
                return false;
              }
            } catch {
              errorToast("Failed to complete task");
              return false;
            }
          }
          return false;

        case "view_task":
          if (action.payload) {
            router.push(`/webapp/tasks/${action.payload}`);
            return true;
          }
          return false;

        case "refresh_tasks":
          router.refresh();
          return true;

        default:
          return false;
      }
    },
    [router]
  );

  // Handle C1Component actions (user interactions with rich UI)
  const handleC1Action = useCallback(
    async (event: {
      humanFriendlyMessage: string;
      llmFriendlyMessage: string;
    }) => {
      console.log("C1 Action:", event);

      const action = parseC1Action(event.llmFriendlyMessage);

      // Try to execute custom action first
      if (action.type !== "followup") {
        const handled = await executeCustomAction(action);
        if (handled) {
          // Optionally send a follow-up message to confirm the action
          // For navigate actions, we don't need follow-up since we're leaving the page
          if (action.type !== "navigate" && action.type !== "view_task") {
            // Send the human-friendly message as context for the AI
            sendFollowUpMessage(event.humanFriendlyMessage);
          }
          return;
        }
      }

      // Default behavior: send the message back to the AI as a follow-up
      sendFollowUpMessage(event.humanFriendlyMessage);
    },
    [executeCustomAction, sendFollowUpMessage]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || hasReachedLimit) return;

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

      // Decrement remaining prompts after successful message
      if (remainingPrompts !== "unlimited") {
        setRemainingPrompts((prev) =>
          prev === "unlimited" ? "unlimited" : Math.max(0, prev - 1)
        );
      }

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

  const exampleQueries = [
    { text: "Tell me 5 things to stop procrastination", icon: "✨" },
    { text: "I need gym workout plan 4 days a week", icon: "💪" },
    { text: "Explain quantum computing simply", icon: "🧠" },
    { text: "Write a python script to scrape a website", icon: "🐍" },
  ];

  return (
    <ThemeProvider {...taskflowTheme}>
      <div className="flex flex-col h-full w-full relative overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 sm:mb-12 max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">
                What can I help with?
              </h1>
              <p className="text-text-low text-base sm:text-lg">
                Your intelligent AI assistant for tasks, productivity, and
                creative work
              </p>
            </motion.div>

            <div className="w-full max-w-3xl space-y-8 rounded-2xl">
              {/* Upgrade prompt when limit is reached */}
              {hasReachedLimit && (
                <UpgradePlan
                  storageKey="ai-prompts-limit"
                  title="Daily Limit Reached"
                  message={
                    promptLimitInfo.plan === "base"
                      ? "You've used your 1 free AI prompt for today. Upgrade to Pro for 10 prompts/day or Ultra for unlimited prompts."
                      : "You've used all 10 AI prompts for today. Upgrade to Ultra for unlimited prompts."
                  }
                  ctaText="Upgrade Now"
                  icon="zap"
                  showCloseButton={false}
                />
              )}

              <motion.div
                layoutId="input-container"
                className={`relative group rounded-2xl bg-background-600/50 p-1 transition-all duration-300 ${
                  hasReachedLimit ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Animated rotating border gradient */}
                <div className="chat-animated-border"></div>

                {/* Content container */}
                <div className="relative rounded-2xl bg-background-600 border border-primary-500/20 group-hover:border-primary-500/40 transition-all duration-300">
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-2 p-2"
                  >
                    <Textarea
                      name="message"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        hasReachedLimit
                          ? "Daily prompt limit reached"
                          : "Ask anything here..."
                      }
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg p-4 min-h-[120px] resize-none text-text-high placeholder:text-text-gray/50"
                      disabled={isPending || hasReachedLimit}
                      autoFocus
                    />
                    <div className="flex items-center justify-between px-2 pb-2">
                      <div className="flex items-center gap-3">
                        <ModelDropdown
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                        {remainingPrompts !== "unlimited" && (
                          <span className="text-xs hidden md:inline text-text-low">
                            {remainingPrompts} prompt
                            {remainingPrompts !== 1 ? "s" : ""} left today
                          </span>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isPending || !input.trim() || hasReachedLimit}
                        className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
                      >
                        {isPending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {exampleQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(query.text)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-background-600 border border-background-500 hover:border-primary-500/50 hover:bg-primary-500/10 text-text-low hover:text-primary-300 transition-all duration-200 text-sm group"
                  >
                    <span className="text-lg opacity-70 group-hover:scale-110 transition-transform duration-200">
                      {query.icon}
                    </span>
                    <span>{query.text}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto pt-16 md:pt-6 scroll-smooth">
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
                                <FunctionResults
                                  results={msg.functionResults}
                                />
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

            <div className="p-3 md:p-6 border-t border-background-600 backdrop-blur-sm z-10">
              <motion.div
                layoutId="input-container"
                className="max-w-4xl mx-auto space-y-3"
              >
                {/* Upgrade prompt when limit is reached */}
                {hasReachedLimit && (
                  <UpgradePlan
                    storageKey="ai-prompts-limit-chat"
                    message={
                      promptLimitInfo.plan === "base"
                        ? "You've used your free prompt for today. Upgrade to Pro for 10 prompts/day or Ultra for unlimited."
                        : "You've used all 10 prompts for today. Upgrade to Ultra for unlimited prompts."
                    }
                    variant="compact"
                    icon="zap"
                    showCloseButton={false}
                  />
                )}

                <form
                  onSubmit={handleSubmit}
                  className={`flex items-end gap-2 bg-background-600 border border-background-500 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus-within:border-primary-500/50 transition-colors ${
                    hasReachedLimit ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mb-0.5">
                    <ModelDropdown
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                    />
                  </div>
                  <Textarea
                    name="message"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      hasReachedLimit
                        ? "Daily limit reached"
                        : "Ask me anything..."
                    }
                    rows={1}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm sm:text-base max-h-32 overflow-y-auto resize-none py-2"
                    disabled={isPending || hasReachedLimit}
                    autoFocus
                  />
                  <div className="flex items-center gap-2 flex-shrink-0 mb-0.5">
                    {remainingPrompts !== "unlimited" && !hasReachedLimit && (
                      <span className="text-xs text-text-low hidden sm:inline">
                        {remainingPrompts} left
                      </span>
                    )}
                    <button
                      type="submit"
                      className="bg-primary-500 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary-600"
                      disabled={isPending || !input.trim() || hasReachedLimit}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
