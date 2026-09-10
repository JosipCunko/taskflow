"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "../_hooks/useOnlineStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "../_store/taskStore";
import { flushPendingActions } from "../_lib/offlineTaskQueue";

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const source = useTaskStore((state) => state.source);
  const pendingCount = useTaskStore((state) => state.pendingCount);
  const isSyncing = useTaskStore((state) => state.isSyncing);
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const flushStarted = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      flushStarted.current = false;
      return;
    }

    if (!wasOffline) return;

    let cancelled = false;

    const run = async () => {
      if (flushStarted.current) return;
      flushStarted.current = true;

      const result = await flushPendingActions();
      if (cancelled) return;

      if (result.synced > 0 || result.discarded > 0) {
        router.refresh();
      }

      setShowReconnected(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isOnline, wasOffline, router]);

  if (isOnline && !showReconnected && !isSyncing) {
    return null;
  }

  const usingCache = source !== "none";
  const offlineMessage = usingCache
    ? pendingCount > 0
      ? `You're offline. ${pendingCount} change${pendingCount === 1 ? "" : "s"} will sync later.`
      : "You're offline. Showing tasks saved on this device."
    : "You're offline. Load the app once while online to cache your tasks.";

  const reconnectMessage = isSyncing
    ? "Back online! Syncing your data..."
    : pendingCount > 0
      ? "Back online. Some changes are still waiting to sync."
      : "Back online.";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isOnline && !showReconnected && !isSyncing
          ? "translate-y-[-100%]"
          : "translate-y-0"
      }`}
    >
      {!isOnline && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>{offlineMessage}</span>
          </div>
        </div>
      )}

      {(showReconnected || isSyncing) && isOnline && (
        <div className="bg-green-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>{reconnectMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
