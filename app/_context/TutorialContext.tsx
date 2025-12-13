"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isToday } from "date-fns";
import TutorialOverlay from "../_components/TutorialOverlay";
import { infoToast } from "@/app/_utils/utils";

const TUTORIAL_TOAST_SHOWN_KEY = "taskflow_tutorial_toast_shown";
const TUTORIAL_COMPLETED_KEY = "taskflow_tutorial_completed";

interface TutorialContextType {
  shouldShowTutorial: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
  markTutorialCompleted: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);

  // Check if user should see tutorial on first login of the day
  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user?.id) {
      checkTutorialStatus();
    }
  }, [session, status]);

  const checkTutorialStatus = () => {
    try {
      // Only show toast on user's first day
      const isFirstDay = isToday(session?.user?.createdAt as number);
      if (!isFirstDay) return;

      // Check if tutorial was already completed (persists across sessions)
      const tutorialCompleted = sessionStorage.getItem(TUTORIAL_COMPLETED_KEY);
      if (tutorialCompleted === "true") return;

      // Check if we've already shown the toast this session
      const toastAlreadyShown = sessionStorage.getItem(
        TUTORIAL_TOAST_SHOWN_KEY
      );
      if (toastAlreadyShown === "true") return;

      // Mark toast as shown for this session
      sessionStorage.setItem(TUTORIAL_TOAST_SHOWN_KEY, "true");

      infoToast("Welcome to TaskFlow! Start the tutorial in the profile page.");
    } catch (error) {
      console.error("Error checking tutorial status:", error);
    }
  };

  const showTutorial = () => {
    setShouldShowTutorial(true);
  };
  const hideTutorial = () => {
    setShouldShowTutorial(false);
  };
  const markTutorialCompleted = () => {
    setShouldShowTutorial(false);
    // Mark tutorial as completed so we don't show the toast again
    sessionStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
  };

  const contextValue: TutorialContextType = {
    shouldShowTutorial,
    showTutorial,
    hideTutorial,
    markTutorialCompleted,
  };

  // Don't render tutorial during initial loading
  if (status === "loading") {
    return (
      <TutorialContext.Provider value={contextValue}>
        {children}
      </TutorialContext.Provider>
    );
  }

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {shouldShowTutorial && (
        <TutorialOverlay
          onComplete={markTutorialCompleted}
          onSkip={hideTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
}
