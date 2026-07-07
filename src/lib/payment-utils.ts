import type {
  MonthSelection,
  OwnerPayment,
  OwnerPaymentsSummary,
  PaymentMethod,
  PaymentPageSummary,
  PaymentStatus,
} from "@/types/api";

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const RECEIVED_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "OMT", label: "OMT" },
];

export const CREATE_PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Overdue" },
];

const RECEIVED_METHOD_LABELS: Record<string, string> = {
  CARD: "Card",
  CASH: "Cash",
  OMT: "OMT",
};

export function getCurrentMonthSelection(): MonthSelection {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthSelectionToInputValue({ year, month }: MonthSelection) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthInputValue(value: string): MonthSelection {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

export function shiftMonthSelection(
  { year, month }: MonthSelection,
  delta: number,
): MonthSelection {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function formatMonthLabel({ year, month }: MonthSelection) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getMonthDateRange({ year, month }: MonthSelection) {
  const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const toDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { fromDate, toDate };
}

export function defaultDueDateForMonth({ year, month }: MonthSelection) {
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;

  if (isCurrentMonth) {
    return now.toISOString().slice(0, 10);
  }

  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export function formatPaymentDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatBillingMonth(dueDate: string | null | undefined) {
  if (!dueDate) return "No billing month";
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatMonthlyStatusLabel(
  status: PaymentStatus,
  dueDate: string | null | undefined,
) {
  const monthName = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", { month: "long" })
    : "this month";

  switch (status) {
    case "PAID":
      return `Paid for ${monthName}`;
    case "UNPAID":
      return `Not paid for ${monthName}`;
    case "PARTIAL":
      return `Partially paid for ${monthName}`;
    case "OVERDUE":
      return `Overdue for ${monthName}`;
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function requiresReceivedMethod(status: PaymentStatus) {
  return status === "PAID" || status === "PARTIAL";
}

export function isRecordedReceivedMethod(method: string) {
  return method === "CARD" || method === "CASH" || method === "OMT";
}

export function formatReceivedThrough(payment: OwnerPayment) {
  const { status, paymentMethod } = payment;

  if (status === "UNPAID" || status === "OVERDUE" || status === "CANCELLED") {
    if (isRecordedReceivedMethod(paymentMethod)) {
      return `Previously recorded · ${RECEIVED_METHOD_LABELS[paymentMethod]}`;
    }
    return "Pending receipt";
  }

  if (status === "PAID" || status === "PARTIAL") {
    if (isRecordedReceivedMethod(paymentMethod)) {
      return `Received through ${RECEIVED_METHOD_LABELS[paymentMethod]}`;
    }
    return "Method not recorded";
  }

  return "Pending receipt";
}

export function formatPaymentMoney(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${currency} ${amount}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function paymentStatusBadgeVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "PAID":
      return "success";
    case "UNPAID":
    case "PARTIAL":
      return "warning";
    case "OVERDUE":
      return "danger";
    case "CANCELLED":
      return "neutral";
    default:
      return "neutral";
  }
}

export function paymentCardAccentClass(status: string) {
  switch (status) {
    case "PAID":
      return "afc-payment-card--paid";
    case "OVERDUE":
      return "afc-payment-card--overdue";
    case "UNPAID":
    case "PARTIAL":
      return "afc-payment-card--pending";
    default:
      return "afc-payment-card--neutral";
  }
}

export function computePaymentPageSummary(items: OwnerPayment[]): PaymentPageSummary {
  let paidAmount = 0;
  let unpaidAmount = 0;
  let partialAmount = 0;
  let overdueAmount = 0;
  let totalAmount = 0;
  const currency = items[0]?.currency ?? "USD";

  for (const payment of items) {
    const amount = Number(payment.amount);
    if (Number.isNaN(amount)) continue;

    totalAmount += amount;

    if (payment.status === "PAID") {
      paidAmount += amount;
    } else if (payment.status === "UNPAID") {
      unpaidAmount += amount;
    } else if (payment.status === "PARTIAL") {
      partialAmount += amount;
    } else if (payment.status === "OVERDUE") {
      overdueAmount += amount;
    }
  }

  const collectionRate =
    totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return {
    totalCount: items.length,
    paidAmount,
    unpaidAmount,
    partialAmount,
    overdueAmount,
    totalAmount,
    collectionRate,
    currency,
  };
}

export type PaymentSummaryDisplay = {
  totalPayments: number;
  paidAmount: string;
  unpaidAmount: string;
  partialAmount: string;
  outstandingAmount: string;
  overdueAmount: string;
  collectionRate: number;
  currency: string;
  currencyMixed: boolean;
  source: "filtered" | "page";
};

function pageSummaryToDisplay(page: PaymentPageSummary): PaymentSummaryDisplay {
  const outstanding =
    page.unpaidAmount + page.partialAmount + page.overdueAmount;

  return {
    totalPayments: page.totalCount,
    paidAmount: page.paidAmount.toFixed(2),
    unpaidAmount: page.unpaidAmount.toFixed(2),
    partialAmount: page.partialAmount.toFixed(2),
    outstandingAmount: outstanding.toFixed(2),
    overdueAmount: page.overdueAmount.toFixed(2),
    collectionRate: page.collectionRate,
    currency: page.currency,
    currencyMixed: false,
    source: "page",
  };
}

function apiSummaryToDisplay(summary: OwnerPaymentsSummary): PaymentSummaryDisplay {
  return {
    totalPayments: summary.totalPayments,
    paidAmount: summary.paidAmount,
    unpaidAmount: summary.unpaidAmount,
    partialAmount: summary.partialAmount,
    outstandingAmount: summary.outstandingAmount,
    overdueAmount: summary.overdueAmount,
    collectionRate: summary.collectionRate,
    currency: summary.currency,
    currencyMixed: summary.currencyMixed,
    source: "filtered",
  };
}

export function resolvePaymentsSummaryDisplay(
  apiSummary: OwnerPaymentsSummary | null | undefined,
  pageItems: OwnerPayment[],
): PaymentSummaryDisplay {
  if (apiSummary?.scope === "filtered") {
    return apiSummaryToDisplay(apiSummary);
  }

  return pageSummaryToDisplay(computePaymentPageSummary(pageItems));
}

export function resolvePaymentSummaryLabel(options: {
  summaryDisplay: PaymentSummaryDisplay;
  localSearchActive: boolean;
  hasDateFilter: boolean;
}): string {
  if (options.summaryDisplay.source === "page") {
    return options.localSearchActive
      ? "Current page search summary"
      : "Current page summary";
  }

  if (options.hasDateFilter) {
    return "Filtered month summary";
  }

  return "Filtered summary";
}

export function buildPaymentsUrl(options: {
  page: number;
  limit: number;
  status?: string;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const params = new URLSearchParams({
    page: String(options.page),
    limit: String(options.limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.clientId) params.set("clientId", options.clientId);
  if (options.fromDate) params.set("fromDate", options.fromDate);
  if (options.toDate) params.set("toDate", options.toDate);

  return `/api/owner/payments?${params.toString()}`;
}

export function resolvePaymentErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function getAvailableStatusActions(currentStatus: PaymentStatus) {
  const actions: {
    status: PaymentStatus;
    label: string;
    variant: "primary" | "secondary" | "danger" | "ghost";
  }[] = [];

  if (currentStatus !== "PAID") {
    actions.push({ status: "PAID", label: "Mark paid", variant: "primary" });
  }
  if (currentStatus !== "UNPAID") {
    actions.push({ status: "UNPAID", label: "Mark unpaid", variant: "secondary" });
  }
  if (currentStatus !== "OVERDUE" && currentStatus !== "CANCELLED") {
    actions.push({ status: "OVERDUE", label: "Mark overdue", variant: "danger" });
  }
  if (currentStatus !== "PARTIAL" && currentStatus !== "PAID" && currentStatus !== "CANCELLED") {
    actions.push({ status: "PARTIAL", label: "Mark partial", variant: "ghost" });
  }
  if (currentStatus !== "CANCELLED") {
    actions.push({ status: "CANCELLED", label: "Cancel", variant: "ghost" });
  }

  return actions;
}

export function statusUpdateConfirmTitle(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "Mark this payment as paid";
    case "UNPAID":
      return "Mark payment as unpaid?";
    case "OVERDUE":
      return "Mark payment as overdue?";
    case "PARTIAL":
      return "Mark this payment as partial";
    case "CANCELLED":
      return "Cancel this payment?";
    default:
      return "Update payment status?";
  }
}

export function statusUpdateConfirmCopy(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "Record how the payment was received. This reflects the actual method the client used.";
    case "PARTIAL":
      return "Record how the partial payment was received.";
    case "CANCELLED":
      return "This payment will be marked cancelled and kept in the historical record.";
    case "OVERDUE":
      return "This flags the payment as overdue for follow-up.";
    default:
      return "The payment status will be updated on the athlete record.";
  }
}

export function toIsoDateTimeFromDateInput(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

export function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}
