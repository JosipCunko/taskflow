"use client";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  useEffect(() => {
    if (isOnline) {
      router.push("/webapp");
    }
  }, [isOnline]);

  return (
    <div className="h-screen w-full grid place-items-center bg-background-700">
      <div className="text-center max-w-md px-4 flex flex-col gap-4 items-center">
        <div className="flex justify-center ">
          <div className="p-6 bg-background-800 rounded-full border border-primary-500">
            <WifiOff className="size-24 text-primary-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary-500 ">
          You&apos;re Offline
        </h1>
        <p className="text-text-low ">
          It looks like you&apos;ve lost your internet connection. Some features
          may be limited until you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
