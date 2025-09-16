"use client";

import { useState, useEffect } from "react";

export default function ThinkingIndicator({
  className,
}: {
  className?: string;
}) {
  const [dots, setDots] = useState(".");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ".";
        return prev + ".";
      });
    }, 500);

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div
      className={`rounded-xl p-3 max-w-xs md:max-w-md lg:max-w-lg bg-background-500 ${className}`}
    >
      <p className="text-sm">Thinking{dots}</p>
      <p className="text-xs text-primary-300 pt-1">{timer}s</p>
    </div>
  );
}
