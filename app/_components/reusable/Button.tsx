import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "sidebar" | "danger" | "noStyle" | "tag";
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | undefined) => void;
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
  ...rest
}: ButtonProps) {
  const baseStyles =
    "relative isolate px-4 py-1 rounded-md transition-all duration-200 flex items-center gap-2 text-sm sm:text-base cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 border border-primary-500/50",
    secondary:
      "bg-background-500/50 text-text-low border border-primary-500/10 hover:bg-background-500/60 hover:border-primary-500/20 ",
    sidebar: "w-full",
    danger: "text-error hover:bg-error/10",
    noStyle: "",
    tag: "flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${
        variant === "noStyle" || variant === "tag" ? "" : baseStyles
      } ${variantStyles[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
