"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface NumberControlProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}

export default function NumberControl({
  label,
  value,
  setValue,
  min = 1,
  max = 30,
  suffix = "",
}: NumberControlProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-low">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="p-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 transition-colors"
          disabled={value <= min}
        >
          <Minus size={16} className="text-primary-500" />
        </button>

        <motion.div
          className="flex flex-col items-center gap-1"
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <span className="text-2xl font-bold text-text-high">{value}</span>
          {suffix && <span className="text-xs text-text-gray">{suffix}</span>}
        </motion.div>

        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          className="p-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 transition-colors"
          disabled={value >= max}
        >
          <Plus size={16} className="text-primary-500" />
        </button>
      </div>

      {/* Range slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="w-full h-2 bg-background-500 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, var(--color-primary-500) 0%, var(--color-primary-500) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-background-500) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-background-500) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-text-gray mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
