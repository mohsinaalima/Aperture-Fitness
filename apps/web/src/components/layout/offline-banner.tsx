"use client";

import React, { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useWorkoutStore } from "@/store/workout-store";

export const OfflineBanner: React.FC = () => {
  const isOffline = useWorkoutStore((state) => state.isOffline);
  const setOfflineStatus = useWorkoutStore((state) => state.setOfflineStatus);

  useEffect(() => {
    const handleOnline = () => setOfflineStatus(false);
    const handleOffline = () => {
      setOfflineStatus(true);
    };

    setOfflineStatus(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOfflineStatus]);

  if (!isOffline) return null;

  return (
    <aside aria-label="Connection Status" className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning)] text-[#0E1113] text-[12px] font-mono font-semibold py-1 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 mx-auto">
        <WifiOff className="h-3.5 w-3.5 stroke-[2]" />
        <span>
          OFFLINE — Workout changes are saved on this device until you reconnect.
        </span>
      </div>
    </aside>
  );
};
