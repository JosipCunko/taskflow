"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";

export default function OfflineHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline && pathname !== "/offline") {
      router.push("/offline");
    }
  }, [isOnline, pathname, router]);

  return null;
}
