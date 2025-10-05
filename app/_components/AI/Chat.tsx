"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDeepseekResponse } from "@/app/_lib/aiActions";
import { Send, Bot, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChatMessage } from "@/app/_types/types";
import ThinkingIndicator from "./ThinkingIndicator";
import Image from "next/image";
import Input from "../reusable/Input";
import EmptyChat from "./EmptyChat";
import FunctionResults from "./FunctionResults";

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
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      const result = await getDeepseekResponse(newMessages, chatId);

      if (result.error) {
        toast.error(result.error);
        const updatedMessages = newMessages.slice(0, -1);
        setMessages(updatedMessages);
      } else if (result.response) {
        setMessages([...newMessages, result.response as ChatMessage]);
        if (result.chatId && !chatId) {
          setChatId(result.chatId);
          router.push(`/webapp/ai/${result.chatId}`);
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <EmptyChat onExampleClick={handleExampleClick} />
      ) : (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
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
                          Deepseek V3.1
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
                      Deepseek V3.1
                    </span>
                  </div>
                  <ThinkingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 border-t border-background-600">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2 bg-background-600 rounded-full px-3 py-1.5 border border-primary-500/30">
                <Bot size={16} className="text-primary-500" />
                <span className="text-sm font-medium">Deepseek V3.1</span>
              </div>
              <div className="flex items-center gap-2 bg-background-600 rounded-full px-3 py-1.5 opacity-40 cursor-not-allowed border border-background-500">
                <Bot size={16} className="text-text-low" />
                <span className="text-sm">GPT-4.1</span>
              </div>
              <div className="flex items-center gap-2 bg-background-600 rounded-full px-3 py-1.5 opacity-40 cursor-not-allowed border border-background-500">
                <Bot size={16} className="text-text-low" />
                <span className="text-sm">Gemini 2.5 Pro</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-background-600 border border-background-500 rounded-xl px-4 py-3 focus-within:border-primary-500/50 transition-colors">
              <Input
                type="text"
                name="message"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
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
