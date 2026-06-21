"use client";

import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Badge } from "@/components/ui/Badge";

interface TopbarProps {
  title: string;
  subtitle?: string;
  mobileTitle?: string;
  onMenuOpen: () => void;
}

function UserChip({ compact = false }: { compact?: boolean }) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const name = session.user.name ?? session.user.email ?? "User";
  const roleVariant =
    session.user.role === "OWNER" ? "default" : ("success" as const);

  return (
    <div
      className={`afc-glass flex min-w-0 items-center gap-2.5 rounded-full border border-afc-border-grey/80 ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-afc-panel-grey to-afc-black text-xs font-bold text-afc-white ring-2 ring-afc-red/25">
        {name.charAt(0).toUpperCase()}
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

export function Topbar({ title, subtitle, mobileTitle, onMenuOpen }: TopbarProps) {
  const displayMobileTitle = mobileTitle ?? title;

  return (
    <header className="afc-topbar-scoreboard afc-topbar afc-glass sticky top-0 z-30 backdrop-blur-md">
      <div className="relative px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-afc-red/50 to-transparent"
          aria-hidden
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onMenuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-afc-border-grey/80 text-afc-white transition-colors hover:border-afc-red/45 hover:bg-afc-red/10 sm:h-11 sm:w-11 lg:hidden"
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current opacity-80" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <div className="afc-topbar__brand hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-afc-red to-afc-red-dark text-[9px] font-black text-afc-white min-[390px]:flex sm:h-9 sm:w-9 sm:rounded-xl sm:text-[10px] lg:hidden">
              AFC
            </div>

            <div className="afc-topbar__titles min-w-0 flex-1">
              <h1 className="afc-topbar__title sm:hidden">{displayMobileTitle}</h1>
              <h1 className="afc-topbar__title hidden sm:block">{title}</h1>
              {subtitle ? (
                <p className="afc-topbar__subtitle mt-0.5 hidden min-[430px]:block">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="afc-topbar__actions flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
            <div className="sm:hidden">
              <UserChip compact />
            </div>
            <div className="hidden sm:block">
              <UserChip />
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
