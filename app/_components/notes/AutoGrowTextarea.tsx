"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface AutoGrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const AutoGrowTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoGrowTextareaProps
>((props, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => textareaRef.current!);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      onChange={(e) => {
        adjustHeight();
        props.onChange?.(e);
      }}
      className={`block w-full px-3 py-2 bg-background-700 border border-divider rounded-md shadow-sm placeholder-text-low focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-text-low disabled:opacity-70 disabled:bg-background-550 overflow-hidden resize-none ${props.className}`}
      style={{
        minHeight: "60px",
        ...props.style,
      }}
    />
  );
});

AutoGrowTextarea.displayName = "AutoGrowTextarea";

export default AutoGrowTextarea;
