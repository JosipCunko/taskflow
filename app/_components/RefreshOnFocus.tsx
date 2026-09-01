"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MIN_HIDDEN_MS = 5000;

/**
 * Refetches server components when the user returns to the app (other device
 * edits, daily repeating-task resets). Skips brief tab switches.
 */
export default function RefreshOnFocus() {
  const router = useRouter();
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }

      if (
        hiddenAt.current !== null &&
        Date.now() - hiddenAt.current >= MIN_HIDDEN_MS
      ) {
        router.refresh();
      }
      hiddenAt.current = null;
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
