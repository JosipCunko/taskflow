"use client";

import Chat from "./Chat";
import ChatSidebar from "./ChatSidebar";
import { ChatMessage, SubscriptionPlan } from "@/app/_types/types";

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
  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col flex-1 min-w-0">
        <Chat
          initialMessages={initialMessages}
          chatId={chatId}
          userName={userName}
          userImage={userImage}
          promptLimitInfo={promptLimitInfo}
        />
      </div>

      <ChatSidebar />
    </div>
  );
}
