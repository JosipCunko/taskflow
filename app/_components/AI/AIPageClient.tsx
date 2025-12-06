import Chat from "./Chat";
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
  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col flex-1 min-w-0">
        <Chat
          initialMessages={initialMessages}
          chatId={chatId}
          userName={userName}
          userImage={userImage}
        />
      </div>

      <ChatSidebar />
    </div>
  );
}
