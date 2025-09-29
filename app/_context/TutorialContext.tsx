"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isToday } from "date-fns";
import TutorialOverlay from "../_components/TutorialOverlay";
import { customToast } from "@/app/_utils/toasts";

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

  const checkTutorialStatus = async () => {
    try {
      if (isToday(session?.user?.createdAt as Date)) {
        customToast(
          "Info",
          "Welcome to TaskFlow! Do you want to learn how to use it?",
          Infinity
        );
      }
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
