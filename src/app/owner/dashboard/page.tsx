"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardAmbient } from "@/components/owner/DashboardAmbient";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { HeroBand } from "@/components/ui/HeroBand";
import { GrowthTrendBadge, StatCard } from "@/components/ui/StatCard";
import { HeroControlIcon } from "@/components/ui/StatTileIcon";
import { ApiClientError, apiGet } from "@/lib/api-client";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import { statMeterPercent } from "@/lib/stat-meter";
import { clientGrowthTrendDetail } from "@/lib/hero-context";
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

  const total = data?.totalClients ?? 0;
  const active = data?.activeClients ?? 0;
  const frozen = data?.frozenClients ?? 0;
  const unpaid = data?.unpaidPaymentsCount ?? 0;
  const overdue = data?.overduePaymentsCount ?? 0;

  return (
    <AppShell
      title="Control Center"
      subtitle="Club operations · live pulse"
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <div className="afc-dashboard-page afc-page-stack relative space-y-6">
          <DashboardAmbient />

          <div className="relative z-[1] space-y-6">
          <HeroBand
            kicker="Operations"
            kickerIcon={<HeroControlIcon />}
            headline="Club-wide pulse — squad health, revenue, and session volume in one view."
            detail={
              !loading && data
                ? clientGrowthTrendDetail(data.clientGrowthTrend)
                : "Connecting to live club data…"
            }
            live
            liveLabel="LIVE CLUB DATA"
            footer={
              <code className="afc-hero-band__api-chip">
                GET /api/owner/dashboard
              </code>
            }
          />

          <section>
            <h2 className="afc-section-label mb-4">Performance pulse</h2>
            <div className="afc-stat-grid">
              <StatCard
                label="Squad size"
                value={total}
                accent="neutral"
                loading={loading}
                staggerIndex={0}
              />
              <StatCard
                label="Active athletes"
                value={active}
                accent="success"
                loading={loading}
                meterPercent={statMeterPercent(active, total)}
                staggerIndex={1}
              />
              <StatCard
                label="Frozen roster"
                value={frozen}
                accent={frozen > 0 ? "danger" : "neutral"}
                loading={loading}
                meterPercent={statMeterPercent(frozen, total)}
                staggerIndex={2}
              />
              <StatCard
                label="Monthly score"
                value={loading ? "—" : formatCurrency(data?.totalRevenueThisMonth ?? 0)}
                accent="accent"
                loading={loading}
                animateNumeric={false}
                staggerIndex={3}
              />
              <StatCard
                label="Payment alerts"
                value={unpaid}
                accent={unpaid > 0 ? "danger" : "neutral"}
                loading={loading}
                meterPercent={statMeterPercent(unpaid, total)}
                staggerIndex={4}
              />
              <StatCard
                label="Overdue"
                value={overdue}
                accent={overdue > 0 ? "danger" : "neutral"}
                loading={loading}
                meterPercent={statMeterPercent(overdue, total)}
                staggerIndex={5}
              />
              <StatCard
                label="Upcoming sessions"
                value={data?.upcomingBookingsCount ?? 0}
                accent="accent"
                loading={loading}
                staggerIndex={6}
              />
              <StatCard
                label="Completed sessions"
                value={data?.completedBookingsThisMonth ?? 0}
                hint="This month"
                accent="neutral"
                loading={loading}
                staggerIndex={7}
              />
              <StatCard
                label="New sign-ups"
                value={data?.newClientsThisMonth ?? 0}
                accent="success"
                loading={loading}
                staggerIndex={8}
              />
            </div>
          </section>

          {!loading && data ? (
            <Card
              variant="glass"
              accent="neutral"
              hover
              title="Squad momentum"
              subtitle="Athlete growth trend based on new sign-ups this month"
              headerAction={<GrowthTrendBadge trend={data.clientGrowthTrend} />}
              className="afc-animate-enter"
            />
          ) : null}
          </div>
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
