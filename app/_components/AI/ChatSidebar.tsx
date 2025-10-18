"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getChats, deleteChat, renameChatAction } from "@/app/_lib/aiActions";
import {
  Trash2,
  MessageSquarePlus,
  Menu,
  X,
  MessageSquare,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../reusable/Button";
import Input from "../reusable/Input";

interface ChatInfo {
  id: string;
  title: string;
}

export default function ChatSidebar() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const router = useRouter();
  const pathname = usePathname();

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
  }, [pathname]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const originalChats = chats;
    setChats(chats.filter((chat) => chat.id !== chatId));
    toast.success("Chat deleted");

    const result = await deleteChat(chatId);
    if (result.error) {
      toast.error(result.error);
      setChats(originalChats);
    } else {
      if (pathname.includes(chatId)) {
        router.push("/webapp/ai");
      } else {
        router.refresh();
      }
    }
  };

  const startEditing = (chat: ChatInfo) => {
    setEditingChatId(chat.id);
    setNewChatTitle(chat.title);
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setNewChatTitle("");
  };

  const handleRename = async () => {
    if (!editingChatId || !newChatTitle.trim()) return;

    const originalChats = chats;
    const optimisticChats = chats.map((c) =>
      c.id === editingChatId ? { ...c, title: newChatTitle } : c
    );
    setChats(optimisticChats);
    cancelEditing();
    toast.success("Chat renamed");

    const result = await renameChatAction(editingChatId, newChatTitle);
    if (result.error) {
      toast.error(result.error);
      setChats(originalChats);
    }
  };

  const handleNewChat = () => {
    router.push("/webapp/ai");
    setIsOpen(false);
  };

  const isActiveChatRoute = (chatId: string) => {
    return pathname === `/webapp/ai/${chatId}`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background-700 border-r border-background-600">
      <div className="p-4 border-b border-background-600">
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30"
        >
          <MessageSquarePlus size={18} />
          <span className="font-semibold">New Chat</span>
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-4 text-center text-text-low">
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-background-600 rounded"></div>
              <div className="h-10 bg-background-600 rounded"></div>
              <div className="h-10 bg-background-600 rounded"></div>
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare
              size={32}
              className="mx-auto mb-2 text-text-low opacity-50"
            />
            <p className="text-sm text-text-low">No chats yet</p>
            <p className="text-xs text-text-low mt-1">
              Start a new conversation
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id}>
              {editingChatId === chat.id ? (
                <div className="p-2">
                  <Input
                    name="chatTitle"
                    type="text"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") cancelEditing();
                    }}
                    autoFocus
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditing}
                      variant="secondary"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleRename} className="w-full">
                      Rename
                    </Button>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/webapp/ai/${chat.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    transition-all duration-200 group relative
                    ${
                      isActiveChatRoute(chat.id)
                        ? "bg-background-600 text-primary-300"
                        : "hover:bg-background-600/50 text-text-high"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare size={16} className="flex-shrink-0" />
                    <span className="text-sm truncate">{chat.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditing(chat);
                      }}
                      className={`
                        p-1.5 rounded hover:bg-primary-500/20 transition-all
                        ${
                          isActiveChatRoute(chat.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }
                      `}
                      aria-label="Rename chat"
                    >
                      <Edit
                        size={14}
                        className="text-primary-400 hover:text-primary-300"
                      />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className={`
                      p-1.5 rounded hover:bg-red-500/20 transition-all
                      ${
                        isActiveChatRoute(chat.id)
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }
                    `}
                      aria-label="Delete chat"
                    >
                      <Trash2
                        size={14}
                        className="text-red-400 hover:text-red-300"
                      />
                    </button>
                  </div>
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-background-600">
        <p className="text-xs text-text-low text-center">
          Powered by openrouter
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button - Lower z-index to not interfere with main sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-16 left-3 z-30 p-2 bg-background-600/80 backdrop-blur-sm rounded-md text-text-high shadow-md hover:bg-background-500 transition-colors cursor-pointer"
        aria-label="Toggle chat history"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-72 h-full">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 bottom-0 w-72 z-25
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
