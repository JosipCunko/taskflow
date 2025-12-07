"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getChats, deleteChat, renameChatAction } from "@/app/_lib/aiActions";
import {
  Trash2,
  MessageSquarePlus,
  MessageSquare,
  Edit,
  ListIcon,
  X,
} from "lucide-react";
import { successToast, errorToast } from "@/app/_utils/utils";
import Button from "../reusable/Button";
import Input from "../reusable/Input";
import { motion, AnimatePresence } from "framer-motion";

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
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (hasMounted && window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname, hasMounted]);

  // Handle body scroll when sidebar is open on mobile
  useEffect(() => {
    if (hasMounted && isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hasMounted]);

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      const result = await getChats();
      if (result.error) {
        errorToast(result.error);
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
    successToast("Chat deleted");

    const result = await deleteChat(chatId);
    if (result.error) {
      errorToast(result.error);
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
    successToast("Chat renamed");

    const result = await renameChatAction(editingChatId, newChatTitle);
    if (result.error) {
      errorToast(result.error);
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

  // Animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "100%" },
  };

  const backdropVariants = {
    open: { opacity: 1, display: "block" },
    closed: { opacity: 0, transitionEnd: { display: "none" } },
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background-700 border-l border-background-600">
      <div className="p-4 border-b border-background-600">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h2 className="text-lg font-semibold text-text-low">Chat History</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-background-600 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-text-gray" />
          </button>
        </div>
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
          <div className="space-y-2 px-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-3 gap-3 rounded-lg bg-background-600/30 animate-pulse"
              >
                <div className="h-4 w-4 bg-background-600 rounded-sm shrink-0" />
                <div
                  className="h-4 bg-background-600 rounded-md"
                  style={{ width: `${[60, 40, 70, 50, 65][i]}%` }}
                />
              </div>
            ))}
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
                        : "hover:bg-background-600/50 text-text-low"
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
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:hidden fixed top-20 right-0 z-30 p-2 bg-background-500 backdrop-blur-sm rounded-md text-text-low shadow-md hover:bg-background-500 transition-colors cursor-pointer"
      >
        <ListIcon size={24} /> Chat History
      </button>

      {/* Mobile Overlay with Animation */}
      <AnimatePresence>
        {hasMounted && isOpen && window.innerWidth < 768 && (
          <motion.div
            key="backdrop-mobile"
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop (Right side) */}
      <aside className="hidden md:flex md:w-72 h-full">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile (Right side with animations) */}
      <motion.aside
        className="md:hidden fixed top-0 right-0 bottom-0 w-72 z-50 bg-background-700 shadow-xl"
        initial="closed"
        variants={sidebarVariants}
        transition={{ type: "tween", duration: 0.3 }}
        animate={
          hasMounted
            ? window.innerWidth < 768
              ? isOpen
                ? "open"
                : "closed"
              : "closed"
            : "closed"
        }
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
