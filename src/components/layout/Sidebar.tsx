"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

export interface SidebarItem {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  brandSubtitle: string;
  open: boolean;
  onClose: () => void;
}

function NavRail({ active }: { active: boolean }) {
  return <span className={`afc-nav-rail ${active ? "" : ""}`} aria-hidden />;
}

export function Sidebar({ items, brandSubtitle, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`afc-sidebar afc-scrollbar fixed inset-y-0 left-0 z-50 flex w-[min(100%,var(--afc-sidebar-width))] flex-col transition-transform duration-300 ease-out lg:static lg:z-auto lg:min-w-[var(--afc-sidebar-width)] lg:max-w-[var(--afc-sidebar-width)] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Main navigation"
      >
        <div className="afc-sidebar-brand border-b border-afc-border-grey/70 p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-afc-red-hot via-afc-red to-afc-panel-2 opacity-95" style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }} />
                <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-afc-green-neon shadow-[0_0_10px_var(--afc-green-glow)]" />
                <span className="relative text-xs font-black tracking-tighter text-afc-white">
                  AFC
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-wide text-afc-white">
                  Adrenaline Fitness
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-afc-muted">
                  {brandSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-afc-border-grey/80 text-afc-soft-grey transition-colors hover:border-afc-red/40 hover:bg-afc-red/10 hover:text-afc-white lg:hidden"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-afc-muted/70">
            Tactical Menu
          </p>
          {items.map((item) => {
            const isActive = item.active ?? pathname === item.href;

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="afc-nav-item afc-nav-item--disabled"
                  title="Coming soon"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <NavRail active={false} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <Badge variant="outline" className="normal-case">
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`afc-nav-item ${isActive ? "afc-nav-item--active" : ""}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <NavRail active={isActive} />
                  <span className="truncate">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-afc-border-grey/70 p-4">
          <div className="afc-surface afc-glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-afc-white">
                AFC Club OS
              </p>
              <span className="afc-status-pulse" aria-label="Live connection" />
            </div>
            <p className="mt-2 text-xs text-afc-muted">Live backend · Matchday ready</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-afc-green-neon">
              Synced
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
