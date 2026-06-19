"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { LiveStatusBadge } from "@/components/ui/StatCard";
import { ApiClientError, apiGet } from "@/lib/api-client";
import type { ClientMeData } from "@/types/api";

const clientSidebarItems = [
  { label: "My Overview", href: "/client/dashboard", active: true },
  {
    label: "My Payments",
    href: "/client/payments",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "My Bookings",
    href: "/client/bookings",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "My Progress",
    href: "/client/progress",
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Notifications",
    href: "/client/notifications",
    disabled: true,
    badge: "Soon",
  },
];

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: unknown) {
  if (!value || typeof value !== "string") return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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
            setError("You do not have permission to view this page.");
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

  if (loading) {
    return (
      <AppShell
        title="My Overview"
        subtitle="Your fitness journey at a glance"
        sidebarItems={clientSidebarItems}
        brandSubtitle="Client Portal"
      >
        <LoadingState message="Loading your data..." />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title="My Overview"
        subtitle="Your fitness journey at a glance"
        sidebarItems={clientSidebarItems}
        brandSubtitle="Client Portal"
      >
        <ErrorState message={error} onRetry={handleRetry} />
      </AppShell>
    );
  }

  const profile = data?.profile as Record<string, unknown> | null;
  const plan = data?.assignedPlan as Record<string, unknown> | null;
  const subscription = data?.activeSubscription as Record<string, unknown> | null;
  const payment = data?.latestPayment as Record<string, unknown> | null;
  const measurement = data?.latestBodyMeasurement as Record<string, unknown> | null;

  const paymentStatus = payment?.status ? String(payment.status) : null;
  const isPaymentAttention =
    paymentStatus === "UNPAID" ||
    paymentStatus === "OVERDUE" ||
    paymentStatus === "PARTIAL";

  return (
    <AppShell
      title="My Overview"
      subtitle="Your fitness journey at a glance"
      sidebarItems={clientSidebarItems}
      brandSubtitle="Client Portal"
    >
      <div className="space-y-5 sm:space-y-6">
        <div className="afc-gradient-border">
          <div className="afc-surface afc-surface-elevated rounded-[1.125rem] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-afc-red">
              Welcome back
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-afc-white sm:text-3xl">
              {data?.user.fullName ?? "Athlete"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-afc-soft-grey">
              Your training profile, subscription, and progress — organized in one
              focused personal portal.
            </p>
          </div>
        </div>

        <Card
          variant="glass"
          accent="green"
          title="Live profile sync"
          subtitle="Personal data streamed from your coach platform"
          headerAction={<LiveStatusBadge label="Synced" />}
        >
          <code className="inline-flex rounded-lg border border-afc-border-grey bg-afc-black/50 px-3 py-1.5 font-mono text-xs text-afc-green">
            GET /api/client/me
          </code>
        </Card>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          <Card accent="neutral" title="Personal overview" hover>
            <DataRow label="Full name" value={data?.user.fullName ?? "—"} />
            <DataRow label="Email" value={data?.user.email ?? "—"} />
            <DataRow label="Phone" value={data?.user.phoneNumber ?? "—"} />
            <DataRow
              label="Fitness goal"
              value={profile?.fitnessGoal ? String(profile.fitnessGoal) : "—"}
            />
            <DataRow
              label="Activity level"
              value={
                profile?.activityLevel ? String(profile.activityLevel) : "—"
              }
            />
          </Card>

          <Card
            accent="green"
            title="Subscription"
            headerAction={
              subscription ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="outline">None</Badge>
              )
            }
            hover
          >
            {subscription ? (
              <>
                <DataRow
                  label="Plan"
                  value={plan?.name ? String(plan.name) : "Assigned plan"}
                />
                <DataRow
                  label="Start date"
                  value={formatDate(subscription.startDate)}
                />
                <DataRow
                  label="Next billing"
                  value={formatDate(subscription.nextBillingDate)}
                />
              </>
            ) : (
              <EmptyState message="No active subscription on file." />
            )}
          </Card>

          <Card
            accent={isPaymentAttention ? "red" : "neutral"}
            title="Latest payment"
            headerAction={
              paymentStatus ? (
                <Badge variant={isPaymentAttention ? "danger" : "success"}>
                  {paymentStatus}
                </Badge>
              ) : undefined
            }
            hover
          >
            {payment ? (
              <>
                <DataRow
                  label="Amount"
                  value={`${payment.amount} ${payment.currency ?? "USD"}`}
                />
                <DataRow label="Due date" value={formatDate(payment.dueDate)} />
                <DataRow
                  label="Paid on"
                  value={formatDate(payment.paymentDate)}
                />
              </>
            ) : (
              <EmptyState message="No payment records yet." />
            )}
          </Card>

          <Card
            accent="green"
            title="Body composition snapshot"
            subtitle="Historical values for progress tracking — not medical advice."
            hover
          >
            {measurement ? (
              <>
                <DataRow
                  label="Measured"
                  value={formatDateTime(measurement.measuredAt)}
                />
                <DataRow
                  label="Weight"
                  value={
                    measurement.weightKg ? `${measurement.weightKg} kg` : "—"
                  }
                />
                <DataRow
                  label="BMI"
                  value={measurement.bmi ? String(measurement.bmi) : "—"}
                />
                <DataRow
                  label="Body fat %"
                  value={
                    measurement.bodyFatPercentage
                      ? `${measurement.bodyFatPercentage}%`
                      : "—"
                  }
                />
              </>
            ) : (
              <EmptyState message="No measurements recorded yet." />
            )}
          </Card>
        </div>

        <Card
          accent="neutral"
          title="Upcoming bookings"
          headerAction={
            <Badge variant="outline">
              {data?.upcomingBookings.length ?? 0} scheduled
            </Badge>
          }
        >
          {data?.upcomingBookings.length ? (
            <ul className="space-y-3">
              {data.upcomingBookings.map((booking) => {
                const item = booking as Record<string, unknown>;
                return (
                  <li
                    key={String(item.id)}
                    className="afc-surface rounded-xl border-l-4 border-l-afc-green px-4 py-3"
                  >
                    <p className="font-medium text-afc-white">
                      {formatDateTime(item.startTime)}
                    </p>
                    <p className="mt-1 text-sm text-afc-soft-grey">
                      Status: {String(item.status ?? "—")}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState message="No upcoming approved sessions." />
          )}
        </Card>

        <Card
          accent="red"
          title="Notifications"
          headerAction={
            <Badge
              variant={
                (data?.unreadNotificationsCount ?? 0) > 0 ? "danger" : "outline"
              }
            >
              {data?.unreadNotificationsCount ?? 0} unread
            </Badge>
          }
        >
          {data?.notifications.length ? (
            <ul className="space-y-2">
              {data.notifications.slice(0, 5).map((notification) => {
                const item = notification as Record<string, unknown>;
                return (
                  <li
                    key={String(item.id)}
                    className="rounded-xl border border-afc-border-grey bg-afc-black/25 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-afc-white">
                      {String(item.title ?? "Notification")}
                    </p>
                    <p className="mt-1 text-sm text-afc-soft-grey">
                      {String(item.message ?? "")}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState message="No notifications yet." />
          )}
        </Card>
      </div>
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
