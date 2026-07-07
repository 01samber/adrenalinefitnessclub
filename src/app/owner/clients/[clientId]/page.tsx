"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AddMeasurementModal } from "@/components/owner/AddMeasurementModal";
import { EditClientProfileModal } from "@/components/owner/EditClientProfileModal";
import { ClientStatusPanel } from "@/components/owner/ClientStatusPanel";
import { SquadAmbientBackground } from "@/components/owner/SquadAmbientBackground";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { HeroBand } from "@/components/ui/HeroBand";
import { LoadingState } from "@/components/ui/LoadingState";
import { MacroCompositionRing } from "@/components/ui/MacroCompositionRing";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { StatCard } from "@/components/ui/StatCard";
import { ApiClientError, apiGet } from "@/lib/api-client";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import type {
  ClientBooking,
  ClientMeasurement,
  ClientPayment,
  ClientProgressNote,
  ClientSubscription,
  OwnerClientDetail,
} from "@/types/api";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function displayUserStatus(status: string) {
  if (status === "SUSPENDED") return "INACTIVE";
  return status;
}

function userStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FROZEN":
      return "warning";
    case "DELETED":
      return "danger";
    default:
      return "neutral";
  }
}

function paymentStatusVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "PAID":
      return "success";
    case "UNPAID":
    case "OVERDUE":
      return "danger";
    case "PARTIAL":
      return "warning";
    default:
      return "neutral";
  }
}

function subscriptionStatusVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FROZEN":
    case "CANCELLED":
      return "danger";
    case "EXPIRED":
      return "warning";
    default:
      return "neutral";
  }
}

function bookingStatusVariant(
  status: string,
): "success" | "danger" | "neutral" {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return "danger";
    default:
      return "neutral";
  }
}

function getActiveSubscription(
  subscriptions: ClientSubscription[],
): ClientSubscription | null {
  return (
    subscriptions.find((subscription) => subscription.status === "ACTIVE") ??
    subscriptions[0] ??
    null
  );
}

function DetailSkeleton() {
  return (
    <div
      className="afc-page-stack space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading athlete profile"
    >
      <p className="afc-section-label">Syncing athlete profile…</p>

      <div className="afc-hero-band afc-surface p-6 sm:p-8">
        <div className="afc-stat-tile__skeleton-label w-24" />
        <div className="mt-4 h-6 w-full max-w-2xl rounded bg-afc-panel-2 animate-pulse" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-afc-panel-2/80 animate-pulse" />
        <div className="mt-5 h-8 w-56 rounded bg-afc-panel-2/60 animate-pulse" />
      </div>

      <div className="afc-client-hero rounded-[1.125rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-xl bg-afc-panel-2 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-afc-panel-2 animate-pulse" />
            <div className="h-4 w-64 rounded bg-afc-panel-2/80 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-7 w-24 rounded-full bg-afc-panel-2/70 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="afc-stat-grid afc-stat-grid--compact">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatCard key={index} label="—" value="—" loading staggerIndex={index} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="afc-surface p-6 sm:p-8">
            <div className="afc-stat-tile__skeleton-label w-32" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((__, row) => (
                <div
                  key={row}
                  className="h-10 rounded-lg bg-afc-panel-2/70 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PaymentRowProps {
  payment: ClientPayment;
  stacked?: boolean;
}

function PaymentRow({ payment, stacked = false }: PaymentRowProps) {
  if (stacked) {
    return (
      <article className="afc-surface rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-afc-white">
            {formatCurrency(payment.amount, payment.currency)}
          </p>
          <Badge variant={paymentStatusVariant(payment.status)}>
            {payment.status}
          </Badge>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-afc-soft-grey">Due</dt>
            <dd className="text-afc-white">{formatDate(payment.dueDate)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-afc-soft-grey">Paid</dt>
            <dd className="text-afc-white">{formatDate(payment.paymentDate)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-afc-soft-grey">Method</dt>
            <dd className="text-afc-white">{payment.paymentMethod}</dd>
          </div>
        </dl>
      </article>
    );
  }

  return (
    <tr className="border-b border-afc-border-grey/50 last:border-b-0 hover:bg-white/[0.02]">
      <td className="px-4 py-3.5 font-medium text-afc-white">
        {formatCurrency(payment.amount, payment.currency)}
      </td>
      <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
        {payment.currency}
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={paymentStatusVariant(payment.status)}>
          {payment.status}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
        {formatDate(payment.dueDate)}
      </td>
      <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
        {formatDate(payment.paymentDate)}
      </td>
      <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
        {payment.paymentMethod}
      </td>
    </tr>
  );
}

interface BookingRowProps {
  booking: ClientBooking;
  stacked?: boolean;
}

function BookingRow({ booking, stacked = false }: BookingRowProps) {
  if (stacked) {
    return (
      <article className="afc-surface rounded-xl border-l-4 border-l-afc-green/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-afc-white">
            {formatDateTime(booking.startTime)}
          </p>
          <Badge variant={bookingStatusVariant(booking.status)}>
            {booking.status}
          </Badge>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-afc-soft-grey">Requested by</dt>
            <dd className="text-afc-white">{booking.requestedBy}</dd>
          </div>
          {booking.notes ? (
            <div>
              <dt className="text-afc-soft-grey">Notes</dt>
              <dd className="mt-1 text-afc-light-grey">{booking.notes}</dd>
            </div>
          ) : null}
        </dl>
      </article>
    );
  }

  return (
    <tr className="border-b border-afc-border-grey/50 last:border-b-0 hover:bg-white/[0.02]">
      <td className="px-4 py-3.5 text-sm text-afc-white">
        {formatDateTime(booking.startTime)}
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={bookingStatusVariant(booking.status)}>
          {booking.status}
        </Badge>
      </td>
      <td className="max-w-[12rem] px-4 py-3.5 text-sm text-afc-soft-grey">
        <span className="line-clamp-2">{booking.notes ?? "—"}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
        {booking.requestedBy}
      </td>
    </tr>
  );
}

function ProgressNoteItem({ note }: { note: ClientProgressNote }) {
  return (
    <li className="afc-surface rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline">{note.noteType}</Badge>
        <span className="text-xs text-afc-soft-grey">
          {formatDateTime(note.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-afc-light-grey">
        {note.content}
      </p>
    </li>
  );
}

function MeasurementHistoryItem({
  measurement,
  isLatest = false,
}: {
  measurement: ClientMeasurement;
  isLatest?: boolean;
}) {
  return (
    <article
      className={`afc-measurement-history-item ${isLatest ? "afc-measurement-history-item--latest" : ""}`}
    >
      <div className="afc-measurement-history-item__header">
        <div>
          <p className="afc-measurement-history-item__date">
            {formatDate(measurement.measuredAt)}
          </p>
          {isLatest ? (
            <span className="afc-measurement-history-item__badge">Latest</span>
          ) : null}
        </div>
        <p className="afc-measurement-history-item__weight">
          {measurement.weightKg} kg
        </p>
      </div>

      <div className="afc-measurement-history-item__metrics">
        <DataRow
          label="Body fat %"
          value={
            measurement.bodyFatPercentage
              ? `${measurement.bodyFatPercentage}%`
              : "—"
          }
        />
        <DataRow
          label="Muscle (kg)"
          value={measurement.muscleKg ? `${measurement.muscleKg} kg` : "—"}
        />
        <DataRow label="BMI" value={measurement.bmi ?? "—"} />
      </div>

      {measurement.coachAssessment ? (
        <div className="afc-measurement-history-item__notes">
          <p className="afc-measurement-history-item__label">Coach assessment</p>
          <p className="afc-measurement-history-item__copy">
            {measurement.coachAssessment}
          </p>
        </div>
      ) : null}

      {measurement.notes ? (
        <div className="afc-measurement-history-item__notes">
          <p className="afc-measurement-history-item__label">Notes</p>
          <p className="afc-measurement-history-item__copy">{measurement.notes}</p>
        </div>
      ) : null}
    </article>
  );
}

function ClientDetailContent() {
  const params = useParams();
  const clientId = typeof params.clientId === "string" ? params.clientId : "";

  const [data, setData] = useState<OwnerClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [measurementFormKey, setMeasurementFormKey] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormKey, setEditFormKey] = useState(0);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    async function fetchClient() {
      setError("");
      setNotFound(false);
      setLoading(true);

      try {
        const result = await apiGet<OwnerClientDetail>(
          `/api/owner/clients/${clientId}`,
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 404) {
            setNotFound(true);
          } else if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError("You do not have permission to view this client.");
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load client profile.",
            );
          }
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchClient();

    return () => {
      cancelled = true;
    };
  }, [clientId, reloadKey]);

  const handleRetry = () => {
    setReloadKey((key) => key + 1);
  };

  const handleMeasurementSuccess = (message: string) => {
    setSuccessMessage(message);
    setReloadKey((key) => key + 1);
  };

  const handleEditSuccess = (message: string) => {
    setSuccessMessage(message);
    setReloadKey((key) => key + 1);
  };

  const openEditModal = () => {
    setEditFormKey((key) => key + 1);
    setEditModalOpen(true);
  };

  const shellTitle = data?.user.fullName ?? "Athlete Profile";
  const shellSubtitle =
    "Coach-connected training, membership, payment, and progress overview.";

  const activeSubscription = data
    ? getActiveSubscription(data.subscriptions)
    : null;
  const latestPayment = data?.payments[0] ?? null;
  const latestMeasurement = data?.measurements[0] ?? null;
  const completedSessions =
    data?.bookings.filter((booking) => booking.status === "COMPLETED").length ??
    0;
  const assignedPlanName =
    activeSubscription?.plan.name ??
    (data?.profile?.assignedPlanId ? "Plan assigned" : "No plan assigned");

  return (
    <AppShell
      title={shellTitle}
      subtitle={shellSubtitle}
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      <div className="afc-squad-page afc-page-stack relative space-y-6">
        <SquadAmbientBackground variant="detail" />

        <div className="relative z-[1] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/owner/clients"
            className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-lg border border-afc-border bg-afc-black/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-afc-muted transition-colors hover:border-afc-gold/40 hover:bg-afc-gold/10 hover:text-afc-white"
          >
            <span aria-hidden>←</span>
            Back to squad
          </Link>
        </div>

        {loading ? (
          <DetailSkeleton />
        ) : notFound ? (
          <div className="afc-surface mx-auto max-w-lg p-8 text-center">
            <h2 className="text-lg font-semibold text-afc-white">Client not found</h2>
            <p className="mt-2 text-sm text-afc-soft-grey">
              This client may have been removed or the link is invalid.
            </p>
            <Link href="/owner/clients" className="mt-6 inline-block">
              <Button variant="secondary">Return to clients</Button>
            </Link>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : data ? (
          <>
            <HeroBand
              kicker="Coach view"
              headline={`${displayUserStatus(data.user.status)} athlete profile — review membership, payments, and training data below.`}
              detail={
                data.profile?.fitnessGoal
                  ? `Training goal: ${data.profile.fitnessGoal}`
                  : assignedPlanName !== "No plan assigned"
                    ? `Assigned plan: ${assignedPlanName}`
                    : "No training goal on file yet."
              }
              live
              liveLabel="LIVE PROFILE"
              footer={
                <code className="afc-hero-band__api-chip">
                  GET /api/owner/clients/{clientId}
                </code>
              }
            />

            <PlayerCard
              name={data.user.fullName}
              subtitle={data.user.email}
              role="Athlete"
              statusBadge={{
                label: displayUserStatus(data.user.status),
                variant: userStatusVariant(data.user.status),
              }}
              planLabel={assignedPlanName}
              goal={data.profile?.fitnessGoal}
              chips={[
                {
                  label: "Activity",
                  value: data.profile?.activityLevel ?? "—",
                },
                {
                  label: "Joined",
                  value: formatDate(data.profile?.joinDate),
                },
              ]}
              accent={
                data.user.status === "ACTIVE"
                  ? "green"
                  : "neutral"
              }
              avatarStatus={
                data.user.status === "ACTIVE"
                  ? "active"
                  : data.user.status === "FROZEN"
                    ? "frozen"
                    : "inactive"
              }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="min-h-[44px] w-full sm:w-auto"
                onClick={openEditModal}
              >
                Edit profile
              </Button>
            </div>

            <ClientStatusPanel
              clientId={data.user.id}
              clientName={data.user.fullName}
              userStatus={data.user.status}
              profileStatus={data.profile?.status}
              onStatusChanged={handleRetry}
            />

            {successMessage ? (
              <div
                className="rounded-xl border border-afc-green/40 bg-afc-green/10 px-4 py-3 text-sm text-afc-green-neon"
                role="status"
              >
                {successMessage}
              </div>
            ) : null}

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="afc-section-label">Athlete snapshot</h2>
                {latestMeasurement ? (
                  <MacroCompositionRing
                    musclePercentage={latestMeasurement.musclePercentage}
                    bodyFatPercentage={latestMeasurement.bodyFatPercentage}
                    waterPercentage={latestMeasurement.waterPercentage}
                  />
                ) : null}
              </div>
              <div className="afc-stat-grid afc-stat-grid--compact">
              <StatCard
                label="Membership"
                value={activeSubscription?.status ?? "None"}
                accent={
                  activeSubscription?.status === "ACTIVE" ? "success" : "neutral"
                }
                animateNumeric={false}
                staggerIndex={0}
              />
              <StatCard
                label="Latest payment"
                value={latestPayment?.status ?? "None"}
                accent={
                  latestPayment?.status === "PAID"
                    ? "success"
                    : latestPayment?.status === "UNPAID" ||
                        latestPayment?.status === "OVERDUE"
                      ? "danger"
                      : "neutral"
                }
                animateNumeric={false}
                staggerIndex={1}
              />
              <StatCard
                label="Latest weight"
                value={
                  latestMeasurement?.weightKg
                    ? `${latestMeasurement.weightKg} kg`
                    : "—"
                }
                accent="neutral"
                animateNumeric={false}
                staggerIndex={2}
              />
              <StatCard
                label="Latest BMI"
                value={latestMeasurement?.bmi ?? "—"}
                accent="neutral"
                animateNumeric={false}
                staggerIndex={3}
              />
              <StatCard
                label="Total bookings"
                value={data.bookings.length}
                accent="accent"
                staggerIndex={4}
              />
              <StatCard
                label="Completed sessions"
                value={completedSessions}
                accent="success"
                staggerIndex={5}
              />
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card accent="neutral" title="Training profile" hover headerAction={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-[44px]"
                  onClick={openEditModal}
                >
                  Edit profile
                </Button>
              }>
                {data.profile ? (
                  <>
                    <DataRow label="Phone" value={data.user.phoneNumber ?? "—"} />
                    <DataRow
                      label="Date of birth"
                      value={formatDate(data.profile.dateOfBirth)}
                    />
                    <DataRow label="Gender" value={data.profile.gender} />
                    <DataRow
                      label="Height"
                      value={
                        data.profile.heightCm
                          ? `${data.profile.heightCm} cm`
                          : "—"
                      }
                    />
                    <DataRow
                      label="Emergency contact"
                      value={`${data.profile.emergencyContactName} · ${data.profile.emergencyContactPhone}`}
                    />
                    <DataRow
                      label="Medical notes"
                      value={data.profile.medicalNotes ?? "—"}
                    />
                    <DataRow
                      label="Injuries"
                      value={data.profile.injuries ?? "—"}
                    />
                    <DataRow
                      label="Coach notes"
                      value={data.profile.coachNotes ?? "—"}
                    />
                  </>
                ) : (
                  <EmptyState message="No profile details on file." />
                )}
              </Card>

              <Card
                accent="green"
                title="Membership status"
                headerAction={
                  activeSubscription ? (
                    <Badge
                      variant={subscriptionStatusVariant(
                        activeSubscription.status,
                      )}
                    >
                      {activeSubscription.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">None</Badge>
                  )
                }
                hover
              >
                {activeSubscription ? (
                  <>
                    <DataRow
                      label="Plan"
                      value={activeSubscription.plan.name}
                    />
                    <DataRow
                      label="Sessions / week"
                      value={String(activeSubscription.plan.sessionsPerWeek)}
                    />
                    <DataRow
                      label="Monthly price"
                      value={formatCurrency(
                        activeSubscription.plan.monthlyPrice,
                        activeSubscription.plan.currency,
                      )}
                    />
                    <DataRow
                      label="Start date"
                      value={formatDate(activeSubscription.startDate)}
                    />
                    <DataRow
                      label="End date"
                      value={formatDate(activeSubscription.endDate)}
                    />
                    <DataRow
                      label="Next billing"
                      value={formatDate(activeSubscription.nextBillingDate)}
                    />
                    <DataRow
                      label="Status"
                      value={activeSubscription.status}
                    />
                  </>
                ) : (
                  <EmptyState message="No subscription on file." />
                )}
              </Card>
            </div>

            <Card
              accent="neutral"
              title="Payment record"
              subtitle="Recent payment history"
              headerAction={
                <Badge variant="outline">{data.payments.length} records</Badge>
              }
            >
              {data.payments.length ? (
                <>
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="afc-data-table w-full min-w-[40rem] text-left">
                        <thead>
                          <tr className="border-b border-afc-border-grey/70 bg-afc-black/30">
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Currency
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Status
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Due date
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Payment date
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Method
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.payments.map((payment) => (
                            <PaymentRow key={payment.id} payment={payment} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-3 lg:hidden">
                    {data.payments.map((payment) => (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        stacked
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  variant="payments"
                  message="No payments logged for this athlete yet."
                />
              )}
            </Card>

            <Card
              accent="green"
              title="Body composition snapshot"
              subtitle="Historical body composition values for coach tracking only."
              headerAction={
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMeasurementFormKey((key) => key + 1);
                    setMeasurementModalOpen(true);
                  }}
                >
                  Add measurement
                </Button>
              }
            >
              {data.measurements.length ? (
                <div className="space-y-4">
                  {latestMeasurement ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <DataRow
                        label="Measured"
                        value={formatDateTime(latestMeasurement.measuredAt)}
                      />
                      <DataRow
                        label="Weight"
                        value={`${latestMeasurement.weightKg} kg`}
                      />
                      <DataRow
                        label="BMI"
                        value={latestMeasurement.bmi ?? "—"}
                      />
                      <DataRow
                        label="Body fat %"
                        value={
                          latestMeasurement.bodyFatPercentage
                            ? `${latestMeasurement.bodyFatPercentage}%`
                            : "—"
                        }
                      />
                      <DataRow
                        label="Muscle (kg)"
                        value={
                          latestMeasurement.muscleKg
                            ? `${latestMeasurement.muscleKg} kg`
                            : "—"
                        }
                      />
                      <DataRow
                        label="Muscle %"
                        value={
                          latestMeasurement.musclePercentage
                            ? `${latestMeasurement.musclePercentage}%`
                            : "—"
                        }
                      />
                      <DataRow
                        label="Water %"
                        value={
                          latestMeasurement.waterPercentage
                            ? `${latestMeasurement.waterPercentage}%`
                            : "—"
                        }
                      />
                      <DataRow
                        label="Visceral fat"
                        value={
                          latestMeasurement.visceralFatKg
                            ? `${latestMeasurement.visceralFatKg} kg`
                            : "—"
                        }
                      />
                      <DataRow
                        label="BMR"
                        value={
                          latestMeasurement.basalMetabolicRate
                            ? String(latestMeasurement.basalMetabolicRate)
                            : "—"
                        }
                      />
                    </div>
                  ) : null}

                  {latestMeasurement?.coachAssessment ? (
                    <div className="rounded-xl border border-afc-border-grey/70 bg-afc-black/25 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                        Coach assessment
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-afc-light-grey">
                        {latestMeasurement.coachAssessment}
                      </p>
                    </div>
                  ) : null}

                  {latestMeasurement?.notes ? (
                    <div className="rounded-xl border border-afc-border-grey/70 bg-afc-black/25 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-afc-light-grey">
                        {latestMeasurement.notes}
                      </p>
                    </div>
                  ) : null}

                  <div className="afc-measurement-history">
                    <h3 className="afc-measurement-history__title">
                      Measurement history
                    </h3>
                    <div className="afc-measurement-history__list">
                      {data.measurements.map((measurement, index) => (
                        <MeasurementHistoryItem
                          key={measurement.id}
                          measurement={measurement}
                          isLatest={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  variant="measurements"
                  message="Track their first measurement to start the progress trend."
                />
              )}
            </Card>

            <AddMeasurementModal
              key={`add-measurement-${clientId}-${measurementFormKey}`}
              open={measurementModalOpen}
              clientId={data.user.id}
              clientName={data.user.fullName}
              profileHeightCm={data.profile?.heightCm}
              onClose={() => setMeasurementModalOpen(false)}
              onSuccess={handleMeasurementSuccess}
            />

            <EditClientProfileModal
              key={`edit-profile-${clientId}-${editFormKey}`}
              open={editModalOpen}
              client={data}
              onClose={() => setEditModalOpen(false)}
              onSuccess={handleEditSuccess}
            />

            <Card accent="neutral" title="Session history" hover>
              {data.bookings.length ? (
                <>
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="afc-data-table w-full min-w-[36rem] text-left">
                        <thead>
                          <tr className="border-b border-afc-border-grey/70 bg-afc-black/30">
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Date / time
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Status
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Notes
                            </th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                              Requested by
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.bookings.map((booking) => (
                            <BookingRow key={booking.id} booking={booking} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-3 lg:hidden">
                    {data.bookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        stacked
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  variant="sessions"
                  message="No sessions booked yet."
                />
              )}
            </Card>

            <Card accent="neutral" title="Coach notes">
              {data.progressNotes.length ? (
                <ul className="space-y-3">
                  {data.progressNotes.map((note) => (
                    <ProgressNoteItem key={note.id} note={note} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  variant="notes"
                  message="Add your first note after their next session."
                />
              )}
            </Card>
          </>
        ) : (
          <LoadingState message="Loading client profile..." />
        )}
        </div>
      </div>
    </AppShell>
  );
}

export default function OwnerClientDetailPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <ClientDetailContent />
    </AuthGuard>
  );
}
