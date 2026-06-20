"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScoreboardHeader } from "@/components/ui/ScoreboardHeader";
import { GrowthTrendBadge, LiveStatusBadge, StatCard } from "@/components/ui/StatCard";
import { ApiClientError, apiGet } from "@/lib/api-client";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import type { OwnerDashboardData } from "@/types/api";

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
      title="Club Control Center"
      subtitle="Live performance data from Adrenaline Fitness Center"
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <div className="space-y-6">
          <ScoreboardHeader
            kicker="AFC Club OS"
            title="Club Control Center"
            subtitle="Membership, payments, and squad performance at a glance."
            live
            badge={<LiveStatusBadge label="LIVE CLUB DATA" />}
          />

          <Card
            variant="elevated"
            accent="green"
            title="Live backend connection"
            subtitle="Neon PostgreSQL synced · command center online"
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
            <h2 className="afc-section-label mb-4">Performance pulse</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <StatCard
              label="Squad size"
              value={data?.totalClients ?? 0}
              accent="neutral"
              loading={loading}
            />
            <StatCard
              label="Active athletes"
              value={data?.activeClients ?? 0}
              accent="success"
              loading={loading}
            />
            <StatCard
              label="Frozen roster"
              value={data?.frozenClients ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Monthly score"
              value={
                loading ? "—" : formatCurrency(data?.totalRevenueThisMonth ?? 0)
              }
              accent="success"
              loading={loading}
            />
            <StatCard
              label="Payment alerts"
              value={data?.unpaidPaymentsCount ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Overdue"
              value={data?.overduePaymentsCount ?? 0}
              accent="danger"
              loading={loading}
            />
            <StatCard
              label="Upcoming sessions"
              value={data?.upcomingBookingsCount ?? 0}
              accent="accent"
              loading={loading}
            />
            <StatCard
              label="Completed sessions"
              value={data?.completedBookingsThisMonth ?? 0}
              hint="This month"
              accent="neutral"
              loading={loading}
            />
            <StatCard
              label="New sign-ups"
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
              title="Squad momentum"
              subtitle="Athlete growth trend based on new sign-ups this month"
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
