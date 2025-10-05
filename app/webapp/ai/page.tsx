import Chat from "@/app/_components/AI/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { ChatMessage } from "@/app/_types/types";

export default async function AI() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  // For new chats, start with empty messages
  const initialMessages: ChatMessage[] = [];
  const chatId: string | null = null;

  return (
    <div className="h-full w-full overflow-hidden">
      {/* <iframe
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
      </Script> */}
      <Chat
        initialMessages={initialMessages}
        chatId={chatId}
        userName={userName}
        userImage={userImage}
      />
    </div>
  );
}
