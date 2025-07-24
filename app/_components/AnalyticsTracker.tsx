"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setUserAnalyticsProperties, trackAppOpen, trackPageView } from "@/app/_lib/analytics";
import { AppUser } from "../_types/types";

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
  const pageStartTime = useRef(Date.now());
  const currentFeature = useRef<string>("");

  useEffect(() => {
    if (!userData?.uid) return;

    const startSession = async () => {
      const storedSessionId = sessionStorage.getItem("sessionId");
      if (storedSessionId) {
        sessionIdRef.current = storedSessionId;
        return;
      }

      // Track app open in Firebase Analytics
      trackAppOpen();
      
      const feature = getFeatureFromPath(pathname);
      currentFeature.current = feature;
      
      // Track initial page view in Firebase Analytics
      trackPageView(feature, pathname);
      
      const data = await postToServer("session/start", {
        userId: userData.uid,
        pageTitle: feature,
      });

      if (data?.sessionId) {
        sessionIdRef.current = data.sessionId;
        sessionStorage.setItem("sessionId", data.sessionId);
      }
      
      // Track initial feature usage
      await postToServer("feature", {
        userId: userData.uid,
        feature: feature,
        duration: 0, // Initial load
      });
    };
    
    const updateUserProperties = async () => {
      try {
        setUserAnalyticsProperties({
          currentStreak: userData.currentStreak,
          totalTasksCompleted: userData.completedTasksCount,
          rewardPoints: userData.rewardPoints,
          notifyReminders: userData.notifyReminders,
          notifyAchievements: userData.notifyAchievements,
          notificationsEnabled:
            userData.notifyReminders || userData.notifyAchievements,
          lastLoginAt: new Date(),
        });
      } catch (error) {
        console.error("Error setting user analytics properties:", error);
      }
    };

    const endSession = () => {
      if (sessionIdRef.current) {
        // Calculate time spent on current page before ending session
        const timeSpentOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        
        // Track final feature usage before ending session
        if (currentFeature.current && timeSpentOnPage > 0) {
          postToServer("feature", {
            userId: userData.uid,
            feature: currentFeature.current,
            duration: timeSpentOnPage,
          });
        }

        const payload = JSON.stringify({
          sessionId: sessionIdRef.current,
        });

        navigator.sendBeacon("/api/analytics/session/end", payload);
        sessionStorage.removeItem("sessionId");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Calculate time spent before hiding
        const timeSpentOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        
        if (sessionIdRef.current && timeSpentOnPage > 0) {
          // Update session with time spent
          postToServer("session/update", {
            sessionId: sessionIdRef.current,
            pageTitle: currentFeature.current,
            timeSpent: timeSpentOnPage,
          });
          
          // Track feature usage
          postToServer("feature", {
            userId: userData.uid,
            feature: currentFeature.current,
            duration: timeSpentOnPage,
          });
        }
        
        endSession();
      } else {
        // Reset timers when page becomes visible again
        lastActivityTime.current = Date.now();
        pageStartTime.current = Date.now();
      }
    };

    // Reset page start time for initial load
    pageStartTime.current = Date.now();
    lastActivityTime.current = Date.now();

    startSession();
    updateUserProperties();

    window.addEventListener("beforeunload", endSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", endSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userData?.uid]); // Removed pathname from dependency to avoid restart on route change

  // Handle pathname changes separately to properly track page transitions
  useEffect(() => {
    if (!userData?.uid || !sessionIdRef.current) return;

    const newFeature = getFeatureFromPath(pathname);
    
    // Calculate time spent on previous page
    const timeSpentOnPreviousPage = Math.round((Date.now() - pageStartTime.current) / 1000);
    
    // Track feature usage for previous page if we spent meaningful time there
    if (currentFeature.current && timeSpentOnPreviousPage > 1) {
      postToServer("feature", {
        userId: userData.uid,
        feature: currentFeature.current,
        duration: timeSpentOnPreviousPage,
      });
    }

    // Update session with page transition
    if (timeSpentOnPreviousPage > 0) {
      postToServer("session/update", {
        sessionId: sessionIdRef.current,
        pageTitle: newFeature,
        timeSpent: timeSpentOnPreviousPage,
      });
    }
    
    // Track new page view in Firebase Analytics
    trackPageView(newFeature, pathname);
    
    // Update current feature and reset timers
    currentFeature.current = newFeature;
    pageStartTime.current = Date.now();
    lastActivityTime.current = Date.now();
    
  }, [pathname, userData?.uid]);

  return null;
}
