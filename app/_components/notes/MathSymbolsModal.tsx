"use client";

import { X } from "lucide-react";
import Button from "@/app/_components/reusable/Button";

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
      { display: "∜x", value: "∜", label: "Fourth root" },
      { display: "x⁰", value: "⁰", label: "Power 0" },
      { display: "x¹", value: "¹", label: "Power 1" },
      { display: "x⁴", value: "⁴", label: "Power 4" },
      { display: "x⁵", value: "⁵", label: "Power 5" },
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-background-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-divider bg-background-650">
          <div>
            <h2 className="text-2xl font-bold text-primary-400">
              Mathematical Symbols
            </h2>
            <p className="text-sm text-text-gray mt-1">
              Click any symbol to insert it into your note
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-600 rounded-lg transition-colors"
          >
            <X size={24} className="text-text-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {MATH_SYMBOLS.map((category) => (
              <div key={category.name} className="space-y-3">
                <h3 className="text-lg font-semibold text-text-low border-b border-divider pb-2">
                  {category.name}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {category.symbols.map((symbol) => (
                    <button
                      key={symbol.value}
                      onClick={() => onSymbolSelect(symbol.value)}
                      className="group relative bg-background-600 hover:bg-primary-500 hover:scale-110 transition-all duration-200 rounded-lg p-3 flex items-center justify-center aspect-square"
                      title={symbol.label}
                    >
                      <span className="text-2xl font-semibold text-text-low group-hover:text-white">
                        {symbol.display}
                      </span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 px-2 py-1 bg-background-800 text-text-low text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {symbol.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-divider bg-background-650">
          <div className="flex justify-between items-center">
            <p className="text-sm text-text-gray italic">
              💡 Tip: Use keyboard shortcuts in your note for faster editing!
            </p>
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
