"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

/**
 * The server has no connectivity information, so it always reports online.
 * useSyncExternalStore re-checks the real value as soon as hydration finishes,
 * which is why this is not a useEffect: an effect-based hook reports "online"
 * for a frame even when the browser is offline, and /offline used to redirect
 * back into the app on that stale first value.
 */
function getServerSnapshot() {
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
