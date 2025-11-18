"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "./reusable/Button";
import { usePWA } from "../_context/PWAContext";
import { firebaseConfig } from "../_lib/firebase";

interface PWAInstallProps {
  receiveUpdateNotifications?: boolean;
}

export default function PWAInstall({
  receiveUpdateNotifications = true,
}: PWAInstallProps) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { isInstallable, promptInstall } = usePWA();

  useEffect(() => {
    // Register service worker only in production
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope
          );

          // Send Firebase config to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: "FIREBASE_CONFIG",
              config: firebaseConfig,
            });
          }

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available - check user preference
                  if (receiveUpdateNotifications) {
                    if (confirm("New version available! Reload to update?")) {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                      window.location.reload();
                    }
                  } else {
                    // Silently update without prompting user
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });

      // Listen for successful controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }

    // Check if app was already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Show install prompt after a short delay
    if (isInstallable) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }
  }, [isInstallable]);

  const handleInstallClick = async () => {
    promptInstall();
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    //Used localStorage instead of sessionStorage because it persists across sessions
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if previously dismissed in this session
  useEffect(() => {
    if (localStorage.getItem("pwa-install-dismissed") === "true") {
      setShowInstallPrompt(false);
    }
  }, []);

  if (!showInstallPrompt || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-background-700 border border-background-600 rounded-lg shadow-2xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-192.png"
              alt="TaskFlow"
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-text-high">Install TaskFlow</h3>
              <p className="text-sm text-text-low">
                Add to your home screen for quick access
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleInstallClick} className="flex-1">
            Install
          </Button>
          <Button variant="secondary" onClick={handleDismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
