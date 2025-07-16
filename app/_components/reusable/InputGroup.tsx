"use client";
import { useState, type ReactNode, Children, cloneElement } from "react";
import { cn } from "../../_utils/utils";

interface InputGroupProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function InputGroup({
  children,
  className,
  containerClassName,
}: InputGroupProps) {
  const [isFocused, setIsFocused] = useState(false);
  const childrenArray = Children.toArray(children);

  return (
    <div
      className={cn(
        "flex flex-col gap-0 h-min bg-background-600 rounded-md border border-background-500 transition-all duration-300 divide-y divide-background-500 px-4 ",
        containerClassName,
        isFocused ? "ring-2 ring-primary-500 border-primary-500" : ""
      )}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
    >
      {childrenArray.map((child, i) =>
        cloneElement(child as React.ReactElement<InputGroupProps>, {
          key: i,
          className: cn(
            (child as React.ReactElement<InputGroupProps>).props.className,
            className
          ),
        })
      )}
    </div>
  );
}
