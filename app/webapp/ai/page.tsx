//import Script from "next/script";
import Chat from "@/app/_components/AI/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getLatestChatForUser } from "@/app/_lib/aiAdmin";
import { ChatMessage } from "@/app/_types/types";

export default async function AI() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  let initialMessages: ChatMessage[] = [];
  let chatId: string | null = null;

  if (userId) {
    const latestChat = await getLatestChatForUser(userId);
    initialMessages = latestChat.messages;
    chatId = latestChat.chatId;
  }

  return (
    <>
      {/* <iframe
        id="JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67"
        title="Axon: TaskFlow Guide"
        allow="geolocation; microphone; camera; fullscreen"
        src="https://eu.jotform.com/agent/01982cd8d8e7774fbebc0a2dd460c49e2c67?embedMode=iframe&background=0&shadow=1"
        className="w-full h-full border-none"
      ></iframe>
      <Script src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"></Script>
      <Script id="jotform-embed-handler">
        {`window.jotformEmbedHandler("iframe[id='JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67']",
        "https://eu.jotform.com")`}
      </Script> */}
      <div className="p-1 sm:p-6 container overflow-y-auto overflow-x-hidden mx-auto">
        <Chat
          initialMessages={initialMessages}
          chatId={chatId}
          userName={userName}
          userImage={userImage}
        />
      </div>
    </>
  );
}
