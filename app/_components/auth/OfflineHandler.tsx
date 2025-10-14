"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";

export default function OfflineHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  // COMMENTED OUT: Offline redirect disabled to enable Service Worker offline support
  // useEffect(() => {
  //   if (!isOnline && pathname !== "/offline") {
  //     router.push("/offline");
  //   }
  // }, [isOnline, pathname, router]);

  return null;
}
