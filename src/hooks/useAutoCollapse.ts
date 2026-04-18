import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Auto-collapse behavior for floating buttons.
 * - Starts expanded for `initialDelay` ms so user notices it.
 * - Collapses after `delay` ms of inactivity.
 * - Re-expands on hover (desktop) or touch (mobile).
 */
export function useAutoCollapse(delay = 4000, initialDelay = 4000) {
  const [expanded, setExpanded] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCollapse = useCallback(
    (ms: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setExpanded(false), ms);
    },
    []
  );

  const expand = useCallback(() => {
    setExpanded(true);
    scheduleCollapse(delay);
  }, [delay, scheduleCollapse]);

  const collapseNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExpanded(false);
  }, []);

  useEffect(() => {
    scheduleCollapse(initialDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialDelay, scheduleCollapse]);

  return { expanded, expand, collapseNow };
}
