"use client";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";
import { m as motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const isOnline = useOnlineStatus();

  return (
    <footer className="py-6 bg-background-700 border-t border-primary-500/10">
      <div className="container mx-auto px-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <motion.div
          className="flex items-center justify-center gap-4 text-text-low"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary-500/50"></div>
          <span className="text-sm font-mono">
            SYSTEM.STATUS:{" "}
            {isOnline ? (
              <span className="text-success">OPERATIONAL</span>
            ) : (
              <span className="text-error animate-pulse">CONNECTION_ERROR</span>
            )}
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary-500/50"></div>
          &copy; {new Date().getFullYear()} Prioritron
        </motion.div>

        <nav className="flex items-center justify-center gap-4 text-xs font-mono text-text-gray">
          <Link
            href="/terms"
            className="hover:text-primary-300 transition-colors duration-200"
          >
            Terms of Use
          </Link>
          <span className="text-text-gray/40">|</span>
          <Link
            href="/privacy"
            className="hover:text-primary-300 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </nav>

        <div className="text-xs text-text-gray flex items-center justify-center">
          <span>{isOnline ? "SECURE_CONNECTION" : "OFFLINE"}</span>
          <div
            className={`w-2 h-2 rounded-full ml-2 ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
        </div>
      </div>
    </footer>
  );
}
