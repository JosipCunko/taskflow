"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAppOpen, setUserAnalyticsProperties } from "@/app/_lib/analytics";
import { AppUser, AnalyticsData } from "../_types/types";
import { navItems } from "../_utils/utils";

// Api routes are a bridge for the functions for analytics-admin.ts
async function postToAnalyticsRoute(endpoint: string, data: object) {
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
  // remove /webapp
  const navItemsArr = Object.values(navItems).flat().slice(1, -1);
  navItemsArr.forEach((item) => {
    if (pathname.includes(item.href)) return item.label;
  });
  return "dashboard";
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

    const startOrLoadSession = async () => {
      const storedSessionId = sessionStorage.getItem("sessionId");
      if (storedSessionId) {
        sessionIdRef.current = storedSessionId;
        return;
      }

      trackAppOpen();
      const feature = getFeatureFromPath(pathname);
      // Call startUserSession from an api route
      const data = await postToAnalyticsRoute("session/start", {
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
        const analyticsResponse = await fetch("/api/analytics/data");
        let analyticsData: AnalyticsData | null = null;
        let sessionsCount = 0;

        if (analyticsResponse.ok) {
          const result = await analyticsResponse.json();
          analyticsData = result.analyticsData;
          sessionsCount = result.sessionsCount || 0;
        }

        // Use the enhanced function that combines user data and analytics data
        setUserAnalyticsProperties(
          userData,
          analyticsData || undefined,
          sessionsCount
        );
      } catch (error) {
        console.error("Error setting user analytics properties:", error);
        // Fallback to basic user properties if analytics fetch fails
        setUserAnalyticsProperties(userData);
      }
    };

    const endSession = () => {
      if (sessionIdRef.current) {
        const timeSpent = Math.round(
          (Date.now() - lastActivityTime.current) / 1000
        );

        const payload = JSON.stringify({
          sessionId: sessionIdRef.current,
          timeSpent,
        });

        // async sends post req to a web server, intended for sending analytics
        // cals endUserSession
        navigator.sendBeacon("/api/analytics/session/end", payload);
        sessionStorage.removeItem("sessionId");
        sessionIdRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastActivityTime.current = Date.now();
      }
    };

    startOrLoadSession();
    updateUserProperties();

    // Only end session on actual page unload (browser/app close)
    window.addEventListener("beforeunload", endSession);
    // Switches or closes tab, minimizes or closes the browser, or on mobile swithces to a diff app
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", endSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userData?.uid, pathname]);

  useEffect(() => {
    async function updateOnPathChange() {
      if (!sessionIdRef.current) return;

      const timeSpent = Math.round(
        (Date.now() - lastActivityTime.current) / 1000
      );
      // cals updateUserSession with these properties from an api route
      // Update session with time spent on previous page and new page visit
      await postToAnalyticsRoute("session/update", {
        sessionId: sessionIdRef.current,
        pageTitle: getFeatureFromPath(pathname),
        //Increments activeTime
        timeSpent,
      });

      lastActivityTime.current = Date.now();
    }

    if (sessionIdRef.current) {
      updateOnPathChange();
    }
  }, [pathname]);

  return null;
}
