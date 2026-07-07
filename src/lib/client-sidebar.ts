import type { SidebarItem } from "@/components/layout/Sidebar";

export const clientSidebarItems: SidebarItem[] = [
  { label: "Performance Hub", href: "/client/dashboard", icon: "performance" },
  {
    label: "Payments",
    href: "/client/payments",
    icon: "revenue",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Sessions",
    href: "/client/bookings",
    icon: "sessions",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Progress",
    href: "/client/progress",
    icon: "progress",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Alerts",
    href: "/client/notifications",
    icon: "alerts",
    disabled: true,
    badge: "Soon",
  },
];
