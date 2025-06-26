"use client";

import React, { ReactNode } from "react";
import * as Switch from "@radix-ui/react-switch";

interface SwitchProps {
  id: string;
  name: string;
  label?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
  disabled?: boolean;
}

const SwitchComponent: React.FC<SwitchProps> = ({
  id,
  name,
  label,
  checked,
  onCheckedChange,
  className = "",
  labelClassName = "text-text-gray text-sm select-none",
  switchClassName = "",
  disabled = false,
}) => {
  return (
    <div
      className={`flex items-center gap-2 cursor-pointer group ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <Switch.Root
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={disabled ? undefined : onCheckedChange}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full
                    bg-background-600 
                    border-2 border-background-500
                    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background-700 focus-visible:ring-primary-500
                    data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600
                    group-hover:border-primary-400
                    transition-all duration-150
                    ${switchClassName}
                    ${
                      disabled
                        ? "!bg-background-500 !border-background-500"
                        : ""
                    }`}
      >
        <Switch.Thumb
          className={`block w-4 h-4 rounded-full 
                      bg-white
                      transition-transform duration-150
                      translate-x-0.5
                      data-[state=checked]:translate-x-5
                      ${disabled ? "!bg-gray-400" : ""}`}
        />
      </Switch.Root>

      {label && (
        <label
          htmlFor={id}
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

export default SwitchComponent;
