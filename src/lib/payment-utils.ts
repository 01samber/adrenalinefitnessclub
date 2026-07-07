import type { PaymentMethod, PaymentPageSummary, PaymentStatus, OwnerPayment } from "@/types/api";

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "WHISH", label: "Whish" },
  { value: "OMT", label: "OMT" },
  { value: "OTHER", label: "Other" },
];

export const CREATE_PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Overdue" },
];

export function formatPaymentDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export function formatPaymentMethod(method: string) {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
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
  let pendingAmount = 0;
  let overdueAmount = 0;
  const currency = items[0]?.currency ?? "USD";

  for (const payment of items) {
    const amount = Number(payment.amount);
    if (Number.isNaN(amount)) continue;

    if (payment.status === "PAID") {
      paidAmount += amount;
    } else if (payment.status === "OVERDUE") {
      overdueAmount += amount;
    } else if (
      payment.status === "UNPAID" ||
      payment.status === "PARTIAL"
    ) {
      pendingAmount += amount;
    }
  }

  return {
    totalCount: items.length,
    paidAmount,
    pendingAmount,
    overdueAmount,
    currency,
  };
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
  const actions: { status: PaymentStatus; label: string; variant: "primary" | "secondary" | "danger" | "ghost" }[] = [];

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
      return "Mark payment as paid?";
    case "UNPAID":
      return "Mark payment as unpaid?";
    case "OVERDUE":
      return "Mark payment as overdue?";
    case "PARTIAL":
      return "Mark payment as partial?";
    case "CANCELLED":
      return "Cancel this payment?";
    default:
      return "Update payment status?";
  }
}

export function statusUpdateConfirmCopy(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "This will record the payment as received. Paid date will be set automatically if not already recorded.";
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
