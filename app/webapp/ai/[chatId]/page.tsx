import Chat from "@/app/_components/AI/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getChat } from "@/app/_lib/aiAdmin";
import { ChatMessage } from "@/app/_types/types";
import { notFound } from "next/navigation";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  let initialMessages: ChatMessage[] = [];

  if (userId) {
    const chat = await getChat(userId, chatId);
    if (chat) {
      initialMessages = chat.messages;
    } else {
      notFound();
    }
  } else {
    notFound();
  }

  return (
    <div className="p-1 sm:p-6 container overflow-y-auto overflow-x-hidden mx-auto">
      <Chat
        initialMessages={initialMessages}
        chatId={chatId}
        userName={userName}
        userImage={userImage}
      />
    </div>
  );
}
