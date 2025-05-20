import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "sidebar" | "danger" | "noStyle" | "tag";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "px-4 py-1 rounded-md transition-colors flex items-center gap-2 cursor-pointer letter-spacing font-semibold ";

  const variantStyles = {
    primary:
      "bg-primary-600 hover:bg-primary-600 text-white border border-primary-500",
    secondary: "bg-primary-500/10 hover:bg-primary-500/20 text-text-high ",
    sidebar: "w-full",
    danger: "text-error hover:bg-error/10 px-4 py-2 rounded-md",
    noStyle: "",
    tag: "flex items-center px-3 py-1.5 rounded-full text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${
        variant === "noStyle" || variant === "tag" ? "" : baseStyles
      } ${variantStyles[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
