"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/app/_components/reusable/Button";
import { useOutsideClick } from "@/app/_hooks/useOutsideClick";

interface MathSymbolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSymbolSelect: (symbol: string) => void;
}

interface SymbolCategory {
  name: string;
  symbols: { display: string; value: string; label: string }[];
}

const MATH_SYMBOLS: SymbolCategory[] = [
  {
    name: "Basic Operations",
    symbols: [
      { display: "+", value: " + ", label: "Plus" },
      { display: "−", value: " − ", label: "Minus" },
      { display: "×", value: " × ", label: "Multiply" },
      { display: "÷", value: " ÷ ", label: "Divide" },
      { display: "±", value: " ± ", label: "Plus-minus" },
      { display: "∓", value: " ∓ ", label: "Minus-plus" },
      { display: "=", value: " = ", label: "Equals" },
      { display: "≠", value: " ≠ ", label: "Not equal" },
      { display: "≈", value: " ≈ ", label: "Approximately" },
      { display: "∝", value: " ∝ ", label: "Proportional" },
    ],
  },
  {
    name: "Powers & Roots",
    symbols: [
      { display: "x²", value: "²", label: "Squared" },
      { display: "x³", value: "³", label: "Cubed" },
      { display: "xⁿ", value: "ⁿ", label: "Power n" },
      { display: "√x", value: "√", label: "Square root" },
      { display: "∛x", value: "∛", label: "Cube root" },
      { display: "x⁰", value: "⁰", label: "Power 0" },
      { display: "x¹", value: "¹", label: "Power 1" },
      { display: "x⁴", value: "⁴", label: "Power 4" },
    ],
  },
  {
    name: "Comparisons",
    symbols: [
      { display: "<", value: " < ", label: "Less than" },
      { display: ">", value: " > ", label: "Greater than" },
      { display: "≤", value: " ≤ ", label: "Less or equal" },
      { display: "≥", value: " ≥ ", label: "Greater or equal" },
      { display: "≪", value: " ≪ ", label: "Much less" },
      { display: "≫", value: " ≫ ", label: "Much greater" },
    ],
  },
  {
    name: "Greek Letters",
    symbols: [
      { display: "α", value: "α", label: "Alpha" },
      { display: "β", value: "β", label: "Beta" },
      { display: "γ", value: "γ", label: "Gamma" },
      { display: "δ", value: "δ", label: "Delta" },
      { display: "ε", value: "ε", label: "Epsilon" },
      { display: "θ", value: "θ", label: "Theta" },
      { display: "λ", value: "λ", label: "Lambda" },
      { display: "μ", value: "μ", label: "Mu" },
      { display: "π", value: "π", label: "Pi" },
      { display: "σ", value: "σ", label: "Sigma" },
      { display: "φ", value: "φ", label: "Phi" },
      { display: "ω", value: "ω", label: "Omega" },
      { display: "Δ", value: "Δ", label: "Delta (cap)" },
      { display: "Σ", value: "Σ", label: "Sigma (cap)" },
      { display: "Π", value: "Π", label: "Pi (cap)" },
      { display: "Ω", value: "Ω", label: "Omega (cap)" },
    ],
  },
  {
    name: "Set Theory",
    symbols: [
      { display: "∈", value: " ∈ ", label: "Element of" },
      { display: "∉", value: " ∉ ", label: "Not element" },
      { display: "∪", value: " ∪ ", label: "Union" },
      { display: "∩", value: " ∩ ", label: "Intersection" },
      { display: "⊂", value: " ⊂ ", label: "Subset" },
      { display: "⊃", value: " ⊃ ", label: "Superset" },
      { display: "⊆", value: " ⊆ ", label: "Subset or equal" },
      { display: "⊇", value: " ⊇ ", label: "Superset or equal" },
      { display: "∅", value: "∅", label: "Empty set" },
      { display: "∀", value: " ∀ ", label: "For all" },
      { display: "∃", value: " ∃ ", label: "There exists" },
      { display: "∄", value: " ∄ ", label: "Not exists" },
    ],
  },
  {
    name: "Calculus",
    symbols: [
      { display: "∫", value: "∫", label: "Integral" },
      { display: "∬", value: "∬", label: "Double integral" },
      { display: "∭", value: "∭", label: "Triple integral" },
      { display: "∮", value: "∮", label: "Contour integral" },
      { display: "∂", value: "∂", label: "Partial derivative" },
      { display: "∇", value: "∇", label: "Nabla/gradient" },
      { display: "∆", value: "∆", label: "Laplacian" },
      { display: "d/dx", value: "d/dx", label: "Derivative" },
      { display: "lim", value: "lim", label: "Limit" },
      { display: "∞", value: "∞", label: "Infinity" },
    ],
  },
  {
    name: "Logic",
    symbols: [
      { display: "∧", value: " ∧ ", label: "And" },
      { display: "∨", value: " ∨ ", label: "Or" },
      { display: "¬", value: "¬", label: "Not" },
      { display: "⇒", value: " ⇒ ", label: "Implies" },
      { display: "⇔", value: " ⇔ ", label: "If and only if" },
      { display: "∴", value: " ∴ ", label: "Therefore" },
      { display: "∵", value: " ∵ ", label: "Because" },
    ],
  },
  {
    name: "Arrows & Misc",
    symbols: [
      { display: "→", value: " → ", label: "Right arrow" },
      { display: "←", value: " ← ", label: "Left arrow" },
      { display: "↔", value: " ↔ ", label: "Left-right arrow" },
      { display: "⇒", value: " ⇒ ", label: "Double right" },
      { display: "⇐", value: " ⇐ ", label: "Double left" },
      { display: "↑", value: " ↑ ", label: "Up arrow" },
      { display: "↓", value: " ↓ ", label: "Down arrow" },
      { display: "°", value: "°", label: "Degree" },
      { display: "′", value: "′", label: "Prime" },
      { display: "″", value: "″", label: "Double prime" },
      { display: "‰", value: "‰", label: "Per mille" },
      { display: "%", value: "%", label: "Percent" },
    ],
  },
  {
    name: "Fractions & Numbers",
    symbols: [
      { display: "½", value: "½", label: "One half" },
      { display: "⅓", value: "⅓", label: "One third" },
      { display: "⅔", value: "⅔", label: "Two thirds" },
      { display: "¼", value: "¼", label: "One quarter" },
      { display: "¾", value: "¾", label: "Three quarters" },
      { display: "⅕", value: "⅕", label: "One fifth" },
      { display: "⅛", value: "⅛", label: "One eighth" },
      { display: "℮", value: "℮", label: "Estimated" },
    ],
  },
];

export default function MathSymbolsModal({
  isOpen,
  onClose,
  onSymbolSelect,
}: MathSymbolsModalProps) {
  const dropdownRef = useOutsideClick(onClose);
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  // Handle Escape key to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -20,
            rotateX: -15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: -10,
            rotateX: -10,
          }}
          transition={{
            type: "spring",
            duration: 0.4,
            bounce: 0.3,
          }}
          className="absolute top-0 left-0 right-0 mt-2 bg-background-700 rounded-lg shadow-2xl border border-divider overflow-hidden flex flex-col z-50"
          style={{
            maxHeight: "20rem",
            maxWidth: "20rem",
            transformStyle: "preserve-3d",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(var(--primary-500), 0.1)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="math-dropdown-title"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-between p-2 border-b border-divider bg-background-650"
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <h2
                id="math-dropdown-title"
                className="text-sm font-bold text-primary-400"
              >
                Mathematical Symbols
              </h2>
              <p className="text-xs text-text-gray mt-0.5">
                Click any symbol to insert
              </p>
            </motion.div>
            <motion.button
              onClick={onClose}
              className="p-1 hover:bg-background-600 rounded-lg transition-colors"
              aria-label="Close dropdown"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <X size={20} className="text-text-gray" />
            </motion.button>
          </motion.div>

          {/* Content */}
          <motion.div
            className="flex-1 overflow-y-auto overflow-x-visible p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="space-y-4 pt-8 pb-4">
              {MATH_SYMBOLS.map((category, categoryIndex) => (
                <motion.div
                  key={category.name}
                  className="space-y-2 overflow-visible"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + categoryIndex * 0.1,
                    duration: 0.4,
                    type: "spring",
                    bounce: 0.3,
                  }}
                >
                  <motion.h3
                    className="text-sm font-semibold text-text-low border-b border-divider pb-1.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + categoryIndex * 0.1,
                      duration: 0.3,
                    }}
                  >
                    {category.name}
                  </motion.h3>
                  <motion.div
                    className="grid grid-cols-12 gap-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          delayChildren: 0.5 + categoryIndex * 0.1,
                          staggerChildren: 0.02,
                        },
                      },
                    }}
                  >
                    {category.symbols.map((symbol, symbolIndex) => (
                      <motion.button
                        key={symbol.value}
                        onClick={() => {
                          onSymbolSelect(symbol.value);
                          onClose();
                        }}
                        onMouseEnter={() => setHoveredSymbol(symbol.value)}
                        onMouseLeave={() => setHoveredSymbol(null)}
                        className="group relative bg-background-600 rounded-md p-2 flex items-center justify-center aspect-square overflow-visible"
                        variants={{
                          hidden: {
                            opacity: 0,
                            scale: 0,
                            rotateY: -90,
                          },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            rotateY: 0,
                          },
                        }}
                        whileHover={{
                          scale: 1.15,
                          backgroundColor: "rgb(var(--primary-500))",
                          rotateZ: 5,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{
                          scale: 0.95,
                          rotateZ: -5,
                          transition: { duration: 0.1 },
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.4,
                          duration: 0.6,
                        }}
                      >
                        <motion.span
                          className="text-base font-semibold text-text-low group-hover:text-white relative z-10"
                          initial={{ rotateY: -90 }}
                          animate={{ rotateY: 0 }}
                          transition={{
                            delay:
                              0.5 +
                              categoryIndex * 0.1 +
                              symbolIndex * 0.02 +
                              0.1,
                            duration: 0.3,
                          }}
                        >
                          {symbol.display}
                        </motion.span>
                        <AnimatePresence>
                          {hoveredSymbol === symbol.value && (
                            <motion.div
                              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 px-2 py-1 bg-background-800 text-text-low text-xs rounded whitespace-nowrap pointer-events-none z-30 border border-divider"
                              initial={{ opacity: 0, scale: 0.8, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -10 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                              }}
                            >
                              {symbol.label}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="p-2 border-t border-divider bg-background-650"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onClose}
                variant="primary"
                className="text-xs w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
