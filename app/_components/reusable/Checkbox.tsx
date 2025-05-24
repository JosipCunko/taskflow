// components/reusable/Checkbox.tsx
"use client";

import React, { ChangeEvent, ReactNode } from "react";
import { Check } from "lucide-react"; // For the checkmark icon

interface CheckboxProps {
  id: string; // Required for label association
  name: string;
  label?: ReactNode; // Can be a string or JSX for more complex labels
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string; // For the wrapper div
  labelClassName?: string;
  checkboxClassName?: string; // For custom styling of the visual checkbox
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  className = "",
  labelClassName = "text-text-gray text-sm select-none",
  checkboxClassName = "",
  disabled = false,
}) => {
  return (
    <div
      className={`flex items-center gap-2 cursor-pointer group ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Hidden native checkbox input to handle state and accessibility */}
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={disabled ? undefined : onChange}
        className="sr-only peer" // Screen-reader only, hidden visually, but focusable
        disabled={disabled}
      />

      {/* Custom styled visual checkbox */}
      <label
        htmlFor={id} // Associates with the hidden input
        className={`relative flex items-center justify-center w-5 h-5 rounded border-2
                    bg-background-600 
                    border-background-500 
                    peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background-700 peer-focus-visible:ring-primary-500
                    peer-checked:bg-primary-500 peer-checked:border-primary-600
                    group-hover:border-primary-400
                    transition-all duration-150
                    ${checkboxClassName}
                    ${
                      disabled
                        ? "!bg-background-500 !border-background-500"
                        : ""
                    }`}
      >
        {/* Checkmark icon - appears when checked */}
        {checked && (
          <Check
            size={14}
            strokeWidth={3}
            className={`text-text-gray transition-opacity duration-100 ${
              checked ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </label>

      {/* Optional label text */}
      {label && (
        <label
          htmlFor={id} // Clicking label also toggles checkbox
          className={`${labelClassName} ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
