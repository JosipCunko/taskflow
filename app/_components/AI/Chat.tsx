"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { getDeepseekResponse } from "@/app/_lib/aiActions";
import { Send, Bot, User, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChatMessage } from "@/app/_types/types";
import ThinkingIndicator from "./ThinkingIndicator";
import Image from "next/image";
import Input from "../reusable/Input";
import Button from "../reusable/Button";
import EmptyChat from "./EmptyChat";
import FunctionResults from "./FunctionResults";
import ModelDropdown from "./ModelDropdown";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setInput("");
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    handleSubmit(
      new Event("submit") as unknown as React.FormEvent<HTMLFormElement>
    );
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
        if (result.chatId) {
          setChatId(result.chatId);
        }
      }
    });
  };

  return (
    <div
      className={`flex flex-col h-full  ${
        messages.length > 0 ? "justify-between" : "justify-end"
      }`}
    >
      {messages.length > 0 && (
        <div className="self-end p-4">
          <Button onClick={handleNewChat} className="disabled:opacity-5">
            <PlusCircle size={20} />
            <span>New Chat</span>
          </Button>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyChat onExampleClick={handleExampleClick} />
      ) : (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.role === "assistant" && (
                <>
                  <div className="flex items-center gap-2 text-primary-500">
                    <div className="w-8 h-8 rounded-full bg-background-500 grid place-items-center">
                      <Bot size={20} />
                    </div>
                    <span className="text-sm font-semibold">Deepseek V3.1</span>
                  </div>

                  <div className="rounded-xl p-4 max-w-xs md:max-w-md lg:max-w-lg bg-background-500 ml-10">
                    <div
                      className="text-sm ai-response"
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                    />
                    {msg.functionResults && (
                      <FunctionResults results={msg.functionResults} />
                    )}
                    {msg.duration && (
                      <p className="text-xs text-primary-300 pt-1">
                        {msg.duration}s
                      </p>
                    )}
                  </div>
                </>
              )}
              {msg.role === "user" && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-low">
                      {userName}
                    </span>
                    {userImage ? (
                      <Image
                        src={userImage}
                        width={30}
                        height={30}
                        alt={userName || "User"}
                        className="rounded-full"
                      />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>

                  <div className="rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg bg-background-500 mr-10">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-primary-500">
                <div className="w-8 h-8 rounded-full bg-background-500 grid place-items-center">
                  <Bot size={20} />
                </div>
                <span className="text-sm font-semibold">Deepseek V3.1</span>
              </div>
              <ThinkingIndicator className="ml-10" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div
        className={`p-4 ${
          messages.length > 0 ? "border-t border-primary-800/50" : ""
        }`}
      >
        <div
          className={`relative mx-auto ${
            messages.length === 0 ? "text-center" : ""
          }`}
        >
          {messages.length === 0 && (
            <>
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-500/20 to-transparent blur-3xl -z-10"
                // radial gradient doesnt work
              />
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-background-500 rounded-full px-3 py-1">
                    <Bot size={16} className="text-primary-500" />
                    <span className="text-sm">Deepseek V3.1</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-background-500 rounded-full px-3 py-1 opacity-50 cursor-not-allowed">
                    <Bot size={16} className="text-primary-500" />
                    <span className="text-sm">GPT-4.1</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-background-500 rounded-full px-3 py-1 opacity-50 cursor-not-allowed">
                    <Bot size={16} className="text-primary-500" />
                    <span className="text-sm">Gemini 2.5 Pro</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <ModelDropdown className="mr-auto" />
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 w-full"
            >
              <Input
                type="text"
                name="message"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="border border-primary-800/50 w-full"
                disabled={isPending}
              />
              <button
                type="submit"
                className="bg-primary-800/50 text-primary-500 rounded-full p-2 disabled:opacity-50 transition-all duration-200 hover:bg-primary-800/60"
                disabled={isPending || !input.trim()}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
