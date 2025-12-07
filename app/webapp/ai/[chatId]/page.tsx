import AIPageClient from "@/app/_components/AI/AIPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getChat } from "@/app/_lib/ai-admin";
import { ChatMessage } from "@/app/_types/types";
import { notFound, redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  // Redirect to login if not authenticated
  if (!userId) {
    redirect("/login");
  }

  let initialMessages: ChatMessage[] = [];

  try {
    const chat = await getChat(userId, chatId);
    if (chat) {
      initialMessages = chat.messages;
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Error loading chat:", error);
    notFound();
  }

  return (
    <AIPageClient
      initialMessages={initialMessages}
      chatId={chatId}
      userName={userName}
      userImage={userImage}
    />
  );
}
