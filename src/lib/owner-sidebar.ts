import type { SidebarItem } from "@/components/layout/Sidebar";

export const ownerSidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/owner/dashboard" },
  { label: "Clients", href: "/owner/clients" },
  { label: "Payments", href: "/owner/payments", disabled: true, badge: "Soon" },
  { label: "Bookings", href: "/owner/bookings", disabled: true, badge: "Soon" },
  {
    label: "Measurements",
    href: "/owner/measurements",
    disabled: true,
    badge: "Soon",
  },
  { label: "Reports", href: "/owner/reports", disabled: true, badge: "Soon" },
];
