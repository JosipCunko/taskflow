# Prioritron Offline Support

How offline actually works: a service worker for assets and cold start, IndexedDB plus a Zustand store for task data, and a write queue that flushes when the connection returns.

## What works offline

After the app has loaded once while online:

- **View** dashboard, tasks, calendar, today, and completed from the tasks cached on this device
- **Navigate** between those pages without leaving the live document
- **Create, complete, delay, delete, toggle priority/reminder** on regular tasks — applied locally, synced later

Still needs a network:

- Notes, health, fitness, AI, inbox, profile, analytics, auth, USDA search
- Completing a repeating task (the cycle math lives on the server)
- Opening the PWA from a cold start with no cached tasks — that is what `/offline` is for

## Architecture

### In-session (the app is already open)

1. The webapp layout fetches tasks and seeds `useTaskStore` plus IndexedDB (`TaskStoreHydrator`).
2. Going offline shows a banner. The current page stays as-is.
3. Sidebar and search links call `navigateOffline` (`history.pushState`) instead of a Next.js RSC navigation. `OfflineShell` renders the matching client view from the store.
4. Writes go through `app/_lib/offlineTaskQueue.ts`. If `navigator.onLine` is false, or the server action throws a network error (`Failed to fetch`, etc.), the change is stored in the `pending-actions` IndexedDB store and applied to the Zustand list immediately.
5. On `online`, `OfflineIndicator` flushes the queue in order, then `router.refresh()`.

This is why Calendar no longer flashes `/offline` and hangs on a spinner: that path was a failed RSC fetch falling through to a full document load, which the service worker could only answer with `/offline`.

### Cold start (new tab / PWA icon, no document)

The service worker does **not** cache `/webapp` HTML or RSC payloads. Caching those is what made the dashboard show yesterday's tasks (see `md/caching.md`).

If a navigation fails and there is no cached public page, the worker serves `/offline`. That page waits until `navigator.onLine` is actually true, then does a full load of `/webapp`. It does not `router.push` on the first paint (that used to bounce you into a layout that cannot render without Firestore).

### Service worker (`public/sw.js`)

- Precache: `/offline`, manifest, icons — not personalized app HTML
- Navigate: network-first for public pages; never cache `/webapp` documents
- Never intercept: RSC (`_rsc`, `RSC`, `text/x-component`), `Next-Action`, non-GET, `/api/auth`
- Other `/api/*` GETs: network, then a JSON 503 `{ error: "offline" }` if the network fails
- Cache-first only for hashed `/_next/static/` assets

The worker registers in production only (`PWAInstall`, `fcm.ts`). DevTools "Offline" on `next dev` will not exercise it.

## Files changed to enable this

Grouped by what they do, not by folder. Unrelated dirty files in the working tree (auth, landing, fitness, etc.) are not part of offline support.

### New

- [`app/_store/taskStore.ts`](../app/_store/taskStore.ts) — Zustand store for the live task list, where the data came from (server vs cache), pending-write count, and syncing flag. `useHydratedTasks` lets pages prefer this list over server props after the first hydrate.
- [`app/_lib/offlineTaskQueue.ts`](../app/_lib/offlineTaskQueue.ts) — Client wrappers around task server actions. Online: call the action. Offline or `Failed to fetch`: optimistic store update + IndexedDB queue. `flushPendingActions` replays oldest-first on reconnect and remaps temp ids after a queued create.
- [`app/_lib/offlineNavigation.ts`](../app/_lib/offlineNavigation.ts) — `navigateOffline` uses `history.pushState` so Next.js never starts an RSC fetch. `navigateApp` is the same helper for `router.push` call sites.
- [`app/_hooks/useAppPathname.ts`](../app/_hooks/useAppPathname.ts) — Pathname that includes those `pushState` navigations, so the sidebar highlight stays in sync while offline.
- [`app/_components/offline/AppLink.tsx`](../app/_components/offline/AppLink.tsx) — `Link` that `preventDefault`s and calls `navigateOffline` when there is no connection.
- [`app/_components/offline/OfflineShell.tsx`](../app/_components/offline/OfflineShell.tsx) — Wraps webapp page children. While offline after an in-app nav, renders `OfflineRouteView` instead of waiting on RSC. Handles Back via `popstate` and `router.replace`s the real page when you come back online.
- [`app/_components/offline/OfflineRouteView.tsx`](../app/_components/offline/OfflineRouteView.tsx) — Maps `/webapp`, `/tasks`, `/calendar`, `/today`, `/completed` onto the existing client UIs plus a slim dashboard. Other routes get `OfflineUnavailable`.
- [`app/_components/offline/OfflineDashboard.tsx`](../app/_components/offline/OfflineDashboard.tsx) — Task-only dashboard (no points, streaks, or analytics — those are not cached).
- [`app/_components/offline/OfflineUnavailable.tsx`](../app/_components/offline/OfflineUnavailable.tsx) — Copy for notes / health / fitness / AI / inbox / profile while offline, instead of a spinner.
- [`app/_components/offline/TaskStoreHydrator.tsx`](../app/_components/offline/TaskStoreHydrator.tsx) — On layout render, copies the server task list into the store and IndexedDB.
- [`app/webapp/completed/CompletedTasksClient.tsx`](../app/webapp/completed/CompletedTasksClient.tsx) — Completed page extracted to a client component so it can read the store (needed both online after an optimistic write and offline).

### Core plumbing (modified)

- [`public/sw.js`](../public/sw.js) — Do not cache `/webapp` HTML. Do not intercept RSC, `Next-Action`, non-GET, or `/api/auth`. Stop wrapping auth in a fake 503. `/offline` is only the fallback for a failed navigation with no cached public page. Purge any previously cached webapp documents on activate.
- [`app/offline/page.tsx`](../app/offline/page.tsx) — Wait until the client has read `navigator.onLine` before leaving. Use `location.replace("/webapp")` instead of `router.push`, so a SW-served document does not bounce into a stuck layout.
- [`app/_hooks/useOnlineStatus.ts`](../app/_hooks/useOnlineStatus.ts) — `useSyncExternalStore` instead of `useState(true)` + `useEffect`. The old hook reported online for a frame, which is what made `/offline` redirect immediately.
- [`app/_utils/offlineStorage.ts`](../app/_utils/offlineStorage.ts) — `replaceOfflineStore` (clear + write, so deletions do not linger), `deletePendingAction`, `countPendingActions`. The pending-action helpers were unused before.
- [`app/_components/OfflineIndicator.tsx`](../app/_components/OfflineIndicator.tsx) — Banner copy depends on whether cached tasks exist and how many writes are queued. “Syncing…” only while `flushPendingActions` is running.
- [`app/webapp/layout.tsx`](../app/webapp/layout.tsx) — Mounts `TaskStoreHydrator` and wraps `{children}` in `OfflineShell`.
- [`middleware.ts`](../middleware.ts) — Removed the dead `x-offline-mode` rewrite to `/offline` (nothing ever set that header).

### Navigation (stop the Calendar spinner)

- [`app/_components/Sidebar.tsx`](../app/_components/Sidebar.tsx) — `Link` → `AppLink`; active state from `useAppPathname`.
- [`app/_components/AnimatedSidebar.tsx`](../app/_components/AnimatedSidebar.tsx) — Close-on-navigate uses `useAppPathname` so mobile still closes after an offline `pushState`.
- [`app/_components/SearchApp.tsx`](../app/_components/SearchApp.tsx) — Search and keyboard nav go through `AppLink` / `navigateApp`. Task search reads the hydrated store.
- [`app/_hooks/useKeyboardNavigation.ts`](../app/_hooks/useKeyboardNavigation.ts) — Ctrl shortcuts call `navigateApp` instead of `router.push`.
- [`app/_components/TopSidebar.tsx`](../app/_components/TopSidebar.tsx) — Profile avatar uses `AppLink`.
- [`app/_components/inbox/NotificationBell.tsx`](../app/_components/inbox/NotificationBell.tsx) — Inbox icon uses `AppLink` (shows “needs a connection”, not a spinner).
- [`app/_components/inbox/NotificationSummary.tsx`](../app/_components/inbox/NotificationSummary.tsx) — Dashboard “View all” / “Manage notifications” use `AppLink`.

### Reads (pages use the store after hydrate)

- [`app/webapp/tasks/TasksPageClient.tsx`](../app/webapp/tasks/TasksPageClient.tsx) — Renders `useHydratedTasks(serverTasks)` so optimistic creates/edits show without waiting on RSC.
- [`app/webapp/calendar/Calendar.tsx`](../app/webapp/calendar/Calendar.tsx) — Same: merge regular + repeating from the store when it is hydrated.
- [`app/_components/TodayPlanSection.tsx`](../app/_components/TodayPlanSection.tsx) — Re-filters “relevant today” from the hydrated list.
- [`app/webapp/completed/page.tsx`](../app/webapp/completed/page.tsx) — Thin server wrapper; UI moved to `CompletedTasksClient`.

### Writes (queue instead of “Failed to fetch”)

- [`app/_components/AddTask.tsx`](../app/_components/AddTask.tsx) — `createTaskAction` → `createTaskOfflineFirst`.
- [`app/_components/AddTodayTask.tsx`](../app/_components/AddTodayTask.tsx) — Same for the Today modal.
- [`app/_components/Dropdown.tsx`](../app/_components/Dropdown.tsx) — Complete / delay / delete / toggle priority / toggle reminder go through the queue helpers. Experience rating is still a live server action.
- [`app/_components/RepeatingTaskCard.tsx`](../app/_components/RepeatingTaskCard.tsx) — Completing a repeating task still needs the server; a network error now says so instead of a generic `Failed to fetch`.

### Removed / docs

- [`app/_hooks/useOfflineData.ts`](../app/_hooks/useOfflineData.ts) — Deleted. Never imported; would have been a second unused cache path.
- [`README.md`](../README.md) — Dropped “full offline / Background Sync API” claims; described queued sync and `/offline` as cold-start only.
- [`md/middleware.md`](./middleware.md) — Offline rewrite example removed; points here instead.
- [`md/offlineSupport.md`](./offlineSupport.md) — This file: behavior as implemented, plus this changelog.

## Testing

Use a production build (`npm run build && npm start`) or the deployed site so the service worker is registered. Load `/webapp` and `/webapp/tasks` while online, then set DevTools Network to Offline.

1. Banner appears; Calendar / Tasks / Today switch without a spinner or `/offline` flash.
2. Create or complete a regular task — it shows locally; reconnect flushes to Firestore.
3. New tab while still offline — `/offline` stays until you are actually online.
4. Online task create — Network tab shows the Server Action POST succeeding (the worker must not intercept `Next-Action`).
