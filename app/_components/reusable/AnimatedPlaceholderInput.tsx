"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { TASK_PLACEHOLDERS } from "../../_utils/utils";
import Input from "./Input";

interface AnimatedPlaceholderInputProps {
  type: string;
  id?: string;
  name: string;
  value?: string | number | undefined;
  defaultValue?: string | number | undefined;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
  isFocused?: boolean;
}

export default function AnimatedPlaceholderInput({
  type,
  id,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  className,
  required,
  min,
  max,
  disabled,
  isFocused,
}: AnimatedPlaceholderInputProps) {
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isFocused) return; // Don't animate when input is focused

    const interval = setInterval(() => {
      setIsAnimating(true);

      // After animation starts, change the placeholder
      setTimeout(() => {
        setCurrentPlaceholderIndex(
          (prev) => (prev + 1) % TASK_PLACEHOLDERS.length
        );
        setIsAnimating(false);
      }, 150); // Half of the animation duration
    }, 2000);

    return () => clearInterval(interval);
  }, [isFocused]);

  return (
    <div className="relative w-full">
      <Input
        min={min}
        max={max}
        type={type}
        id={id ? id : name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        className={className}
        disabled={disabled}
        required={required}
      />

      {/* Animated placeholder overlay */}
      {!value && !defaultValue && !isFocused && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none overflow-hidden h-6">
          <div
            className={`text-text-gray transition-transform duration-500 linear ${
              isAnimating
                ? "transform translate-y-full opacity-0"
                : "transform translate-y-0 opacity-100"
            }`}
          >
            {TASK_PLACEHOLDERS[currentPlaceholderIndex]}
          </div>
        </div>
      )}
    </div>
  );
}
