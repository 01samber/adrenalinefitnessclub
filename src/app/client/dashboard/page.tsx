"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BodyCompositionCard } from "@/components/client/BodyCompositionCard";
import { BookingPreviewCard } from "@/components/client/BookingPreviewCard";
import { ClientDashboardSkeleton } from "@/components/client/ClientDashboardSkeleton";
import { ClientHeroCard } from "@/components/client/ClientHeroCard";
import { CoachNotesCard } from "@/components/client/CoachNotesCard";
import { NotificationsCard } from "@/components/client/NotificationsCard";
import { PaymentSummaryCard } from "@/components/client/PaymentSummaryCard";
import { ProfileGoalCard } from "@/components/client/ProfileGoalCard";
import { SubscriptionSummaryCard } from "@/components/client/SubscriptionSummaryCard";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { ApiClientError, apiGet } from "@/lib/api-client";
import { clientSidebarItems } from "@/lib/client-sidebar";
import {
  FROZEN_LOGIN_MESSAGE,
  isFrozenAccessMessage,
} from "@/lib/login-errors";
import {
  isPaymentAttention,
} from "@/lib/client-utils";
import type { ClientMeData } from "@/types/api";

function ClientDashboardContent() {
  const [data, setData] = useState<ClientMeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setError("");

      try {
        const result = await apiGet<ClientMeData>("/api/client/me");
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError(
              isFrozenAccessMessage(err.message)
                ? FROZEN_LOGIN_MESSAGE
                : "You do not have permission to view this page.",
            );
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load your profile.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const subscription = data?.activeSubscription ?? null;
  const latestPayment = data?.latestPayment ?? null;
  const latestMeasurement = data?.latestBodyMeasurement ?? null;
  const planName =
    subscription?.plan.name ?? data?.assignedPlan?.name ?? "—";

  return (
    <AppShell
      title="Player Performance Hub"
      subtitle="Coach-connected training profile and progress at a glance"
      sidebarItems={clientSidebarItems}
      brandSubtitle="Athlete Portal"
    >
      {loading ? (
        <ClientDashboardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : data ? (
        <div className="space-y-6 sm:space-y-8">
          <ClientHeroCard data={data} />

          <div className="afc-glass inline-flex w-fit items-center gap-2 rounded-full border border-afc-border-grey/80 px-3 py-1.5">
            <span className="afc-status-pulse shrink-0" aria-hidden />
            <span className="text-xs text-afc-soft-grey">
              Live data ·{" "}
              <code className="font-mono text-afc-green">GET /api/client/me</code>
            </span>
          </div>

          <div>
            <p className="afc-section-label mb-4">Performance snapshot</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Plan" value={planName} accent="accent" />
              <StatCard
                label="Membership"
                value={subscription?.status ?? "None"}
                accent={
                  subscription?.status === "ACTIVE" ? "success" : "neutral"
                }
              />
              <StatCard
                label="Payment"
                value={latestPayment?.status ?? "None"}
                accent={
                  latestPayment?.status === "PAID"
                    ? "success"
                    : isPaymentAttention(latestPayment?.status)
                      ? "danger"
                      : "neutral"
                }
              />
              <StatCard
                label="Weight"
                value={
                  latestMeasurement?.weightKg
                    ? `${latestMeasurement.weightKg} kg`
                    : "—"
                }
                accent="neutral"
              />
              <StatCard
                label="Body index"
                value={latestMeasurement?.bmi ?? "—"}
                accent="neutral"
              />
              <StatCard
                label="Sessions"
                value={data.upcomingBookings.length}
                accent="success"
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <ProfileGoalCard data={data} />
            <SubscriptionSummaryCard
              subscription={subscription}
              assignedPlanName={data.assignedPlan?.name}
            />
          </div>

          <PaymentSummaryCard
            latestPayment={latestPayment}
            recentPayments={data.recentPayments}
          />

          <BodyCompositionCard
            latest={latestMeasurement}
            history={data.recentBodyMeasurements}
            coachAssessment={data.coachAssessment}
          />

          <BookingPreviewCard
            upcomingBookings={data.upcomingBookings}
            recentBookings={data.recentBookings}
          />

          <CoachNotesCard
            progressNotes={data.progressNotes}
            coachAssessment={data.coachAssessment}
            profileCoachNotes={data.profile?.coachNotes ?? null}
          />

          <NotificationsCard
            notifications={data.notifications}
            unreadCount={data.unreadNotificationsCount}
          />
        </div>
      ) : null}
    </AppShell>
  );
}

export default function ClientDashboardPage() {
  return (
    <AuthGuard requiredRole="CLIENT">
      <ClientDashboardContent />
    </AuthGuard>
  );
}
