"use client";

import { ThemeProvider } from "@/app/_context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
    </ThemeProvider>
  );
}
