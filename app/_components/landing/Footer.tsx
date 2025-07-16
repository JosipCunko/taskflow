"use client";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";

export default function Footer() {
  const isOnline = useOnlineStatus();

  return (
    <footer className="py-6 bg-background-700 border-t border-primary-500/10">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-text-low mb-2 sm:mb-0">
          <span
            className={
              isOnline ? "text-primary-400" : "text-red-500 animate-pulse"
            }
          >
            STATUS:
          </span>{" "}
          {isOnline ? "OPERATIONAL" : "CONNECTION_ERROR"} | &copy;{" "}
          {new Date().getFullYear()} TaskFlow
        </div>
        <div className="text-xs text-text-gray flex items-center">
          <span>{isOnline ? "SECURE_CONNECTION" : "OFFLINE"}</span>
          <div
            className={`w-2 h-2 rounded-full ml-2 ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
        </div>
      </div>
    </footer>
  );
}
