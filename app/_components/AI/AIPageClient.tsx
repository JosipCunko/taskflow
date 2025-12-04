"use client";

import { useState } from "react";
import Chat from "./Chat";
import ThesysChat from "./ThesysChat";
import AIModeSelector, { AIMode } from "./AIModeSelector";
import ChatSidebar from "./ChatSidebar";
import { ChatMessage } from "@/app/_types/types";

interface AIPageClientProps {
  initialMessages: ChatMessage[];
  chatId: string | null;
  userName?: string | null;
  userImage?: string | null;
}

export default function AIPageClient({
  initialMessages,
  chatId,
  userName,
  userImage,
}: AIPageClientProps) {
  const [mode, setMode] = useState<AIMode>("rich");

  return (
    <div className="flex h-full w-full">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mode Selector - Fixed at top */}
        <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2">
          <div className="max-w-4xl mx-auto">
            <AIModeSelector mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {/* Chat Content - Fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === "standard" ? (
            <Chat
              initialMessages={initialMessages}
              chatId={chatId}
              userName={userName}
              userImage={userImage}
            />
          ) : (
            <ThesysChat userName={userName} />
          )}
        </div>
      </div>

      {/* Sidebar - Only shown in standard mode */}
      {mode === "standard" && <ChatSidebar />}
    </div>
  );
}
