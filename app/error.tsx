"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Terminal } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background-700 to-background-600 px-4 text-center">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[400px] font-bold text-error animate-pulse">
            !
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1 absolute inset-0">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-divider opacity-20"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-background-625 rounded-full animate-pulse">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-high mb-4">
          Something went wrong
        </h1>

        <p className="text-text-low text-pretty text-lg mb-8">
          We&apos;ve encountered an unexpected error while processing your
          request.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="bg-primary-600 hover:bg-primary-500 text-text-high font-medium py-2 px-6 rounded transition-colors duration-200 w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again {countdown > 0 ? `(${countdown})` : ""}</span>
          </button>

          <Link href="/" passHref>
            <button className="bg-background-500 hover:bg-background-625 text-text-high font-medium py-2 px-6 rounded transition-colors duration-200 w-full flex items-center justify-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Return to homepage</span>
            </button>
          </Link>

          <div className="mt-8 pt-6 border-t border-background-500">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-text-low text-sm hover:text-text-high flex items-center justify-center space-x-2 mx-auto transition-colors"
            >
              <Terminal className="h-4 w-4" />
              <span>
                {isExpanded ? "Hide error details" : "Show error details"}
              </span>
            </button>

            {isExpanded && (
              <div className="mt-4 p-4 bg-background-700 border border-background-500 rounded-md text-left overflow-auto max-h-64">
                <p className="text-error font-mono text-sm mb-2">
                  {error.name}: {error.message}
                </p>
                <pre className="text-text-low font-mono text-xs whitespace-pre-wrap">
                  {error.stack || "No stack trace available"}
                </pre>
                {error.digest && (
                  <p className="mt-4 text-text-low font-mono text-xs">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 top-1/3 h-1 w-full bg-error opacity-20"
        style={{ transform: "translateY(-50%) skewY(5deg)" }}
      ></div>
      <div
        className="absolute left-0 top-2/3 h-1 w-full bg-primary-500 opacity-20"
        style={{ transform: "translateY(-50%) skewY(-3deg)" }}
      ></div>
    </div>
  );
}
