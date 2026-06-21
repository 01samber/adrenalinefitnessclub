"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  compactOnMobile?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  className = "",
  compactOnMobile = false,
}: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`${compactOnMobile ? "afc-logout-btn--compact" : ""} ${className}`.trim()}
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Sign out"
    >
      <span className={compactOnMobile ? "afc-logout-btn__full" : undefined}>
        Sign out
      </span>
      {compactOnMobile ? (
        <span className="afc-logout-btn__short" aria-hidden>
          Out
        </span>
      ) : null}
    </Button>
  );
}
