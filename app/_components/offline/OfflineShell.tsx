"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";
import { useOfflineNavStore } from "@/app/_lib/offlineNavigation";
import OfflineRouteView from "./OfflineRouteView";

/**
 * While offline, in-app navigations are history.pushState only. This shell
 * renders the matching cached view so Next.js never starts an RSC fetch that
 * would fall through to /offline and a stuck loading spinner.
 */
export default function OfflineShell({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const pathname = usePathname();
  const router = useRouter();
  const offlinePath = useOfflineNavStore((state) => state.offlinePath);
  const setOfflinePath = useOfflineNavStore((state) => state.setOfflinePath);
  const wasOffline = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      if (!navigator.onLine) {
        setOfflinePath(window.location.pathname);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setOfflinePath]);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }

    if (wasOffline.current && offlinePath) {
      const path = `${window.location.pathname}${window.location.search}`;
      setOfflinePath(null);
      wasOffline.current = false;
      router.replace(path);
    }
  }, [isOnline, offlinePath, router, setOfflinePath]);

  useEffect(() => {
    if (isOnline && !offlinePath) {
      wasOffline.current = false;
    }
  }, [isOnline, offlinePath, pathname]);

  if (!isOnline && offlinePath) {
    return <OfflineRouteView pathname={offlinePath} />;
  }

  return children;
}
