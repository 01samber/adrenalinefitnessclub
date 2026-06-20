import type { SidebarItem } from "@/components/layout/Sidebar";

export const clientSidebarItems: SidebarItem[] = [
  { label: "Performance Hub", href: "/client/dashboard" },
  {
    label: "Payments",
    href: "/client/payments",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Sessions",
    href: "/client/bookings",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Progress",
    href: "/client/progress",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Alerts",
    href: "/client/notifications",
    disabled: true,
    badge: "Soon",
  },
];
