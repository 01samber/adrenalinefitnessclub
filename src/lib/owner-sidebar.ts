import type { SidebarItem } from "@/components/layout/Sidebar";

export const ownerSidebarItems: SidebarItem[] = [
  { label: "Control Center", href: "/owner/dashboard", icon: "dashboard" },
  { label: "Squad", href: "/owner/clients", icon: "squad" },
  {
    label: "Revenue",
    href: "/owner/payments",
    icon: "revenue",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Sessions",
    href: "/owner/bookings",
    icon: "sessions",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Progress",
    href: "/owner/measurements",
    icon: "progress",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Analytics",
    href: "/owner/reports",
    icon: "analytics",
    disabled: true,
    badge: "Soon",
  },
];
