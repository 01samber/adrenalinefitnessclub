"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ShellUserBlock } from "@/components/layout/ShellUserBlock";

interface TopbarProps {
  title: string;
  subtitle?: string;
  mobileTitle?: string;
  onMenuOpen: () => void;
}

export function Topbar({ title, subtitle, mobileTitle, onMenuOpen }: TopbarProps) {
  const displayMobileTitle = mobileTitle ?? title;

  return (
    <header className="afc-topbar-scoreboard afc-topbar afc-glass sticky top-0 z-30 backdrop-blur-md">
      <div className="relative px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-afc-gold/45 to-transparent"
          aria-hidden
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onMenuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-afc-border-grey/80 text-afc-white transition-all hover:border-afc-gold/45 hover:bg-afc-gold/10 hover:shadow-[0_0_16px_var(--afc-gold-glow)] sm:h-11 sm:w-11 lg:hidden"
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current opacity-80" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <div className="afc-topbar__brand hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-afc-gold to-afc-gold-dark text-[9px] font-bold text-afc-black min-[390px]:flex sm:h-9 sm:w-9 sm:text-[10px] lg:hidden">
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
              <ShellUserBlock variant="topbar-compact" />
            </div>
            <div className="hidden sm:block">
              <ShellUserBlock variant="topbar" />
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
