import { useEffect, useRef } from "react";

interface BuildInfo {
  timestamp: string;
  date: string;
}

export function useBuildInfoPolling() {
  const initialTimestampRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const checkForUpdates = async (): Promise<boolean> => {
    const base = import.meta.env.BASE_URL;
    const getBuildInfoUrl = () => `${base}build-info.json?t=${Date.now()}`;

    try {
      const response = await fetch(getBuildInfoUrl(), { cache: "no-store" });
      const info: BuildInfo = await response.json();
      
      // If we have an initial timestamp and it's different, reload
      if (
        initialTimestampRef.current &&
        info.timestamp !== initialTimestampRef.current
      ) {
        window.location.reload();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const getBuildInfoUrl = () => `${base}build-info.json?t=${Date.now()}`;

    // Fetch initial build info
    fetch(getBuildInfoUrl())
      .then((r) => r.json())
      .then((info: BuildInfo) => {
        initialTimestampRef.current = info.timestamp;
      })
      .catch(() => {
        // In development or if file doesn't exist, don't poll
        return;
      });

    // Poll every 30 seconds
    pollingIntervalRef.current = window.setInterval(() => {
      checkForUpdates();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return { checkForUpdates };
}

