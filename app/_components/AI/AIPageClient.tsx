"use client";

import Chat from "./Chat";
import ChatSidebar from "./ChatSidebar";
import { ChatMessage, SubscriptionPlan } from "@/app/_types/types";
import { useState } from "react";

export interface PromptLimitInfo {
  canPrompt: boolean;
  remaining: number | "unlimited";
  limit: number;
  plan: SubscriptionPlan;
  promptsToday: number;
}

interface AIPageClientProps {
  initialMessages: ChatMessage[];
  chatId: string | null;
  userName?: string | null;
  userImage?: string | null;
  promptLimitInfo: PromptLimitInfo;
}

export default function AIPageClient({
  initialMessages,
  chatId,
  userName,
  userImage,
  promptLimitInfo,
}: AIPageClientProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex h-full w-full">
      <div
        className="flex flex-col flex-1 min-w-0"
        inert={historyOpen || undefined}
      >
        <Chat
          initialMessages={initialMessages}
          chatId={chatId}
          userName={userName}
          userImage={userImage}
          promptLimitInfo={promptLimitInfo}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      </div>

      <ChatSidebar isOpen={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
