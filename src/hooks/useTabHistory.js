import { useRef, useCallback } from "react";

/**
 * Tracks the last visited scroll position & URL for each bottom-tab page key.
 * Call `save(pageKey, path, scrollY)` when leaving a tab.
 * Call `restore(pageKey)` → returns { path, scrollY } when returning to a tab.
 */
export default function useTabHistory() {
  const history = useRef({});

  const save = useCallback((pageKey, path, scrollY = 0) => {
    history.current[pageKey] = { path, scrollY };
  }, []);

  const restore = useCallback((pageKey) => {
    return history.current[pageKey] || null;
  }, []);

  return { save, restore };
}