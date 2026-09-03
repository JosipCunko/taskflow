import { HTMLAttributes } from "react";
import { cn } from "@/app/_utils/utils";

export default function Bone({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse bg-background-500", className)} {...rest} />
  );
}
