"use client";

import { usePathname } from "next/navigation";
import { useOfflineNavStore } from "@/app/_lib/offlineNavigation";

/** Path the user is looking at, including offline history.pushState navigations. */
export function useAppPathname() {
  const pathname = usePathname();
  const offlinePath = useOfflineNavStore((state) => state.offlinePath);
  return offlinePath ?? pathname;
}
