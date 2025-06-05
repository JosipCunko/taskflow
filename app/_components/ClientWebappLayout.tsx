"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth"; // We might need the Session type
import { Task } from "@/app/_types/types";
import Sidebar from "./Sidebar";
import TopSidebar from "./TopSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface ClientWebappLayoutProps {
  session: Session | null; // Allow session to be null initially
  tasks: Task[];
  children: ReactNode;
}

export default function ClientWebappLayout({
  session,
  tasks,
  children,
}: ClientWebappLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (hasMounted && window.innerWidth < 768) {
      // md breakpoint (768px)
      setIsSidebarOpen(false);
    }
  }, [pathname, hasMounted]);

  // Handle body scroll when sidebar is open on mobile
  useEffect(() => {
    if (hasMounted && isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset"; // Cleanup on component unmount
    };
  }, [isSidebarOpen, hasMounted]);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const backdropVariants = {
    open: { opacity: 1, display: "block" },
    closed: { opacity: 0, transitionEnd: { display: "none" } },
  };

  return (
    <div className="flex h-screen overflow-hidden tracking-tight bg-background-625 relative">
      {" "}
      {/* Added relative for absolute positioning context of button if needed */}
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-3 left-3 z-[60] p-2 bg-background-600/80 backdrop-blur-sm rounded-md text-text-high shadow-md hover:bg-background-500 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Sidebar for Mobile (Overlay) and Desktop (Static) */}
      <AnimatePresence>
        {hasMounted && isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            key="backdrop-mobile"
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="fixed inset-y-0 left-0 z-50 md:static md:z-auto h-full w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 bg-background-700 md:shadow-none shadow-xl"
        initial="closed"
        variants={sidebarVariants}
        transition={{ type: "tween", duration: 0.3 }}
        animate={
          hasMounted
            ? window.innerWidth < 768
              ? isSidebarOpen
                ? "open"
                : "closed"
              : "open"
            : "closed"
        }
      >
        {/* Sidebar might need session if it has user-specific actions like logout */}
        <Sidebar tasks={tasks} />
      </motion.div>
      <main className="flex-1 overflow-y-auto flex flex-col">
        <TopSidebar session={session} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
