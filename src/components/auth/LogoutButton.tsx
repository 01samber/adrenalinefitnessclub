"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  className = "",
}: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`afc-logout-btn shrink-0 ${className}`.trim()}
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Sign out"
    >
      Sign out
    </Button>
  );
}
