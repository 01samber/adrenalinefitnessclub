"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CreatePaymentModal } from "@/components/owner/CreatePaymentModal";
import { MonthlyStatusLabel, ReceivedThroughBadge } from "@/components/owner/PaymentDisplayHelpers";
import { PaymentMonthSelector } from "@/components/owner/PaymentMonthSelector";
import { PaymentStatusConfirmModal } from "@/components/owner/PaymentStatusConfirmModal";
import { PaymentsAmbientBackground } from "@/components/owner/PaymentsAmbientBackground";
import { PaymentsWorkspaceSkeleton } from "@/components/owner/PaymentsWorkspaceSkeleton";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
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
  PAYMENT_STATUS_OPTIONS,
  buildPaymentsUrl,
  computePaymentPageSummary,
  formatBillingMonth,
  formatMonthlyStatusLabel,
  formatPaymentDate,
  formatPaymentMoney,
  getAvailableStatusActions,
  getCurrentMonthSelection,
  getMonthDateRange,
  paymentCardAccentClass,
  paymentStatusBadgeVariant,
  resolvePaymentErrorMessage,
} from "@/lib/payment-utils";
import type {
  MonthSelection,
  OwnerClientListItem,
  OwnerClientsData,
  OwnerPayment,
  OwnerPaymentsResponse,
  OwnerSubscriptionListItem,
  OwnerSubscriptionsResponse,
  PaymentStatus,
  PaymentStatusFilter,
  PaymentMethod,
  UpdatePaymentStatusResponse,
} from "@/types/api";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;
const CLIENT_FETCH_LIMIT = 100;
const SUBSCRIPTION_FETCH_LIMIT = 100;

function PaymentActions({
  payment,
  clientName,
  updatingPaymentId,
  onStatusAction,
}: {
  payment: OwnerPayment;
  clientName: string;
  updatingPaymentId: string | null;
  onStatusAction: (payment: OwnerPayment, status: PaymentStatus) => void;
}) {
  const actions = getAvailableStatusActions(payment.status);
  const busy = updatingPaymentId === payment.id;

  return (
    <div className="afc-payment-actions">
      <Link href={`/owner/clients/${payment.clientId}`}>
        <Button type="button" variant="ghost" size="sm" className="min-h-[44px]">
          Open profile
        </Button>
      </Link>
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          variant={action.variant}
          size="sm"
          className="min-h-[44px]"
          disabled={busy}
          onClick={() => onStatusAction(payment, action.status)}
        >
          {busy ? "Updating..." : action.label}
        </Button>
      ))}
      <span className="sr-only">Actions for {clientName}</span>
    </div>
  );
}

function PaymentMobileCard({
  payment,
  clientName,
  clientEmail,
  planLabel,
  updatingPaymentId,
  onStatusAction,
  rowIndex = 0,
}: {
  payment: OwnerPayment;
  clientName: string;
  clientEmail: string;
  planLabel: string;
  updatingPaymentId: string | null;
  onStatusAction: (payment: OwnerPayment, status: PaymentStatus) => void;
  rowIndex?: number;
}) {
  return (
    <article
      className={`afc-payment-card ${paymentCardAccentClass(payment.status)} afc-animate-row p-5`}
      style={{ animationDelay: `${rowIndex * 45}ms` }}
    >
      <div className="afc-payment-card__header">
        <div className="min-w-0">
          <p className="truncate font-semibold text-afc-white">{clientName}</p>
          <p className="mt-0.5 truncate text-sm text-afc-soft-grey">{clientEmail}</p>
        </div>
        <Badge variant={paymentStatusBadgeVariant(payment.status)}>
          {payment.status}
        </Badge>
      </div>

      <p className="afc-payment-card__amount mt-4">
        {formatPaymentMoney(payment.amount, payment.currency)}
      </p>

      <div className="mt-3">
        <MonthlyStatusLabel payment={payment} />
      </div>

      <dl className="afc-payment-card__meta">
        <div className="afc-payment-card__row">
          <dt>Due date</dt>
          <dd>{formatPaymentDate(payment.dueDate)}</dd>
        </div>
        <div className="afc-payment-card__row">
          <dt>Paid date</dt>
          <dd>{formatPaymentDate(payment.paymentDate)}</dd>
        </div>
        <div className="afc-payment-card__row">
          <dt>Plan</dt>
          <dd>{planLabel}</dd>
        </div>
        <div className="afc-payment-card__row">
          <dt>Received through</dt>
          <dd>
            <ReceivedThroughBadge payment={payment} />
          </dd>
        </div>
      </dl>

      <div className="afc-payment-card__actions">
        <PaymentActions
          payment={payment}
          clientName={clientName}
          updatingPaymentId={updatingPaymentId}
          onStatusAction={onStatusAction}
        />
      </div>
    </article>
  );
}

function PaymentsContent() {
  const [selectedMonth, setSelectedMonth] = useState<MonthSelection>(
    getCurrentMonthSelection,
  );
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("");
  const [clientFilter, setClientFilter] = useState("");
  const [advancedFromDate, setAdvancedFromDate] = useState("");
  const [advancedToDate, setAdvancedToDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const monthRange = useMemo(
    () => getMonthDateRange(selectedMonth),
    [selectedMonth],
  );
  const fromDate = advancedFromDate || monthRange.fromDate;
  const toDate = advancedToDate || monthRange.toDate;

  const [paymentsData, setPaymentsData] = useState<OwnerPaymentsResponse | null>(null);
  const [clients, setClients] = useState<OwnerClientListItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<OwnerSubscriptionListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalKey, setCreateModalKey] = useState(0);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<OwnerPayment | null>(null);
  const [nextStatus, setNextStatus] = useState<PaymentStatus | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchReferenceData() {
      try {
        const [clientsResult, subscriptionsResult] = await Promise.all([
          apiGet<OwnerClientsData>(
            `/api/owner/clients?limit=${CLIENT_FETCH_LIMIT}&page=1`,
          ),
          apiGet<OwnerSubscriptionsResponse>(
            `/api/owner/subscriptions?limit=${SUBSCRIPTION_FETCH_LIMIT}&page=1`,
          ),
        ]);

        if (!cancelled) {
          setClients(clientsResult.items);
          setSubscriptions(subscriptionsResult.items);
        }
      } catch {
        if (!cancelled) {
          setClients([]);
          setSubscriptions([]);
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

    async function fetchPayments() {
      setError("");
      setLoading(true);

      try {
        const result = await apiGet<OwnerPaymentsResponse>(
          buildPaymentsUrl({
            page,
            limit: PAGE_SIZE,
            status: statusFilter || undefined,
            clientId: clientFilter || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }),
        );

        if (!cancelled) {
          setPaymentsData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError("You do not have permission to view payments.");
          } else {
            setError(resolvePaymentErrorMessage(err));
          }
          setPaymentsData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPayments();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, clientFilter, fromDate, toDate, reloadKey, selectedMonth]);

  const clientMap = useMemo(() => {
    const map = new Map<string, OwnerClientListItem>();
    for (const client of clients) {
      map.set(client.user.id, client);
    }
    return map;
  }, [clients]);

  const subscriptionMap = useMemo(() => {
    const map = new Map<string, OwnerSubscriptionListItem>();
    for (const subscription of subscriptions) {
      map.set(subscription.id, subscription);
    }
    return map;
  }, [subscriptions]);

  const displayedPayments = useMemo(() => {
    const items = paymentsData?.items ?? [];
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter((payment) => {
      const client = clientMap.get(payment.clientId);
      if (!client) return false;
      return (
        client.user.fullName.toLowerCase().includes(query) ||
        client.user.email.toLowerCase().includes(query)
      );
    });
  }, [paymentsData?.items, debouncedSearch, clientMap]);

  const pageSummary = useMemo(
    () => computePaymentPageSummary(displayedPayments),
    [displayedPayments],
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

  function getClientLabel(clientId: string) {
    const client = clientMap.get(clientId);
    return client?.user.fullName ?? "Unknown athlete";
  }

  function getClientEmail(clientId: string) {
    const client = clientMap.get(clientId);
    return client?.user.email ?? "—";
  }

  function getPlanLabel(payment: OwnerPayment) {
    if (!payment.subscriptionId) return "—";
    const subscription = subscriptionMap.get(payment.subscriptionId);
    return subscription?.plan?.name ?? "Linked subscription";
  }

  function handleRetry() {
    setReloadKey((key) => key + 1);
  }

  function handleRefresh() {
    setSuccessMessage("");
    handleRetry();
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

  function handleStatusAction(payment: OwnerPayment, status: PaymentStatus) {
    setStatusTarget(payment);
    setNextStatus(status);
    setStatusModalOpen(true);
  }

  function handleMonthChange(month: MonthSelection) {
    setSelectedMonth(month);
    setAdvancedFromDate("");
    setAdvancedToDate("");
    setPage(1);
    setSuccessMessage("");
  }

  async function confirmStatusUpdate(paymentMethod?: PaymentMethod) {
    if (!statusTarget || !nextStatus) return;

    setStatusUpdating(true);
    setUpdatingPaymentId(statusTarget.id);
    setSuccessMessage("");

    try {
      await apiPatch<UpdatePaymentStatusResponse>(
        `/api/owner/payments/${statusTarget.id}/status`,
        {
          status: nextStatus,
          ...(paymentMethod ? { paymentMethod } : {}),
        },
      );
      setSuccessMessage(`Payment marked as ${nextStatus.toLowerCase()}.`);
      setStatusModalOpen(false);
      setStatusTarget(null);
      setNextStatus(null);
      handleRetry();
    } catch (err) {
      setError(resolvePaymentErrorMessage(err));
    } finally {
      setStatusUpdating(false);
      setUpdatingPaymentId(null);
    }
  }

  const pagination = paymentsData?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const hasPayments = (paymentsData?.items.length ?? 0) > 0;
  const showingFilteredEmpty =
    hasPayments && displayedPayments.length === 0 && debouncedSearch.trim().length > 0;
  const summaryLabel =
    pagination && pagination.totalPages <= 1
      ? "Selected month summary"
      : "Current page summary";

  return (
    <AppShell
      title="Monthly Payment Ledger"
      subtitle="Track who paid, who is pending, and how much revenue is still outstanding."
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      <div className="afc-payments-page afc-page-stack relative space-y-6 sm:space-y-8">
        <PaymentsAmbientBackground />

        <div className="relative z-[1] space-y-6 sm:space-y-8">
          {loading ? (
            <PaymentsWorkspaceSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={handleRetry} />
          ) : (
            <>
              <PaymentMonthSelector
                value={selectedMonth}
                onChange={handleMonthChange}
              />

              <HeroBand
                kicker="Revenue desk"
                headline="Monthly payment ledger — see who paid, who is pending, and what is still outstanding."
                detail={
                  pagination
                    ? `${summaryLabel} for selected month — page ${pagination.page} of ${Math.max(pagination.totalPages, 1)} (${pagination.total} record${pagination.total === 1 ? "" : "s"}).`
                    : "Monthly payment ledger ready for review."
                }
                live
                liveLabel="LIVE LEDGER"
                footer={
                  <code className="afc-hero-band__api-chip">GET /api/owner/payments</code>
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
                    <h2 className="afc-section-label">Monthly summary</h2>
                    <p className="mt-1 text-xs text-afc-muted">{summaryLabel}</p>
                  </div>
                </div>
                <div className="afc-stat-grid">
                  <StatCard
                    label="Payments this month"
                    value={pageSummary.totalCount}
                    accent="accent"
                    staggerIndex={0}
                  />
                  <StatCard
                    label="Collected"
                    value={formatPaymentMoney(
                      String(pageSummary.paidAmount),
                      pageSummary.currency,
                    )}
                    accent="success"
                    animateNumeric={false}
                    staggerIndex={1}
                  />
                  <StatCard
                    label="Unpaid / Partial"
                    value={formatPaymentMoney(
                      String(pageSummary.unpaidAmount + pageSummary.partialAmount),
                      pageSummary.currency,
                    )}
                    accent="accent"
                    animateNumeric={false}
                    staggerIndex={2}
                  />
                  <StatCard
                    label="Overdue"
                    value={formatPaymentMoney(
                      String(pageSummary.overdueAmount),
                      pageSummary.currency,
                    )}
                    accent="danger"
                    animateNumeric={false}
                    staggerIndex={3}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Collection rate"
                    value={`${pageSummary.collectionRate}%`}
                    accent={pageSummary.collectionRate >= 70 ? "success" : "accent"}
                    animateNumeric={false}
                    staggerIndex={4}
                  />
                  <StatCard
                    label="Unpaid only"
                    value={formatPaymentMoney(
                      String(pageSummary.unpaidAmount),
                      pageSummary.currency,
                    )}
                    accent="accent"
                    animateNumeric={false}
                    staggerIndex={5}
                  />
                </div>
              </section>

              <Card accent="neutral" title="Scout & collect" subtitle="Filter this month's ledger and record payments">
                <div className="afc-payments-filters">
                  <Input
                    label="Search loaded page"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Athlete name or email"
                    hint="Filters athletes on the current page only"
                  />
                  <Select
                    label="Athlete filter"
                    value={clientFilter}
                    options={clientFilterOptions}
                    onChange={(value) => handleFilterChange(setClientFilter, value)}
                    placeholder="All athletes"
                  />
                  <Select
                    label="Status"
                    value={statusFilter}
                    options={PAYMENT_STATUS_OPTIONS}
                    onChange={(value) =>
                      handleFilterChange(setStatusFilter, value as PaymentStatusFilter)
                    }
                    placeholder="All statuses"
                    id="payment-status-trigger"
                  />
                  <div className="afc-payments-filters__actions flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="min-h-[44px] flex-1 sm:flex-none"
                      onClick={handleRefresh}
                    >
                      Refresh
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="min-h-[44px] flex-1 sm:flex-none"
                      onClick={openCreateModal}
                    >
                      Create payment
                    </Button>
                  </div>
                </div>

                <details className="afc-payments-advanced">
                  <summary>Advanced date range</summary>
                  <div className="afc-payments-advanced__grid">
                    <Input
                      label="Custom due from"
                      type="date"
                      value={advancedFromDate}
                      onChange={(event) =>
                        handleFilterChange(setAdvancedFromDate, event.target.value)
                      }
                      hint="Overrides month range when set"
                    />
                    <Input
                      label="Custom due to"
                      type="date"
                      value={advancedToDate}
                      onChange={(event) =>
                        handleFilterChange(setAdvancedToDate, event.target.value)
                      }
                      hint="Overrides month range when set"
                    />
                  </div>
                </details>
              </Card>

              <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="afc-section-label">Payment ledger</h2>
                  {pagination ? (
                    <p className="text-xs text-afc-muted">
                      Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                    </p>
                  ) : null}
                </div>

                {showingFilteredEmpty ? (
                  <div className="afc-surface p-8 text-center">
                    <p className="text-sm text-afc-soft-grey">
                      No payments on this page match your search.
                    </p>
                  </div>
                ) : !hasPayments ? (
                  <EmptyState
                    variant="payments"
                    message="No payments recorded yet. Create the first payment to start tracking revenue."
                  />
                ) : (
                  <>
                    <div className="hidden xl:block">
                      <div className="afc-surface afc-roster-board">
                        <p className="afc-roster-scroll-hint 2xl:hidden">
                          Scroll sideways to view all payment details
                        </p>
                        <div className="afc-roster-scroll afc-scrollbar">
                          <table className="afc-roster-table afc-data-table w-full min-w-[80rem] text-left">
                            <thead>
                              <tr className="border-b border-afc-border-grey/70 bg-afc-black/30">
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Client
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Amount
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Monthly status
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Due date
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Paid date
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Billing month
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Plan
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Received through
                                </th>
                                <th className="afc-roster-actions-head px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedPayments.map((payment, index) => (
                                <tr
                                  key={payment.id}
                                  className="afc-roster-row afc-roster-row--hover afc-animate-row border-b border-afc-border-grey/50 last:border-b-0"
                                  style={{ animationDelay: `${index * 40}ms` }}
                                >
                                  <td className="px-5 py-4">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-afc-white">
                                        {getClientLabel(payment.clientId)}
                                      </p>
                                      <p className="mt-0.5 truncate text-sm text-afc-soft-grey">
                                        {getClientEmail(payment.clientId)}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 font-semibold text-afc-gold">
                                    {formatPaymentMoney(payment.amount, payment.currency)}
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-2">
                                      <Badge variant={paymentStatusBadgeVariant(payment.status)}>
                                        {payment.status}
                                      </Badge>
                                      <p className="text-xs text-afc-light-grey">
                                        {formatMonthlyStatusLabel(payment.status, payment.dueDate)}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-afc-light-grey">
                                    {formatPaymentDate(payment.dueDate)}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-afc-light-grey">
                                    {formatPaymentDate(payment.paymentDate)}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-afc-light-grey">
                                    {formatBillingMonth(payment.dueDate)}
                                  </td>
                                  <td className="max-w-[10rem] px-4 py-4 text-sm text-afc-light-grey">
                                    <span className="line-clamp-2">{getPlanLabel(payment)}</span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-afc-light-grey">
                                    <ReceivedThroughBadge payment={payment} />
                                  </td>
                                  <td className="afc-roster-actions px-4 py-4">
                                    <PaymentActions
                                      payment={payment}
                                      clientName={getClientLabel(payment.clientId)}
                                      updatingPaymentId={updatingPaymentId}
                                      onStatusAction={handleStatusAction}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 xl:hidden">
                      {displayedPayments.map((payment, index) => (
                        <PaymentMobileCard
                          key={payment.id}
                          payment={payment}
                          clientName={getClientLabel(payment.clientId)}
                          clientEmail={getClientEmail(payment.clientId)}
                          planLabel={getPlanLabel(payment)}
                          updatingPaymentId={updatingPaymentId}
                          onStatusAction={handleStatusAction}
                          rowIndex={index}
                        />
                      ))}
                    </div>
                  </>
                )}

                {totalPages > 1 ? (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-afc-soft-grey">
                      Page {pagination?.page ?? 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="min-h-[44px]"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="min-h-[44px]"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((current) => Math.min(totalPages, current + 1))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>
      </div>

      <CreatePaymentModal
        key={`${createModalKey}-${selectedMonth.year}-${selectedMonth.month}`}
        open={createModalOpen}
        clients={clients}
        selectedMonth={selectedMonth}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          handleRetry();
        }}
      />

      <PaymentStatusConfirmModal
        key={statusTarget && nextStatus ? `${statusTarget.id}-${nextStatus}` : "closed"}
        open={statusModalOpen}
        payment={statusTarget}
        nextStatus={nextStatus}
        clientName={statusTarget ? getClientLabel(statusTarget.clientId) : ""}
        loading={statusUpdating}
        onCancel={() => {
          if (statusUpdating) return;
          setStatusModalOpen(false);
          setStatusTarget(null);
          setNextStatus(null);
        }}
        onConfirm={(paymentMethod) => void confirmStatusUpdate(paymentMethod)}
      />
    </AppShell>
  );
}

export default function OwnerPaymentsPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <PaymentsContent />
    </AuthGuard>
  );
}
