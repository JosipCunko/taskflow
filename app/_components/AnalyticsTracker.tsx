"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
/*
  Session Management: Automatically starts sessions on app launch
  Page Change Tracking: Tracks navigation between features
  Route-Based Feature Detection: Maps URLs to features (tasks, calendar, notes, etc.)
*/

import {
  trackPageView,
  trackAppOpen,
  trackUserEngagement,
} from "@/app/_lib/analytics";

async function postToServer(endpoint: string, data: object) {
  try {
    await fetch(`/api/analytics/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
  }
}

export default function AnalyticsTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!session?.user?.id) return;

    const initializeSession = async () => {
      // Track app open and initial page view
      trackAppOpen();
      trackPageView("App Launch", pathname);
      await postToServer("feature", {
        userId: session.user.id,
        feature: "App Launch",
      });

      // Track feature-specific page
      const feature = getFeatureFromPath(pathname);
      if (feature) {
        trackPageView(feature, pathname);
        await postToServer("feature", {
          userId: session.user.id,
          feature,
        });
      }
    };

    initializeSession();

    const handleBeforeUnload = () => {
      if (session?.user?.id) {
        const data = {
          userId: session.user.id,
          feature: "sessionEnd",
          duration: 0,
        };
        postToServer("feature", data);
        trackUserEngagement(0, "sessionEnd");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const trackPageChange = async () => {
      const feature = getFeatureFromPath(pathname);
      if (feature) {
        trackPageView(feature, pathname);
        await postToServer("feature", {
          userId: session.user.id,
          feature,
          duration: 0,
        });
      }
    };

    trackPageChange();
  }, [pathname, session?.user?.id]);

  return null;
}

function getFeatureFromPath(pathname: string): string {
  if (pathname.includes("/tasks")) return "tasks";
  if (pathname.includes("/calendar")) return "calendar";
  if (pathname.includes("/notes")) return "notes";
  if (pathname.includes("/inbox")) return "inbox";
  if (pathname.includes("/profile")) return "profile";
  if (pathname.includes("/webapp")) return "dashboard";
  return "app";
}
