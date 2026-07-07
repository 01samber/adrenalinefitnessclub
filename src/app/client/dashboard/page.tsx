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
import { HeroBand } from "@/components/ui/HeroBand";
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
  const paymentNeedsAttention = isPaymentAttention(latestPayment?.status);
  const upcomingCount = data?.upcomingBookings.length ?? 0;

  const clientHeroDetail = (() => {
    if (!data) return undefined;
    if (data.coachAssessment) {
      return `Coach assessment on file — see notes below for guidance.`;
    }
    const latestNote = data.progressNotes[0];
    if (latestNote) {
      return `Latest coach note (${latestNote.noteType.toLowerCase().replace(/_/g, " ")}): ${latestNote.content.slice(0, 96)}${latestNote.content.length > 96 ? "…" : ""}`;
    }
    const latestAlert = data.notifications[0];
    if (latestAlert) {
      return `Latest alert: ${latestAlert.title}`;
    }
    return "Performance counts and session details live in the snapshot grid below.";
  })();

  return (
    <AppShell
      title="Player Performance Hub"
      subtitle="Coach-connected training profile and progress"
      sidebarItems={clientSidebarItems}
      brandSubtitle="Athlete Portal"
    >
      {loading ? (
        <ClientDashboardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : data ? (
        <div className="afc-page-stack space-y-6 sm:space-y-8">
          <HeroBand
            kicker="Athlete portal"
            headline="Your coach-connected training profile — membership, payments, and progress in one place."
            detail={clientHeroDetail}
            live
            liveLabel="LIVE DATA"
            footer={
              <code className="afc-hero-band__api-chip">GET /api/client/me</code>
            }
          />

          <ClientHeroCard data={data} />

          <section>
            <h2 className="afc-section-label mb-4">Performance snapshot</h2>
            <div className="afc-stat-grid">
              <StatCard
                label="Plan"
                value={planName}
                accent="accent"
                animateNumeric={false}
                staggerIndex={0}
              />
              <StatCard
                label="Membership"
                value={subscription?.status ?? "None"}
                accent={
                  subscription?.status === "ACTIVE" ? "success" : "neutral"
                }
                animateNumeric={false}
                staggerIndex={1}
              />
              <StatCard
                label="Payment"
                value={latestPayment?.status ?? "None"}
                accent={
                  latestPayment?.status === "PAID"
                    ? "success"
                    : paymentNeedsAttention
                      ? "danger"
                      : "neutral"
                }
                animateNumeric={false}
                staggerIndex={2}
              />
              <StatCard
                label="Weight"
                value={
                  latestMeasurement?.weightKg
                    ? `${latestMeasurement.weightKg} kg`
                    : "—"
                }
                accent="neutral"
                animateNumeric={false}
                staggerIndex={3}
              />
              <StatCard
                label="Body index"
                value={latestMeasurement?.bmi ?? "—"}
                accent="neutral"
                animateNumeric={false}
                staggerIndex={4}
              />
              <StatCard
                label="Sessions"
                value={upcomingCount}
                accent="success"
                staggerIndex={5}
              />
            </div>
          </section>

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
