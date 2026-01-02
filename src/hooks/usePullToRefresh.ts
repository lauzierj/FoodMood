import { useEffect, useRef } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number; // Distance in pixels to trigger refresh
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const isRefreshing = useRef(false);
  const pullDistance = useRef(0);
  const startScrollY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the page
      startScrollY.current = window.scrollY;
      if (startScrollY.current === 0) {
        touchStartY.current = e.touches[0].clientY;
        touchCurrentY.current = e.touches[0].clientY;
        pullDistance.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      
      // Check if we're still at the top
      if (window.scrollY > startScrollY.current) {
        touchStartY.current = null;
        touchCurrentY.current = null;
        pullDistance.current = 0;
        return;
      }

      touchCurrentY.current = e.touches[0].clientY;
      const deltaY = touchCurrentY.current - touchStartY.current;

      // Only allow pull down (positive deltaY) and prevent scrolling up
      if (deltaY > 0 && window.scrollY === 0) {
        pullDistance.current = deltaY;
        
        // Prevent default scrolling behavior when pulling down
        if (deltaY > 10) {
          e.preventDefault();
        }
      } else if (deltaY <= 0) {
        // User is scrolling up, cancel pull-to-refresh
        touchStartY.current = null;
        touchCurrentY.current = null;
        pullDistance.current = 0;
      }
    };

    const handleTouchEnd = async () => {
      if (touchStartY.current === null) return;

      if (pullDistance.current >= threshold && !isRefreshing.current) {
        isRefreshing.current = true;
        try {
          await onRefresh();
        } catch (error) {
          console.error("Pull-to-refresh error:", error);
        } finally {
          // Reset after a short delay
          setTimeout(() => {
            isRefreshing.current = false;
          }, 500);
        }
      }

      touchStartY.current = null;
      touchCurrentY.current = null;
      pullDistance.current = 0;
      startScrollY.current = 0;
    };

    // Add touch event listeners with passive: false for touchmove to allow preventDefault
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, onRefresh, threshold]);
}

