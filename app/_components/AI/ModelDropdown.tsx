"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, Timer } from "lucide-react";
import Button from "../reusable/Button";

export interface AIModel {
  name: string;
  id: string;
  enabled: boolean;
  soon?: boolean;
}

export const models: AIModel[] = [
  { name: "GPT-4.1", id: "c1-exp/openai/gpt-4.1/v-20250709", enabled: true },
  {
    name: "GPT-5",
    id: "c1/openai/gpt-5/v-20251130",
    enabled: true,
  },
  {
    name: "Claude Sonnet 4",
    id: "c1/anthropic/claude-sonnet-4/v-20251130",
    enabled: true,
  },
  {
    name: "Claude 3.5 Haiku",
    id: "c1-exp/anthropic/claude-3.5-haiku/v-20250709",
    enabled: true,
  },
];

interface ModelDropdownProps {
  className?: string;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export default function ModelDropdown({
  className,
  selectedModel,
  onModelChange,
}: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
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
                      onModelChange(model);
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
