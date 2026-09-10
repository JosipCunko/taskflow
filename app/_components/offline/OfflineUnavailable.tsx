"use client";

import { CloudOff } from "lucide-react";

/**
 * Shown for app routes whose data is generated on the server (notifications,
 * AI, nutrition lookups, fitness history). Better than a dead spinner.
 */
export default function OfflineUnavailable({ label }: { label: string }) {
  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8">
      <div className="mt-8 grid place-items-center">
        <div className="max-w-md text-center flex flex-col items-center gap-4 bg-background-700 rounded-lg p-8">
          <div className="p-5 bg-background-800 rounded-full border border-primary-500/40">
            <CloudOff className="size-12 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-primary-400">
            {label} needs a connection
          </h1>
          <p className="text-text-low">
            This section is generated on the server, so it can&apos;t be shown
            offline. Your tasks are still available, and anything you change
            will sync once you&apos;re back online.
          </p>
        </div>
      </div>
    </div>
  );
}
