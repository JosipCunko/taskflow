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
    "relative isolate px-4 py-1 rounded-md transition-all duration-150 flex items-center gap-2 cursor-pointer letter-spacing font-semibold before:absolute before:inset-0 before:z-[-1] before:scale-x-0 before:origin-right before:transition-transform before:duration-300 hover:before:scale-x-100 before:origin-left";

  const variantStyles = {
    primary:
      "bg-primary-600 hover:bg-primary-600 text-white border border-primary-500",
    secondary: "bg-primary-500/10 hover:bg-primary-500/20 text-text-high ",
    sidebar: "w-full",
    danger: "text-error hover:bg-error/10 px-4 py-2 rounded-md",
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
