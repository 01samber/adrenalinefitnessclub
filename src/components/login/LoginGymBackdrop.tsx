"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LoginGymBackdrop({ variant = "hero" }: { variant?: "hero" | "mobile" }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    function handlePointerMove(event: PointerEvent) {
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      root.style.setProperty("--parallax-x", x.toFixed(4));
      root.style.setProperty("--parallax-y", y.toFixed(4));
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const stroke = "currentColor";
  const className =
    variant === "hero"
      ? "afc-login-gym afc-login-gym--hero"
      : "afc-login-gym afc-login-gym--mobile";

  return (
    <div ref={rootRef} className={className} aria-hidden>
      <svg
        className="afc-gym-art afc-gym-art--barbell"
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="48" y1="40" x2="272" y2="40" stroke={stroke} strokeWidth="2.5" />
        <rect x="12" y="22" width="22" height="36" rx="3" stroke={stroke} strokeWidth="2" />
        <rect x="34" y="28" width="14" height="24" rx="2" stroke={stroke} strokeWidth="1.5" />
        <rect x="286" y="22" width="22" height="36" rx="3" stroke={stroke} strokeWidth="2" />
        <rect x="272" y="28" width="14" height="24" rx="2" stroke={stroke} strokeWidth="1.5" />
      </svg>

      <svg
        className="afc-gym-art afc-gym-art--kettlebell"
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M42 28 C42 14 54 6 60 6 C66 6 78 14 78 28"
          stroke={stroke}
          strokeWidth="2"
        />
        <path
          d="M36 28 H84 V38 C84 38 92 44 92 56 V120 C92 138 76 152 60 152 C44 152 28 138 28 120 V56 C28 44 36 38 36 38 Z"
          stroke={stroke}
          strokeWidth="2"
        />
        <line x1="60" y1="68" x2="60" y2="108" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
      </svg>

      <svg
        className="afc-gym-art afc-gym-art--stopwatch"
        viewBox="0 0 140 168"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="58" y="4" width="24" height="14" rx="3" stroke={stroke} strokeWidth="2" />
        <circle cx="70" cy="96" r="58" stroke={stroke} strokeWidth="2" />
        <circle cx="70" cy="96" r="3" fill={stroke} />
        <g className="afc-gym-art__stopwatch-hand">
          <line x1="70" y1="96" x2="70" y2="52" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
        <line x1="70" y1="38" x2="70" y2="48" stroke={stroke} strokeWidth="2" />
      </svg>

      <svg
        className="afc-gym-art afc-gym-art--heartrate"
        viewBox="0 0 360 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="afc-gym-art__heartrate-path"
          d="M0 58 L40 58 L52 28 L68 88 L84 48 L100 58 L140 58 L152 38 L168 72 L184 58 L360 58"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
