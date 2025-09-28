"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { startOfDay, isSameDay } from "date-fns";
import toast from "react-hot-toast";
import TutorialOverlay from "./TutorialOverlay";

interface TutorialContextType {
  shouldShowTutorial: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
  markTutorialCompleted: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

interface TutorialProviderProps {
  children: React.ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const { data: session, status } = useSession();
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user should see tutorial on first login of the day
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "authenticated" && session?.user?.id) {
      checkFirstLoginToday();
    } else {
      setIsChecking(false);
    }
  }, [session, status]);

  const checkFirstLoginToday = async () => {
    try {
      // Check if tutorial was already shown today
      const tutorialKey = `tutorial_shown_${session?.user?.id}`;
      const lastShown = localStorage.getItem(tutorialKey);
      const today = startOfDay(new Date());
      
      if (lastShown) {
        const lastShownDate = startOfDay(new Date(lastShown));
        if (isSameDay(today, lastShownDate)) {
          // Tutorial already shown today
          setIsChecking(false);
          return;
        }
      }

      // Check if user has completed tutorial before
      const completedKey = `tutorial_completed_${session?.user?.id}`;
      const hasCompleted = localStorage.getItem(completedKey);
      
      // Only show tutorial for new users or if they manually trigger it
      if (hasCompleted) {
        setIsChecking(false);
        return;
      }

      // Check if this is user's first login today by fetching user data
      const response = await fetch("/api/user/tutorial-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isFirstLoginToday) {
          setShouldShowTutorial(true);
          // Mark tutorial as shown today
          localStorage.setItem(tutorialKey, new Date().toISOString());
        }
      }
    } catch (error) {
      console.error("Error checking tutorial status:", error);
    } finally {
      setIsChecking(false);
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
    // Mark tutorial as completed in localStorage
    if (session?.user?.id) {
      const tutorialKey = `tutorial_completed_${session.user.id}`;
      localStorage.setItem(tutorialKey, new Date().toISOString());
    }
    // Show completion message
    toast.success("Tutorial completed! Welcome to TaskFlow!", {
      duration: 4000,
      position: "bottom-center",
    });
  };

  const contextValue: TutorialContextType = {
    shouldShowTutorial,
    showTutorial,
    hideTutorial,
    markTutorialCompleted,
  };

  // Don't render tutorial during initial loading
  if (isChecking || status === "loading") {
    return <TutorialContext.Provider value={contextValue}>{children}</TutorialContext.Provider>;
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