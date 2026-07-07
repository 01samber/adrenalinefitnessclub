"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoadingState } from "@/components/ui/LoadingState";
import { CancelSubscriptionConfirmModal } from "@/components/owner/CancelSubscriptionConfirmModal";
import { CreateSubscriptionModal } from "@/components/owner/CreateSubscriptionModal";
import { SubscriptionStatusBadge } from "@/components/owner/SubscriptionStatusBadge";
import { SubscriptionsAmbientBackground } from "@/components/owner/SubscriptionsAmbientBackground";
import { SubscriptionsWorkspaceSkeleton } from "@/components/owner/SubscriptionsWorkspaceSkeleton";
import { UpdateSubscriptionModal } from "@/components/owner/UpdateSubscriptionModal";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/DataRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { HeroBand } from "@/components/ui/HeroBand";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { ApiClientError, apiGet, apiPatch } from "@/lib/api-client";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import {
  SUBSCRIPTION_STATUS_FILTER_OPTIONS,
  buildSubscriptionsUrl,
  canCancelSubscription,
  canUpdateSubscription,
  computeSubscriptionPageSummary,
  formatSubscriptionDate,
  formatSubscriptionMoney,
  mapApiSummaryToPageSummary,
  resolveSubscriptionSummaryLabel,
  resolveSubscriptionErrorMessage,
  subscriptionCardAccentClass,
} from "@/lib/subscription-utils";
import type {
  CancelSubscriptionResponse,
  OwnerClientListItem,
  OwnerClientsData,
  OwnerPlan,
  OwnerPlansResponse,
  OwnerSubscriptionListItem,
  OwnerSubscriptionsResponse,
  SubscriptionStatusFilter,
} from "@/types/api";

const PAGE_SIZE = 10;
const CLIENT_FETCH_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 350;

function SubscriptionActions({
  subscription,
  clientName,
  busy,
  onUpdate,
  onCancel,
}: {
  subscription: OwnerSubscriptionListItem;
  clientName: string;
  busy: boolean;
  onUpdate: (subscription: OwnerSubscriptionListItem) => void;
  onCancel: (subscription: OwnerSubscriptionListItem) => void;
}) {
  return (
    <div className="afc-subscription-actions">
      <Link href={`/owner/clients/${subscription.clientId}`}>
        <Button type="button" variant="ghost" size="sm" className="min-h-[44px]">
          Open profile
        </Button>
      </Link>
      {canUpdateSubscription(subscription.status) ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-[44px]"
          disabled={busy}
          onClick={() => onUpdate(subscription)}
        >
          Update
        </Button>
      ) : null}
      {canCancelSubscription(subscription.status) ? (
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="min-h-[44px]"
          disabled={busy}
          onClick={() => onCancel(subscription)}
        >
          Cancel
        </Button>
      ) : null}
      <span className="sr-only">Actions for {clientName}</span>
    </div>
  );
}

function SubscriptionMobileCard({
  subscription,
  clientName,
  clientEmail,
  busy,
  onUpdate,
  onCancel,
  rowIndex = 0,
}: {
  subscription: OwnerSubscriptionListItem;
  clientName: string;
  clientEmail: string;
  busy: boolean;
  onUpdate: (subscription: OwnerSubscriptionListItem) => void;
  onCancel: (subscription: OwnerSubscriptionListItem) => void;
  rowIndex?: number;
}) {
  return (
    <article
      className={`afc-subscription-card ${subscriptionCardAccentClass(subscription.status)} afc-animate-row p-5`}
      style={{ animationDelay: `${rowIndex * 45}ms` }}
    >
      <div className="afc-subscription-card__header">
        <div className="min-w-0">
          <p className="truncate font-semibold text-afc-white">{clientName}</p>
          <p className="mt-0.5 truncate text-sm text-afc-soft-grey">{clientEmail}</p>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </div>

      <p className="afc-subscription-card__plan mt-4">
        {subscription.plan?.name ?? "No plan assigned"}
      </p>
      <p className="mt-1 text-sm text-afc-muted">
        {subscription.plan
          ? `${subscription.plan.sessionsPerWeek} sessions/week · ${formatSubscriptionMoney(
              subscription.plan.monthlyPrice,
              subscription.plan.currency,
            )}`
          : "—"}
      </p>

      <dl className="afc-subscription-card__meta">
        <div className="afc-subscription-card__row">
          <dt>Start date</dt>
          <dd>{formatSubscriptionDate(subscription.startDate)}</dd>
        </div>
        <div className="afc-subscription-card__row">
          <dt>End date</dt>
          <dd>{formatSubscriptionDate(subscription.endDate)}</dd>
        </div>
        <div className="afc-subscription-card__row">
          <dt>Next billing</dt>
          <dd>{formatSubscriptionDate(subscription.nextBillingDate)}</dd>
        </div>
        <div className="afc-subscription-card__row">
          <dt>Auto-renew</dt>
          <dd>{subscription.autoRenew ? "Yes" : "No"}</dd>
        </div>
      </dl>

      <div className="afc-subscription-card__actions">
        <SubscriptionActions
          subscription={subscription}
          clientName={clientName}
          busy={busy}
          onUpdate={onUpdate}
          onCancel={onCancel}
        />
      </div>
    </article>
  );
}

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatusFilter>("");
  const [clientFilter, setClientFilter] = useState(initialClientId);
  const [planFilter, setPlanFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [subscriptionsData, setSubscriptionsData] =
    useState<OwnerSubscriptionsResponse | null>(null);
  const [clients, setClients] = useState<OwnerClientListItem[]>([]);
  const [plans, setPlans] = useState<OwnerPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalKey, setCreateModalKey] = useState(0);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateModalKey, setUpdateModalKey] = useState(0);
  const [updateTarget, setUpdateTarget] = useState<OwnerSubscriptionListItem | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<OwnerSubscriptionListItem | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchReferenceData() {
      try {
        const [clientsResult, plansResult] = await Promise.all([
          apiGet<OwnerClientsData>(
            `/api/owner/clients?limit=${CLIENT_FETCH_LIMIT}&page=1`,
          ),
          apiGet<OwnerPlansResponse>("/api/owner/plans"),
        ]);

        if (!cancelled) {
          setClients(clientsResult.items);
          setPlans(plansResult.items);
        }
      } catch {
        if (!cancelled) {
          setClients([]);
          setPlans([]);
        }
      }
    }

    void fetchReferenceData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubscriptions() {
      setError("");
      setLoading(true);

      try {
        const result = await apiGet<OwnerSubscriptionsResponse>(
          buildSubscriptionsUrl({
            page,
            limit: PAGE_SIZE,
            status: statusFilter || undefined,
            clientId: clientFilter || undefined,
            planId: planFilter || undefined,
            search: debouncedSearch.trim() || undefined,
          }),
        );

        if (!cancelled) setSubscriptionsData(result);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError("You do not have permission to view subscriptions.");
          } else {
            setError(resolveSubscriptionErrorMessage(err));
          }
          setSubscriptionsData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, clientFilter, planFilter, debouncedSearch, reloadKey]);

  const clientMap = useMemo(() => {
    const map = new Map<string, OwnerClientListItem>();
    for (const client of clients) map.set(client.user.id, client);
    return map;
  }, [clients]);

  const displayedSubscriptions = useMemo(
    () => subscriptionsData?.items ?? [],
    [subscriptionsData?.items],
  );

  const pageSummary = useMemo(() => {
    const rowSummary = computeSubscriptionPageSummary(displayedSubscriptions);
    const apiSummary = subscriptionsData?.summary;

    if (apiSummary?.scope === "filtered") {
      return mapApiSummaryToPageSummary(apiSummary);
    }

    return rowSummary;
  }, [displayedSubscriptions, subscriptionsData?.summary]);

  const summaryLabel = resolveSubscriptionSummaryLabel(
    subscriptionsData?.summary,
    subscriptionsData?.summary?.scope !== "filtered",
  );

  const clientFilterOptions = useMemo(
    () => [
      { value: "", label: "All athletes" },
      ...clients.map((client) => ({
        value: client.user.id,
        label: client.user.fullName,
        helper: client.user.email,
      })),
    ],
    [clients],
  );

  const planFilterOptions = useMemo(
    () => [
      { value: "", label: "All plans" },
      ...plans.map((plan) => ({
        value: plan.id,
        label: plan.name,
        helper: `${plan.sessionsPerWeek} sessions/week`,
      })),
    ],
    [plans],
  );

  function getClientName(subscription: OwnerSubscriptionListItem) {
    return (
      subscription.client?.fullName ??
      clientMap.get(subscription.clientId)?.user.fullName ??
      "Unknown athlete"
    );
  }

  function getClientEmail(subscription: OwnerSubscriptionListItem) {
    return (
      subscription.client?.email ??
      clientMap.get(subscription.clientId)?.user.email ??
      "—"
    );
  }

  function handleRetry() {
    setReloadKey((key) => key + 1);
  }

  function handleFilterChange<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
    setSuccessMessage("");
  }

  function openCreateModal() {
    setCreateModalKey((key) => key + 1);
    setCreateModalOpen(true);
  }

  function openUpdateModal(subscription: OwnerSubscriptionListItem) {
    setUpdateTarget(subscription);
    setUpdateModalKey((key) => key + 1);
    setUpdateModalOpen(true);
  }

  function openCancelModal(subscription: OwnerSubscriptionListItem) {
    setCancelTarget(subscription);
    setCancelModalOpen(true);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;

    setMutationLoading(true);
    setSuccessMessage("");

    try {
      await apiPatch<CancelSubscriptionResponse>(
        `/api/owner/subscriptions/${cancelTarget.id}/cancel`,
      );
      setSuccessMessage("Membership subscription cancelled successfully.");
      setCancelModalOpen(false);
      setCancelTarget(null);
      handleRetry();
    } catch (err) {
      setError(resolveSubscriptionErrorMessage(err));
    } finally {
      setMutationLoading(false);
    }
  }

  const pagination = subscriptionsData?.pagination;
  const hasSubscriptions = (subscriptionsData?.items.length ?? 0) > 0;
  const showingFilteredEmpty =
    hasSubscriptions && displayedSubscriptions.length === 0;
  const summaryLabelText = summaryLabel;

  return (
    <AppShell
      title="Membership Control"
      subtitle="Manage athlete subscriptions, renewals, plan changes, and membership status."
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      <div className="afc-subscriptions-page afc-page-stack relative space-y-6 sm:space-y-8">
        <SubscriptionsAmbientBackground />

        <div className="relative z-[1] space-y-6 sm:space-y-8">
          {loading ? (
            <SubscriptionsWorkspaceSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={handleRetry} />
          ) : (
            <>
              <HeroBand
                kicker="Membership desk"
                headline="Membership control — manage plans, billing dates, and athlete subscription status."
                detail={
                  pagination
                    ? `${summaryLabelText} — page ${pagination.page} of ${Math.max(pagination.totalPages, 1)} (${pagination.total} record${pagination.total === 1 ? "" : "s"}).`
                    : "Membership workspace ready for review."
                }
                live
                liveLabel="LIVE MEMBERSHIPS"
                footer={
                  <code className="afc-hero-band__api-chip">
                    GET /api/owner/subscriptions
                  </code>
                }
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
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="afc-section-label">Membership summary</h2>
                    <p className="mt-1 text-xs text-afc-muted">{summaryLabelText}</p>
                  </div>
                </div>
                <div className="afc-stat-grid">
                  <StatCard
                    label="Active subscriptions"
                    value={pageSummary.activeCount}
                    accent="success"
                    staggerIndex={0}
                  />
                  <StatCard
                    label="Cancelled"
                    value={pageSummary.cancelledCount}
                    accent="neutral"
                    staggerIndex={1}
                  />
                  <StatCard
                    label="Expired"
                    value={pageSummary.expiredCount}
                    accent="danger"
                    staggerIndex={2}
                  />
                  <StatCard
                    label="Frozen"
                    value={pageSummary.frozenCount}
                    accent="neutral"
                    staggerIndex={3}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Active monthly value"
                    value={formatSubscriptionMoney(
                      String(pageSummary.activeMonthlyValue),
                      pageSummary.currency,
                    )}
                    accent="accent"
                    animateNumeric={false}
                    staggerIndex={4}
                  />
                  <StatCard
                    label="Due for billing"
                    value={pageSummary.dueForBillingCount}
                    accent={pageSummary.dueForBillingCount > 0 ? "accent" : "neutral"}
                    staggerIndex={5}
                  />
                </div>
              </section>

              <Card accent="neutral" title="Scout & manage" subtitle="Filter memberships and create new subscriptions">
                <div className="afc-subscriptions-filters">
                  <Input
                    label="Search memberships"
                    value={searchInput}
                    onChange={(event) => {
                      setSearchInput(event.target.value);
                      setPage(1);
                      setSuccessMessage("");
                    }}
                    placeholder="Athlete, email, or phone"
                    hint="Server-side search across athlete name, email, and phone."
                  />
                  <Select
                    label="Status"
                    value={statusFilter}
                    options={SUBSCRIPTION_STATUS_FILTER_OPTIONS}
                    onChange={(value) =>
                      handleFilterChange(setStatusFilter, value as SubscriptionStatusFilter)
                    }
                    usePlaceholderOption={false}
                  />
                  <Select
                    label="Athlete"
                    value={clientFilter}
                    options={clientFilterOptions}
                    onChange={(value) => handleFilterChange(setClientFilter, value)}
                    usePlaceholderOption={false}
                  />
                  <Select
                    label="Plan"
                    value={planFilter}
                    options={planFilterOptions}
                    onChange={(value) => handleFilterChange(setPlanFilter, value)}
                    usePlaceholderOption={false}
                    hint="Filters the current loaded page only."
                  />
                  <div className="afc-subscriptions-filters__actions">
                    <Button type="button" variant="secondary" size="md" onClick={handleRetry}>
                      Refresh
                    </Button>
                    <Button type="button" variant="primary" size="md" onClick={openCreateModal}>
                      Create subscription
                    </Button>
                  </div>
                </div>
              </Card>

              {hasSubscriptions ? (
                showingFilteredEmpty ? (
                  <EmptyState message="No subscriptions match the current page filters." />
                ) : (
                  <>
                    <div className="hidden xl:block afc-surface afc-roster-board p-0">
                      <div className="afc-roster-scroll overflow-x-auto">
                        <table className="afc-data-table w-full min-w-[72rem] text-left">
                          <thead>
                            <tr className="border-b border-afc-border-grey/70 bg-afc-black/30">
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Athlete</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Plan</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Status</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Start</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">End</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Next billing</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Monthly price</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Updated</th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedSubscriptions.map((subscription, index) => (
                              <tr
                                key={subscription.id}
                                className="afc-animate-row border-b border-afc-border-grey/50 last:border-b-0 hover:bg-white/[0.02]"
                                style={{ animationDelay: `${index * 35}ms` }}
                              >
                                <td className="px-4 py-3.5">
                                  <p className="font-medium text-afc-white">
                                    {getClientName(subscription)}
                                  </p>
                                  <p className="text-sm text-afc-soft-grey">
                                    {getClientEmail(subscription)}
                                  </p>
                                </td>
                                <td className="px-4 py-3.5 text-sm text-afc-white">
                                  {subscription.plan?.name ?? "No plan assigned"}
                                  <p className="text-xs text-afc-muted">
                                    {subscription.plan
                                      ? `${subscription.plan.sessionsPerWeek} sessions/week`
                                      : "—"}
                                  </p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <SubscriptionStatusBadge status={subscription.status} />
                                </td>
                                <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
                                  {formatSubscriptionDate(subscription.startDate)}
                                </td>
                                <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
                                  {formatSubscriptionDate(subscription.endDate)}
                                </td>
                                <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
                                  {formatSubscriptionDate(subscription.nextBillingDate)}
                                </td>
                                <td className="px-4 py-3.5 text-sm font-medium text-afc-gold">
                                  {subscription.plan
                                    ? formatSubscriptionMoney(
                                        subscription.plan.monthlyPrice,
                                        subscription.plan.currency,
                                      )
                                    : "—"}
                                </td>
                                <td className="px-4 py-3.5 text-sm text-afc-soft-grey">
                                  {formatSubscriptionDate(subscription.updatedAt)}
                                </td>
                                <td className="px-4 py-3.5">
                                  <SubscriptionActions
                                    subscription={subscription}
                                    clientName={getClientName(subscription)}
                                    busy={mutationLoading}
                                    onUpdate={openUpdateModal}
                                    onCancel={openCancelModal}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4 xl:hidden">
                      {displayedSubscriptions.map((subscription, index) => (
                        <SubscriptionMobileCard
                          key={subscription.id}
                          subscription={subscription}
                          clientName={getClientName(subscription)}
                          clientEmail={getClientEmail(subscription)}
                          busy={mutationLoading}
                          onUpdate={openUpdateModal}
                          onCancel={openCancelModal}
                          rowIndex={index}
                        />
                      ))}
                    </div>
                  </>
                )
              ) : (
                <EmptyState
                  variant="generic"
                  message="No subscriptions found for the current filters."
                />
              )}

              {pagination && pagination.totalPages > 1 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-afc-muted">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(pagination.totalPages, current + 1),
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <CreateSubscriptionModal
        key={`workspace-create-${createModalKey}`}
        open={createModalOpen}
        clients={clients}
        presetClientId={clientFilter || undefined}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          handleRetry();
        }}
      />

      <UpdateSubscriptionModal
        key={`workspace-update-${updateModalKey}`}
        open={updateModalOpen}
        subscription={updateTarget}
        clientName={updateTarget ? getClientName(updateTarget) : ""}
        onClose={() => setUpdateModalOpen(false)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          setUpdateTarget(null);
          handleRetry();
        }}
      />

      <CancelSubscriptionConfirmModal
        open={cancelModalOpen}
        subscription={cancelTarget}
        clientName={cancelTarget ? getClientName(cancelTarget) : ""}
        loading={mutationLoading}
        onCancel={() => {
          if (!mutationLoading) {
            setCancelModalOpen(false);
            setCancelTarget(null);
          }
        }}
        onConfirm={() => void confirmCancel()}
      />
    </AppShell>
  );
}

export default function OwnerSubscriptionsPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <Suspense fallback={<LoadingState message="Loading membership workspace..." />}>
        <SubscriptionsContent />
      </Suspense>
    </AuthGuard>
  );
}
