import type { SidebarItem } from "@/components/layout/Sidebar";

export const ownerSidebarItems: SidebarItem[] = [
  { label: "Control Center", href: "/owner/dashboard" },
  { label: "Squad", href: "/owner/clients" },
  { label: "Revenue", href: "/owner/payments", disabled: true, badge: "Soon" },
  { label: "Sessions", href: "/owner/bookings", disabled: true, badge: "Soon" },
  {
    label: "Progress",
    href: "/owner/measurements",
    disabled: true,
    badge: "Soon",
  },
  { label: "Analytics", href: "/owner/reports", disabled: true, badge: "Soon" },
];
