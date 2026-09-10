"use client";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/app/_components/reusable/Button";

/**
 * Cold-start fallback: the service worker serves this when a navigation fails
 * and there is no cached document for it (app opened from the home screen or a
 * new tab with no connection). Navigations that happen inside a running
 * /webapp session are handled by OfflineShell instead, so reaching this page
 * means there is no app shell to fall back to.
 */
export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only leave once the browser really reports a connection. Waiting for
    // mount avoids acting on the "online" value the server render assumes.
    if (!mounted || !isOnline) return;
    // A full navigation, not router.push: this document was served by the
    // service worker, so the App Router cache here does not match the server.
    window.location.replace("/webapp");
  }, [mounted, isOnline]);

  return (
    <div className="h-screen w-full grid place-items-center bg-background-700">
      <div className="text-center max-w-md px-4 flex flex-col gap-4 items-center">
        <div className="flex justify-center ">
          <div className="p-6 bg-background-800 rounded-full border border-primary-500">
            <WifiOff className="size-24 text-primary-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary-500 ">
          You&apos;re Offline
        </h1>
        <p className="text-text-low ">
          Prioritron needs a connection to load your tasks for the first time.
          This page will reopen the app as soon as you&apos;re back online.
        </p>
        <Button onClick={() => window.location.replace("/webapp")}>
          Try again
        </Button>
      </div>
    </div>
  );
}
