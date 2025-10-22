"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChatMessage, FunctionResult } from "@/app/_types/types";
import ThinkingIndicator from "./ThinkingIndicator";
import Image from "next/image";
import Input from "../reusable/Input";
import EmptyChat from "./EmptyChat";
import FunctionResults from "./FunctionResults";
import ModelDropdown, { models, AIModel } from "./ModelDropdown";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface ChatProps {
  initialMessages: ChatMessage[];
  chatId: string | null;
  userName?: string | null;
  userImage?: string | null;
}

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
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(fakeEvent);
  };

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
      const response = await fetch("/api/ai/stream", {
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
                // Convert markdown to HTML as we stream
                const formattedContent = DOMPurify.sanitize(
                  marked(accumulatedContent) as string
                );
                setStreamingContent(formattedContent);
              } else if (parsed.type === "tool_start") {
                // Tool execution started
                setStreamingContent(
                  accumulatedContent + "\n\n*Executing tools...*"
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
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }

      // Final formatted content
      const finalFormattedContent = DOMPurify.sanitize(
        marked(accumulatedContent) as string
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: finalFormattedContent,
        duration,
        functionResults,
      };

      setMessages([...newMessages, assistantMessage]);
      setStreamingContent("");

      if (newChatId && !chatId) {
        setChatId(newChatId);
        // Use router.replace to update URL without page refresh
        router.replace(`/webapp/ai/${newChatId}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Stream error:", error);
        toast.error("Failed to get AI response");
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
                          {selectedModel.name}
                        </span>
                      </div>
                      <div className="rounded-lg p-4 bg-background-600 border border-background-500">
                        <div
                          className="text-sm leading-relaxed ai-response prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: msg.content }}
                        />
                        {msg.functionResults && (
                          <div className="mt-3">
                            <FunctionResults results={msg.functionResults} />
                          </div>
                        )}
                        {msg.duration && (
                          <p className="text-xs text-text-low mt-2">
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
                        <p className="text-sm leading-relaxed">{msg.content}</p>
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
                      <div
                        className="text-sm leading-relaxed ai-response prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: streamingContent }}
                      />
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
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
          >
            <div className="flex-shrink-0 order-2 sm:order-1">
              <ModelDropdown
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-background-600 border border-background-500 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus-within:border-primary-500/50 transition-colors order-1 sm:order-2">
              <Input
                type="text"
                name="message"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm sm:text-base"
                disabled={isPending}
              />
              <button
                type="submit"
                className="bg-primary-500 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary-600 flex-shrink-0"
                disabled={isPending || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
