"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/Badge";

interface ShellUserBlockProps {
  variant?: "topbar" | "topbar-compact" | "sidebar";
}

export function ShellUserBlock({ variant = "topbar" }: ShellUserBlockProps) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const name = session.user.name ?? session.user.email ?? "User";
  const roleVariant =
    session.user.role === "OWNER" ? "default" : ("success" as const);
  const initial = name.charAt(0).toUpperCase();

  if (variant === "sidebar") {
    return (
      <div className="afc-sidebar-user">
        <div className="afc-sidebar-user__avatar" aria-hidden>
          {initial}
        </div>
        <div className="afc-sidebar-user__meta min-w-0">
          <p className="afc-sidebar-user__name truncate">{name}</p>
          <Badge variant={roleVariant} className="afc-sidebar-user__role">
            {session.user.role}
          </Badge>
        </div>
      </div>
    );
  }

  const compact = variant === "topbar-compact";

  return (
    <div
      className={`afc-glass flex min-w-0 items-center gap-2.5 rounded-full border border-afc-border-grey/80 ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-afc-panel-2 to-afc-black text-xs font-bold text-afc-white ring-2 ring-afc-gold/30">
        {initial}
      </div>
      {!compact ? (
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-afc-white">{name}</p>
          <Badge variant={roleVariant} className="mt-1">
            {session.user.role}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
