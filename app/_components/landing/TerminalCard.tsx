"use client";
import { m as motion } from "framer-motion";
import { ReactNode } from "react";

export default function TerminalCard({
  title,
  children,
  index,
}: {
  title: string;
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.div
      className="h-full bg-background-700 border border-primary-500/30 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(14,165,233,0.15)] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        boxShadow: "0 0 25px rgba(14,165,233,0.3)",
        borderColor: "rgba(14,165,233,0.6)",
        y: -5,
      }}
    >
      {/* Terminal Header */}
      <div className="bg-background-600/80 border-b border-primary-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="text-xs font-mono text-primary-400/80 tracking-wider uppercase">
          {title}.exe
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      {/* Terminal Content */}
      <div className="p-6 flex-grow font-mono relative">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}
