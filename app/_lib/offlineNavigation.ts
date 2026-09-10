"use client";

import { create } from "zustand";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface OfflineNavState {
  /**
   * App route the user asked for while offline. Non-null means OfflineShell is
   * rendering that route from cached tasks instead of the server page.
   */
  offlinePath: string | null;
  setOfflinePath: (offlinePath: string | null) => void;
}

export const useOfflineNavStore = create<OfflineNavState>((set) => ({
  offlinePath: null,
  setOfflinePath: (offlinePath) => set({ offlinePath }),
}));

/**
 * Moves to an app route without asking the network for anything.
 *
 * A normal client navigation needs an RSC payload for the target page. Offline
 * that request fails, Next.js falls back to a full document load, the service
 * worker has no cached app HTML, and the user lands on /offline - which is how
 * the endless loading spinner happened. Updating history ourselves keeps the
 * live document (and its task data) intact while the URL stays honest.
 */
export function navigateOffline(path: string) {
  window.history.pushState({}, "", path);
  useOfflineNavStore.getState().setOfflinePath(path);
}

/** Router navigation for code paths that cannot use a link. */
export function navigateApp(router: AppRouterInstance, path: string) {
  if (!navigator.onLine && path.startsWith("/webapp")) {
    navigateOffline(path);
    return;
  }
  router.push(path);
}
