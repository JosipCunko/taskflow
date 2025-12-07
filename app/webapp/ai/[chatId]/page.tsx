import AIPageClient from "@/app/_components/AI/AIPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getChat } from "@/app/_lib/ai-admin";
import { ChatMessage } from "@/app/_types/types";
import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/app/_lib/user-admin";
import { startOfDay } from "date-fns";
import {
  canMakePrompt,
  getRemainingPrompts,
  getPromptsPerDay,
  getEffectivePlan,
} from "@/app/_lib/stripe";

// Disable caching to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const user = await getUserById(userId);
  if (!user) {
    redirect("/login");
  }

  const today = startOfDay(new Date()).getTime();
  let promptsToday = user.aiPromptsToday || 0;
  if (!user.lastPromptDate || user.lastPromptDate < today) {
    promptsToday = 0; // New day, reset count
  }

  // Get effective plan considering expiration
  const plan = getEffectivePlan(user.currentPlan || "base", user.planExpiresAt);
  const canPrompt = canMakePrompt(plan, promptsToday);
  const remaining = getRemainingPrompts(plan, promptsToday);
  const limit = getPromptsPerDay(plan);

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
      promptLimitInfo={{
        canPrompt,
        remaining,
        limit,
        plan,
        promptsToday,
      }}
    />
  );
}
