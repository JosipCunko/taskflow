"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AIMode = "standard" | "rich";

interface AIModeSelectorProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes = [
  {
    id: "standard" as const,
    name: "Standard",
    description: "Text-based chat with OpenRouter",
    icon: MessageSquare,
    badge: null,
  },
  {
    id: "rich" as const,
    name: "Rich UI",
    description: "Interactive charts, tables & cards",
    icon: Sparkles,
    badge: "New",
  },
];

export default function AIModeSelector({
  mode,
  onModeChange,
}: AIModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMode = modes.find((m) => m.id === mode) || modes[0];

  if (!mounted) {
    return (
      <div className="relative w-full sm:w-auto">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background-600 border border-background-500 text-sm">
          <currentMode.icon size={16} className="text-primary-400" />
          <span className="font-medium text-text-low">{currentMode.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background-600 border border-background-500 hover:border-primary-500/50 transition-all duration-200 text-sm group"
      >
        <div className="flex items-center gap-2">
          <currentMode.icon
            size={16}
            className="text-primary-400 group-hover:text-primary-300 transition-colors"
          />
          <span className="font-medium text-text-low group-hover:text-text-high transition-colors">
            {currentMode.name}
          </span>
          {currentMode.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md">
              {currentMode.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-text-low transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 sm:right-auto mt-2 z-50 w-full sm:w-72 bg-background-700 border border-background-500 rounded-xl shadow-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {modes.map((modeOption) => {
                  const isSelected = mode === modeOption.id;
                  return (
                    <button
                      key={modeOption.id}
                      onClick={() => {
                        onModeChange(modeOption.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-150 text-left ${
                        isSelected
                          ? "bg-primary-500/15 border border-primary-500/30"
                          : "hover:bg-background-600 border border-transparent"
                      }`}
                    >
                      <div
                        className={`mt-0.5 p-2 rounded-lg ${
                          isSelected
                            ? "bg-primary-500/20 text-primary-400"
                            : "bg-background-500 text-text-low"
                        }`}
                      >
                        <modeOption.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              isSelected ? "text-primary-300" : "text-text-high"
                            }`}
                          >
                            {modeOption.name}
                          </span>
                          {modeOption.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md">
                              {modeOption.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-low mt-0.5">
                          {modeOption.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="mt-0.5 w-2 h-2 rounded-full bg-primary-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-2 bg-background-800/50 border-t border-background-600">
                <p className="text-[11px] text-text-low">
                  Rich UI mode uses Thesys AI for interactive responses
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
