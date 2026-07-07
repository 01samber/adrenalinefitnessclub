import { formatBillingMonth, formatMonthlyStatusLabel, formatReceivedThrough } from "@/lib/payment-utils";
import type { OwnerPayment } from "@/types/api";

export function ReceivedThroughBadge({ payment }: { payment: OwnerPayment }) {
  const label = formatReceivedThrough(payment);

  if (label === "Pending receipt") {
    return <span className="afc-payment-method-pending">{label}</span>;
  }

  if (label === "Method not recorded") {
    return <span className="afc-payment-method-missing">{label}</span>;
  }

  return <span className="afc-payment-method-recorded">{label}</span>;
}

export function MonthlyStatusLabel({ payment }: { payment: OwnerPayment }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-afc-white">
        {formatMonthlyStatusLabel(payment.status, payment.dueDate)}
      </p>
      <p className="text-xs text-afc-muted">
        Billing month: {formatBillingMonth(payment.dueDate)}
      </p>
    </div>
  );
}
