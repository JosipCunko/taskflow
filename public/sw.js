// Prioritron Service Worker - Enhanced Offline Support + Firebase Messaging
/*
The service worker is caching the old JavaScript code. The cache version is currently "v2", but we need to bump it to force the browser to clear the old cached code
*/

// Import Firebase scripts for push notifications
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAglE46axLC1qrhzTmLs4rp0m41k3nxjqg",
  authDomain: "taskflow-30758.firebaseapp.com",
  projectId: "taskflow-30758",
  storageBucket: "taskflow-30758.firebasestorage.app",
  messagingSenderId: "111130940219",
  appId: "1:111130940219:web:195357be2b2c44b93b5d1e",
  measurementId: "G-LBJSKW4CX4",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const CACHE_VERSION = "19.0.0";
const CACHE_NAME = `prioritron-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `prioritron-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `prioritron-static-${CACHE_VERSION}`;

// Static assets only — never precache personalized App Router HTML.
const PRECACHE_URLS = [
  "/offline",
  "/manifest.json",
  "/icon-512.png",
  "/logo.png",
  "/logo.svg",
  "/icon.svg",
];

// Install event - precache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((error) => {
        console.error("Failed to cache resources during install:", error);
        // Continue with installation even if some resources fail to cache
        return Promise.resolve();
      })
  );
  self.skipWaiting();
});

// Drop personalized app HTML that older versions of this worker cached.
// Serving it later shows another account's data or a stale task list.
async function purgeWebappDocuments() {
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter((request) => new URL(request.url).pathname.startsWith("/webapp"))
      .map((request) => cache.delete(request))
  );
}

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE &&
                name !== STATIC_CACHE
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(purgeWebappDocuments)
  );
  self.clients.claim();
});

function isNextDataRequest(request) {
  const url = new URL(request.url);
  if (url.searchParams.has("_rsc")) return true;
  if (request.headers.get("RSC") === "1") return true;
  if (request.headers.get("Next-Router-Prefetch")) return true;
  if (request.headers.get("Next-Router-State-Tree")) return true;
  // Server actions. They are POSTs today, so the method check below already
  // covers them, but a mangled action response is the hardest failure to
  // debug ("Failed to fetch" with no useful stack) - never touch them.
  if (request.headers.get("Next-Action")) return true;
  const accept = request.headers.get("Accept") || "";
  if (accept.includes("text/x-component")) return true;
  return false;
}

// Personalized App Router documents must never be cached. See md/caching.md.
function isAppDocument(url) {
  return new URL(url).pathname.startsWith("/webapp");
}

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip Chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith("http")) return;

  // Never intercept or cache RSC / App Router data payloads.
  // Cache-first here is what made /tasks and the dashboard show stale data.
  if (isNextDataRequest(event.request) || event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Authentication must reach the real network or fail as a network error.
  // Synthesizing a 503 JSON body here made NextAuth report CLIENT_FETCH_ERROR
  // instead of simply retrying, which looks like a broken session.
  if (requestUrl.pathname.startsWith("/api/auth")) {
    return;
  }

  // Other API calls: network-first with a machine-readable offline body so
  // callers can tell "offline" apart from a real server error.
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "offline",
            message:
              "You are currently offline and no cached data is available",
            timestamp: Date.now(),
          }),
          {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "application/json",
            }),
          }
        );
      })
    );
    return;
  }

  // Network-first strategy for HTML pages
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Public pages only. Caching /webapp HTML is what made the dashboard
          // and task list show yesterday's data after a refresh.
          if (!isAppDocument(event.request.url) && response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Only public documents are cached, so an app route falls straight
          // through to /offline. In-session navigation never gets here:
          // OfflineShell intercepts app links while offline so the running
          // document (and its in-memory task data) stays alive.
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match("/offline").then((offlinePage) => {
              return offlinePage || caches.match("/");
            });
          });
        })
    );
    return;
  }

  // Cache-first only for hashed/static assets. Everything else goes to the network.
  const isStatic =
    requestUrl.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|eot)$/) ||
    requestUrl.pathname.startsWith("/_next/static/");

  if (!isStatic) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    })
  );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});

// Handle Firebase background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log("Background Message received: ", payload);

  const notificationTitle =
    payload.notification?.title || "Prioritron Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/icon-512.png",
    badge: "/icon-512.png",
    tag: payload.data?.type || "prioritron-notification",
    data: payload.data,
    actions: [
      {
        action: "view",
        title: "View Task",
        icon: "/icon-512.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    // Open the app at a specific URL if available
    const urlToOpen = event.notification.data?.actionUrl || "/webapp";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && "focus" in client) {
              return client.focus();
            }
          }
          // Open new window if app not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
  // 'dismiss' action or default click just closes the notification
});
