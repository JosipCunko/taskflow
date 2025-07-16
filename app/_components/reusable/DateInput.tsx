"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useOutsideClick } from "@/app/_hooks/useOutsideClick";
import { cn } from "@/app/_utils/utils";

export default function DateInput({
  date,
  setDate,
  children,
  placement = "bottom",
  className,
}: {
  date: Date;
  setDate: (date: Date) => void;
  children: React.ReactNode;
  placement?: "top" | "bottom";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick(() => setIsOpen(false));

  const handleDaySelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const today = new Date();
  const disabledDays = { before: today };

  const placementClass =
    placement === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : "top-full mt-2 right-1/2 translate-x-1/2";

  return (
    <div ref={ref} className="relative ">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-10 backdrop-blur-2xl rounded-xl p-4 bg-gradient-to-br from-background-500 via-background-650  to-background-700",
              placementClass,
              className
            )}
          >
            <div>
              <DayPicker
                captionLayout="label"
                required
                mode="single"
                selected={date}
                onSelect={handleDaySelect}
                disabled={disabledDays}
                styles={{
                  root: {
                    border: "none",
                    background: "hsl(var(--background-800))",
                    color: "hsl(var(--text-high))",
                  },
                  head_cell: {
                    color: "hsl(var(--text-high))",
                  },
                  table: {
                    maxWidth: "none",
                  },
                  day: {
                    color: "hsl(var(--text-high))",
                    borderRadius: "0.25rem",
                  },
                  button: {
                    borderRadius: "0.25rem",
                    color: "hsl(var(--text-high))",
                    transition: "background-color 0.2s",
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        {children}
      </div>
    </div>
  );
}
