import { ApiClientError } from "@/lib/api-client";
import type {
  OwnerSubscriptionListItem,
  SubscriptionPageSummary,
  SubscriptionStatus,
  SubscriptionStatusFilter,
} from "@/types/api";

export const SUBSCRIPTION_STATUS_OPTIONS: {
  value: SubscriptionStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
  { value: "FROZEN", label: "Frozen" },
];

export const SUBSCRIPTION_STATUS_FILTER_OPTIONS: {
  value: SubscriptionStatusFilter;
  label: string;
}[] = [
  { value: "", label: "All statuses" },
  ...SUBSCRIPTION_STATUS_OPTIONS,
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function defaultNextBillingDate(startDate: string) {
  if (!DATE_PATTERN.test(startDate)) return todayDateInputValue();
  const start = new Date(`${startDate}T00:00:00`);
  start.setDate(start.getDate() + 30);
  return start.toISOString().slice(0, 10);
}

export function formatSubscriptionDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSubscriptionMoney(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatSubscriptionStatus(status: string) {
  return (
    SUBSCRIPTION_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function subscriptionStatusBadgeVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "CANCELLED":
      return "neutral";
    case "EXPIRED":
      return "danger";
    case "FROZEN":
      return "warning";
    default:
      return "neutral";
  }
}

export function subscriptionCardAccentClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "afc-subscription-card--active";
    case "CANCELLED":
      return "afc-subscription-card--cancelled";
    case "EXPIRED":
      return "afc-subscription-card--expired";
    case "FROZEN":
      return "afc-subscription-card--frozen";
    default:
      return "afc-subscription-card--neutral";
  }
}

export function isRenewableSubscriptionStatus(status: string) {
  return status === "CANCELLED" || status === "EXPIRED";
}

export function canCancelSubscription(status: string) {
  return status === "ACTIVE" || status === "FROZEN";
}

export function canUpdateSubscription(status: string) {
  return status !== "CANCELLED";
}

export function buildSubscriptionsUrl(params: {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  clientId?: string;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.clientId) search.set("clientId", params.clientId);
  const query = search.toString();
  return query ? `/api/owner/subscriptions?${query}` : "/api/owner/subscriptions";
}

export function computeSubscriptionPageSummary(
  items: OwnerSubscriptionListItem[],
): SubscriptionPageSummary {
  const today = todayDateInputValue();
  let activeMonthlyValue = 0;
  let currency = "USD";
  let dueForBillingCount = 0;

  const counts = {
    activeCount: 0,
    cancelledCount: 0,
    expiredCount: 0,
    frozenCount: 0,
  };

  for (const item of items) {
    switch (item.status) {
      case "ACTIVE":
        counts.activeCount += 1;
        currency = item.plan.currency || currency;
        activeMonthlyValue += Number(item.plan.monthlyPrice) || 0;
        if (item.nextBillingDate.slice(0, 10) <= today) {
          dueForBillingCount += 1;
        }
        break;
      case "CANCELLED":
        counts.cancelledCount += 1;
        break;
      case "EXPIRED":
        counts.expiredCount += 1;
        break;
      case "FROZEN":
        counts.frozenCount += 1;
        break;
      default:
        break;
    }
  }

  return {
    totalCount: items.length,
    ...counts,
    activeMonthlyValue,
    dueForBillingCount,
    currency,
  };
}

export function resolveSubscriptionErrorMessage(
  error: unknown,
  fallback = "Unable to complete subscription action. Please try again.",
): string {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
