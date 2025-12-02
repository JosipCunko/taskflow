import { cn } from "@/app/_utils/utils";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type: string;
  id?: string;
  name: string;
  value?: string | number | undefined;
  defaultValue?: string | number | undefined;
}

function Input({
  type,
  id,
  name,
  value,
  defaultValue,
  className,
  ...rest
}: InputProps) {
  return (
    <input
      type={type}
      id={id ? id : name}
      name={name}
      value={value}
      defaultValue={defaultValue}
      className={cn(
        "w-full px-3 py-2 bg-background-600 rounded-md focus:outline-none border-1 border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 placeholder:text-text-gray",
        className
      )}
      {...rest}
    />
  );
}
export default Input;
