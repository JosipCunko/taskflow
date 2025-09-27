"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChats, deleteChat } from "@/app/_lib/aiActions";
import { Trash2, MessageSquarePlus } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../reusable/Button";

interface ChatInfo {
  id: string;
  title: string;
}

export default function ChatHistory() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      const result = await getChats();
      if (result.error) {
        toast.error(result.error);
      } else if (result.chats) {
        setChats(result.chats);
      }
      setLoading(false);
    }
    fetchChats();
  }, []);

  const handleDelete = async (chatId: string) => {
    const originalChats = chats;
    setChats(chats.filter((chat) => chat.id !== chatId));
    toast.success("Chat deleted");

    const result = await deleteChat(chatId);
    if (result.error) {
      toast.error(result.error);
      setChats(originalChats);
    } else {
      router.refresh();
    }
  };

  const handleNewChat = () => {
    router.push("/webapp/ai");
  };

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="p-4 bg-background-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-primary-300">
        Chat History
      </h2>
      <Button
        onClick={handleNewChat}
        className="w-full mb-4 flex items-center justify-center gap-2"
      >
        <MessageSquarePlus size={20} />
        New Chat
      </Button>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-background-700 group"
          >
            <Link href={`/webapp/ai/${chat.id}`} className="flex-grow">
              <p className="text-sm truncate text-primary-400">{chat.title}</p>
            </Link>
            <button
              onClick={() => handleDelete(chat.id)}
              className="ml-2 p-1 text-primary-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
