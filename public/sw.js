// TaskFlow Service Worker - Enhanced Offline Support + Firebase Messaging
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

const CACHE_VERSION = "17.2.1";
const CACHE_NAME = `taskflow-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `taskflow-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `taskflow-static-${CACHE_VERSION}`;

// Assets to cache on install - Main app pages and essential resources
const PRECACHE_URLS = [
  "/",
  "/webapp",
  "/webapp/tasks",
  "/webapp/today",
  "/webapp/notes",
  "/webapp/profile",
  "/webapp/calendar",
  "/webapp/completed",
  "/webapp/fitness",
  "/webapp/health",
  "/login",
  "/offline",
  "/manifest.json",
  "/icon-512.png",
  "/logo.png",
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

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
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
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip Chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith("http")) return;

  // Skip API calls and auth requests - network-first with offline fallback
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("/auth/")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful API responses for short-term offline access
          if (response.ok && event.request.method === "GET") {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to serve from cache first for GET requests
          if (event.request.method === "GET") {
            return caches.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return meaningful offline response if no cache available
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
            });
          }

          // For non-GET requests, return offline error
          return new Response(
            JSON.stringify({
              error: "offline",
              message:
                "You are currently offline. This action will be synced when you're back online.",
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
          // Cache the page for offline access
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached version
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page if available
            return caches.match("/offline").then((offlinePage) => {
              return offlinePage || caches.match("/");
            });
          });
        })
    );
    return;
  }

  // Skip non-GET requests for static assets
  if (event.request.method !== "GET") return;

  // Cache-first strategy for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Cache static assets (JS, CSS, images, fonts)
          const url = new URL(event.request.url);
          const isStatic =
            url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|eot)$/) ||
            url.pathname.startsWith("/_next/static/");

          if (isStatic) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          } else {
            // Cache other requests in runtime cache
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // If both network and cache fail, return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
          return null;
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
    payload.notification?.title || "TaskFlow Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/icon-512.png",
    badge: "/icon-512.png",
    tag: payload.data?.type || "taskflow-notification",
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
