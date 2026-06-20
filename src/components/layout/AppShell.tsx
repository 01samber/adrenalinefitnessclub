"use client";

import { useEffect, useState } from "react";
import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  sidebarItems: SidebarItem[];
  brandSubtitle: string;
  children: React.ReactNode;
}

export function AppShell({
  title,
  subtitle,
  sidebarItems,
  brandSubtitle,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="afc-shell flex min-h-screen">
      <Sidebar
        items={sidebarItems}
        brandSubtitle={brandSubtitle}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
