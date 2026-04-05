import { useState, useEffect, useRef } from "react";

/**
 * Pull-to-refresh hook for mobile.
 * Attach `containerRef` to the scrollable element.
 * `onRefresh` is an async function to call when triggered.
 */
export default function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchEnd = async () => {
      pulling.current = false;
    };

    const onTouchMove = async (e) => {
      if (!pulling.current || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 70 && el.scrollTop === 0) {
        pulling.current = false;
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, refreshing]);

  return { containerRef, refreshing };
}