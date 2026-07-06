"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { NavIcon, NavLockIcon, type NavIconId } from "@/components/layout/NavIcon";
export interface SidebarItem {
  label: string;
  href: string;
  icon?: NavIconId;
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
        className={`afc-sidebar afc-scrollbar fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100%,var(--afc-sidebar-width))] flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Main navigation"
      >
        <div className="afc-sidebar-brand shrink-0 border-b border-afc-border-grey/70 p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-afc-gold-hot via-afc-gold to-afc-panel-2"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)",
                  }}
                />
                <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-afc-green-neon shadow-[0_0_10px_var(--afc-green-glow)]" />
                <span className="afc-display relative text-[10px] font-bold text-afc-black">
                  AFC
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold uppercase tracking-wide text-afc-white">
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-afc-border-grey/80 text-afc-soft-grey transition-colors hover:border-afc-gold/40 hover:bg-afc-gold/10 hover:text-afc-white lg:hidden"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="afc-sidebar-nav min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-afc-muted/70">
            Tactical Menu
          </p>
          <ul className="space-y-1.5">
            {items.map((item, index) => {
              const isActive = item.active ?? pathname === item.href;
              const iconId = item.icon ?? "dashboard";

              if (item.disabled) {
                return (
                  <li key={item.label}>
                    <div
                      className="afc-nav-item afc-nav-item--disabled afc-nav-enter"
                      style={{ animationDelay: `${90 + index * 45}ms` }}
                      title="Coming soon"
                    >
                      <span className="afc-nav-item__main">
                        <NavIcon id={iconId} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="afc-nav-item__locked-meta">
                        <NavLockIcon />
                        {item.badge ? (
                          <Badge variant="outline" className="afc-nav-soon-badge">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`afc-nav-item afc-nav-enter ${isActive ? "afc-nav-item--active" : ""}`}
                    style={{ animationDelay: `${90 + index * 45}ms` }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="afc-nav-item__main">
                      <NavIcon id={iconId} active={isActive} />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="afc-sidebar-footer shrink-0 border-t border-afc-border-grey/70 p-4">
          <div className="afc-sidebar-status">
            <div className="afc-sidebar-status__dot-wrap" aria-hidden>
              <span className="afc-status-pulse afc-status-pulse--gold" />
            </div>
            <div className="afc-sidebar-status__copy">
              <p className="afc-sidebar-status__label">Live sync</p>
              <p className="afc-sidebar-status__detail">Iron Lanes · connected</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
