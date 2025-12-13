import AIPageClient from "@/app/_components/AI/AIPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { ChatMessage } from "@/app/_types/types";
import { getUserById } from "@/app/_lib/user-admin";
import { redirect } from "next/navigation";
import { startOfDay } from "date-fns";
import {
  canMakePrompt,
  getRemainingPrompts,
  getPromptsPerDay,
  getEffectivePlan,
} from "@/app/_lib/stripe";

// Disable caching to ensure fresh data on each request
export const dynamic = "force-dynamic";

export default async function AI() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  // not explicitly reset in the database. Instead "lazy reset" on first prompt of the day
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

  // For new chats, start with empty messages
  const initialMessages: ChatMessage[] = [];
  const chatId: string | null = null;

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
/* <iframe
        id="JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67"
        title="Axon: TaskFlow Guide"
        allow="geolocation; microphone; camera; fullscreen"
        src="https://eu.jotform.com/agent/01982cd8d8e7774fbebc0a2dd460c49e2c67?
        embedMode=iframe&background=0&shadow=1"
        className="w-full h-full border-none"
      ></iframe>
      <Script src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.
      js"></Script>
      <Script id="jotform-embed-handler">
        {`window.jotformEmbedHandler("iframe
        [id='JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67']",
        "https://eu.jotform.com")`}
      </Script> */
