"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, Timer } from "lucide-react";
import Button from "../reusable/Button";

const models = [
  { name: "Deepseek V3.1", enabled: true },
  { name: "GPT-4.1", enabled: false, soon: true },
  { name: "Gemini 2.5 Pro", enabled: false, soon: true },
];

export default function ModelDropdown({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className={className}
      >
        <Bot size={16} className="text-primary-500" />
        <span className="text-sm text-nowrap">{selectedModel.name}</span>
        <ChevronDown
          size={16}
          className={`text-text-low transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              transition: { duration: 0.15 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-2 w-60 bg-background-600 border border-divider shadow-xl rounded-lg p-1.5 z-[100] origin-bottom-left focus:outline-none"
          >
            {models.map((model) => (
              <li key={model.name}>
                <Button
                  variant="secondary"
                  className={`w-full text-left py-2.5 text-sm ${
                    !model.enabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-background-hover"
                  }`}
                  onClick={() => {
                    if (model.enabled) {
                      setSelectedModel(model);
                      setIsOpen(false);
                    }
                  }}
                  disabled={!model.enabled}
                >
                  <Bot size={20} className="text-primary-500" />
                  <span>{model.name}</span>
                  {model.soon && (
                    <Timer size={16} className="ml-auto text-warning" />
                  )}
                </Button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
