import { useEffect, useRef } from "react";

interface BuildInfo {
  timestamp: string;
  date: string;
}

export function useBuildInfoPolling() {
  const initialTimestampRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const buildInfoUrl = `${base}build-info.json`;

    // Fetch initial build info
    fetch(buildInfoUrl)
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
      fetch(buildInfoUrl, { cache: "no-store" })
        .then((r) => r.json())
        .then((info: BuildInfo) => {
          // If we have an initial timestamp and it's different, reload
          if (
            initialTimestampRef.current &&
            info.timestamp !== initialTimestampRef.current
          ) {
            window.location.reload();
          }
        })
        .catch(() => {
          // Silently fail - might be in development or network issue
        });
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
}

