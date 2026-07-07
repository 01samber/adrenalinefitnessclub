"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export function useCountUp(
  target: number,
  options: { durationMs?: number; enabled?: boolean } = {},
) {
  const { durationMs = 900, enabled = true } = options;
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);

  const shouldAnimate = enabled && !reducedMotion;

  useEffect(() => {
    if (!shouldAnimate) return;

    let frameRef: number | null = null;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        frameRef = requestAnimationFrame(tick);
      }
    }

    frameRef = requestAnimationFrame(tick);

    return () => {
      if (frameRef != null) {
        cancelAnimationFrame(frameRef);
      }
    };
  }, [target, durationMs, shouldAnimate]);

  if (!shouldAnimate) {
    return target;
  }

  return display;
}
