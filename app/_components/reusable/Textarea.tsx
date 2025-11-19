import { cn } from "@/app/_utils/utils";
import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  name: string;
  value?: string;
  defaultValue?: string;
}

function Textarea({
  id,
  name,
  value,
  defaultValue,
  className,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      id={id ? id : name}
      name={name}
      value={value}
      defaultValue={defaultValue}
      className={cn(
        "w-full px-3 py-2 bg-background-600 rounded-md focus:outline-none border-1 border-background-500 focus-within:ring-2 focus-within:ring-primary-500 placeholder:text-text-gray resize-none",
        className
      )}
      {...rest}
    />
  );
}
export default Textarea;
