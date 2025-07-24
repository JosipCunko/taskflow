"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { updateUserPropertiesFromData, trackAppOpen } from "@/app/_lib/analytics";
import { AppUser, AnalyticsData } from "../_types/types";

// Api routes are a bridge for the functions for analytics-admin.ts
async function postToServer(endpoint: string, data: object) {
  try {
    const response = await fetch(`/api/analytics/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to post to ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
  }
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

export default function AnalyticsTracker({
  userData,
}: {
  userData: AppUser | null;
}) {
  const pathname = usePathname();
  const lastActivityTime = useRef(Date.now());
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userData?.uid) return;

    const startSession = async () => {
      const storedSessionId = sessionStorage.getItem("sessionId");
      if (storedSessionId) {
        sessionIdRef.current = storedSessionId;
        return;
      }

      trackAppOpen();
      const feature = getFeatureFromPath(pathname);
      const data = await postToServer("session/start", {
        userId: userData.uid,
        pageTitle: feature,
      });

      if (data?.sessionId) {
        sessionIdRef.current = data.sessionId;
        sessionStorage.setItem("sessionId", data.sessionId);
      }
    };
    const updateUserProperties = async () => {
      try {
        // Fetch analytics data to combine with user data
        const analyticsResponse = await fetch("/api/analytics/data");
        let analyticsData: AnalyticsData | null = null;
        let sessionCount = 0;
        
        if (analyticsResponse.ok) {
          const result = await analyticsResponse.json();
          analyticsData = result.analyticsData;
          sessionCount = result.sessionCount || 0;
        }

        // Use the enhanced function that combines user data and analytics data
        updateUserPropertiesFromData(
          {
            currentStreak: userData.currentStreak,
            completedTasksCount: userData.completedTasksCount,
            rewardPoints: userData.rewardPoints,
            notifyReminders: userData.notifyReminders,
            notifyAchievements: userData.notifyAchievements,
            createdAt: userData.createdAt,
            achievements: userData.achievements,
          },
          analyticsData || undefined,
          sessionCount
        );
      } catch (error) {
        console.error("Error setting user analytics properties:", error);
        // Fallback to basic user properties if analytics fetch fails
        updateUserPropertiesFromData({
          currentStreak: userData.currentStreak,
          completedTasksCount: userData.completedTasksCount,
          rewardPoints: userData.rewardPoints,
          notifyReminders: userData.notifyReminders,
          notifyAchievements: userData.notifyAchievements,
          createdAt: userData.createdAt,
          achievements: userData.achievements,
        });
      }
    };

    const endSession = () => {
      if (sessionIdRef.current) {
        const payload = JSON.stringify({
          sessionId: sessionIdRef.current,
        });

        navigator.sendBeacon("/api/analytics/session/end", payload);
        sessionStorage.removeItem("sessionId");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        endSession();
      } else {
        lastActivityTime.current = Date.now();
      }
    };

    startSession();
    updateUserProperties();

    window.addEventListener("beforeunload", endSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", endSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userData?.uid, pathname]);

  useEffect(() => {
    if (sessionIdRef.current) {
      const timeSpent = Math.round(
        (Date.now() - lastActivityTime.current) / 1000
      );
      postToServer("session/update", {
        sessionId: sessionIdRef.current,
        pageTitle: getFeatureFromPath(pathname),
        timeSpent,
      });
      lastActivityTime.current = Date.now();
    }
  }, [pathname]);

  return null;
}
