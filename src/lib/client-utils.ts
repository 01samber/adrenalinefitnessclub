export function formatClientDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatClientDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatClientCurrency(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function paymentStatusVariant(
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

export function subscriptionStatusVariant(
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

export function bookingStatusVariant(
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

export function progressNoteVariant(
  noteType: string,
): "success" | "danger" | "warning" | "neutral" | "outline" {
  switch (noteType) {
    case "IMPROVEMENT":
      return "success";
    case "WARNING":
      return "danger";
    case "RECOMMENDATION":
      return "warning";
    default:
      return "outline";
  }
}

export function isPaymentAttention(status: string | null | undefined) {
  return (
    status === "UNPAID" || status === "OVERDUE" || status === "PARTIAL"
  );
}
