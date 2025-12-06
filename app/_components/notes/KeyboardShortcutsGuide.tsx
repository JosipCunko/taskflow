"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import Button from "@/app/_components/reusable/Button";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "@/app/_hooks/useOutsideClick";

export default function KeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useOutsideClick(() => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const shortcuts = [
    {
      category: "Saving & Navigation",
      items: [
        { keys: ["Ctrl", "S"], description: "Save current note" },
        { keys: ["Esc"], description: "Save and stop editing" },
      ],
    },
    {
      category: "Line Operations",
      items: [
        { keys: ["Ctrl", "D"], description: "Duplicate current line" },
        { keys: ["Ctrl", "K"], description: "Delete current line" },
        {
          keys: ["Ctrl", "X"],
          description: "Cut line (when nothing selected)",
        },
        { keys: ["Alt", "↑"], description: "Move line up" },
        { keys: ["Alt", "↓"], description: "Move line down" },
      ],
    },
    {
      category: "Editing",
      items: [
        { keys: ["Ctrl", "/"], description: "Toggle line comment" },
        { keys: ["Tab"], description: "Indent" },
        { keys: ["Shift", "Tab"], description: "Outdent" },
      ],
    },
  ];

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        data-tooltip-id="keyboard-shortcuts-btn"
        data-tooltip-content="View keyboard shortcuts"
      >
        <Keyboard size={18} />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>
      <Tooltip id="keyboard-shortcuts-btn" place="top" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
              }}
              className="bg-background-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-divider bg-background-650">
                <div>
                  <h2
                    id="shortcuts-modal-title"
                    className="text-2xl font-bold text-primary-400 flex items-center gap-2"
                  >
                    <Keyboard size={24} />
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-text-gray mt-1">
                    Boost your productivity with these shortcut{" "}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-background-600 rounded-lg transition-colors"
                  aria-label="Close shortcuts guide"
                >
                  <X size={24} className="text-text-gray" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {shortcuts.map((section) => (
                    <div key={section.category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-text-low border-b border-divider pb-2">
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-background-600 rounded-lg hover:bg-background-550 transition-colors"
                          >
                            <span className="text-text-low">
                              {item.description}
                            </span>
                            <div className="flex gap-1">
                              {item.keys.map((key, keyIdx) => (
                                <span
                                  key={keyIdx}
                                  className="flex items-center"
                                >
                                  <kbd className="px-3 py-1.5 bg-background-700 border border-divider rounded text-sm font-mono text-primary-400">
                                    {key}
                                  </kbd>
                                  {keyIdx < item.keys.length - 1 && (
                                    <span className="mx-1 text-text-gray">
                                      +
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-divider bg-background-650">
                <Button onClick={() => setIsOpen(false)} variant="primary">
                  Got it!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
