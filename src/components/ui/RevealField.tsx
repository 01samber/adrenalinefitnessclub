"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealFieldProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

export function RevealField({ show, children, className = "" }: RevealFieldProps) {
  const wasShown = useRef(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show && !wasShown.current) {
      wasShown.current = true;
      setAnimate(true);
    }
  }, [show]);

  return (
    <div
      className={[className, animate ? "afc-preview-reveal" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
