"use client";

import { useEffect } from "react";
import { processYouTubeSummaryAction } from "@/app/_lib/actions";
import { AppUser } from "@/app/_types/types";
import toast from "react-hot-toast";

interface YouTubeBackgroundProcessorProps {
  userId: string;
  userData: AppUser;
}

export default function YouTubeBackgroundProcessor({ userId, userData }: YouTubeBackgroundProcessorProps) {
  useEffect(() => {
    const processYouTubeSummary = async () => {
      // Check if YouTube feature is enabled for this user
      if (!userData.youtubePreferences?.enabled) {
        return; // Feature disabled
      }

      // Check if we already processed today using localStorage to avoid duplicate requests
      const today = new Date().toDateString();
      const lastProcessed = localStorage.getItem("youtube-last-processed");
      
      if (lastProcessed === today) {
        return; // Already processed today
      }

      try {
        const result = await processYouTubeSummaryAction();
        
        if (result.success) {
          localStorage.setItem("youtube-last-processed", today);
          toast.success("📺 YouTube summary generated!", {
            duration: 4000,
            position: "bottom-right"
          });
        } else if (result.message && result.message.includes("already processed")) {
          localStorage.setItem("youtube-last-processed", today);
          // Don't show toast for already processed
        } else if (result.error) {
          console.log("YouTube processing error:", result.error);
          // Don't show error toast to avoid annoying users
        }
      } catch (error) {
        console.error("Error processing YouTube summary:", error);
        // Silent fail - don't annoy users with error messages
      }
    };

    // Run the process after a short delay to avoid blocking initial page load
    const timeout = setTimeout(processYouTubeSummary, 3000);

    return () => clearTimeout(timeout);
  }, [userId, userData.youtubePreferences?.enabled]);

  // This component doesn't render anything
  return null;
}