"use client";

import { ThemeProvider } from "@/app/_context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { PWAProvider } from "../_context/PWAContext";
import { TutorialProvider } from "../_context/TutorialContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TutorialProvider>
        <PWAProvider>
          {children}
          <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        </PWAProvider>
      </TutorialProvider>
    </ThemeProvider>
  );
}
