"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { GrowthTrendBadge, LiveStatusBadge, StatCard } from "@/components/ui/StatCard";
import { ApiClientError, apiGet } from "@/lib/api-client";
import type { OwnerDashboardData } from "@/types/api";

const ownerSidebarItems = [
  { label: "Dashboard", href: "/owner/dashboard", active: true },
  { label: "Clients", href: "/owner/clients", disabled: true, badge: "Soon" },
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function OwnerDashboardContent() {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setError("");

      try {
        const result = await apiGet<OwnerDashboardData>("/api/owner/dashboard");
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError("You do not have permission to view this dashboard.");
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load dashboard data.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <AppShell
      title="Owner Dashboard"
      subtitle="Performance overview for Adrenaline Fitness Center"
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Owner Portal"
    >
      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <div className="space-y-6">
          <Card
            variant="elevated"
            accent="green"
            title="Live Backend Connection"
            subtitle="Neon PostgreSQL synced · operational command center online"
            headerAction={<LiveStatusBadge />}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-afc-soft-grey">
                Real-time KPIs from your production database layer.
              </p>
              <code className="inline-flex w-fit items-center rounded-lg border border-afc-border-grey bg-afc-black/50 px-3 py-1.5 font-mono text-xs text-afc-green">
                GET /api/owner/dashboard
              </code>
            </div>
          </Card>

          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-afc-soft-grey">
              Operations pulse
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <StatCard
              label="Total Clients"
              value={data?.totalClients ?? 0}
              accent="neutral"
              loading={loading}
            />
            <StatCard
              label="Active Clients"
              value={data?.activeClients ?? 0}
              accent="success"
              loading={loading}
            />
            <StatCard
              label="Frozen Clients"
              value={data?.frozenClients ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Revenue This Month"
              value={
                loading ? "—" : formatCurrency(data?.totalRevenueThisMonth ?? 0)
              }
              accent="success"
              loading={loading}
            />
            <StatCard
              label="Unpaid Payments"
              value={data?.unpaidPaymentsCount ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Overdue Payments"
              value={data?.overduePaymentsCount ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Upcoming Bookings"
              value={data?.upcomingBookingsCount ?? 0}
              accent="accent"
              loading={loading}
            />
            <StatCard
              label="Completed Sessions"
              value={data?.completedBookingsThisMonth ?? 0}
              hint="This month"
              accent="neutral"
              loading={loading}
            />
            <StatCard
              label="New Clients This Month"
              value={data?.newClientsThisMonth ?? 0}
              accent="success"
              loading={loading}
            />
          </div>
          </div>

          {!loading && data ? (
            <Card
              variant="glass"
              accent="green"
              hover
              title="Membership momentum"
              subtitle="Client growth trend based on new sign-ups this month"
              headerAction={<GrowthTrendBadge trend={data.clientGrowthTrend} />}
            />
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

export default function OwnerDashboardPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <OwnerDashboardContent />
    </AuthGuard>
  );
}
