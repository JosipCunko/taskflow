/**
 * Offline Indicator Component
 * Shows a banner when the user is offline
 */

"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "../_hooks/useOnlineStatus";
import { useEffect, useState } from "react";

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Just came back online
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't show anything if online and never was offline
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isOnline && !showReconnected ? "translate-y-[-100%]" : "translate-y-0"
      }`}
    >
      {!isOnline && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>
              You&apos;re offline. Some features may be limited. Cached data is
              being used.
            </span>
          </div>
        </div>
      )}

      {showReconnected && (
        <div className="bg-green-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Back online! Syncing your data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
