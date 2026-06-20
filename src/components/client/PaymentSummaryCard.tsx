import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import {
  formatClientCurrency,
  formatClientDate,
  isPaymentAttention,
  paymentStatusVariant,
} from "@/lib/client-utils";
import type { ClientPayment } from "@/types/api";

interface PaymentSummaryCardProps {
  latestPayment: ClientPayment | null;
  recentPayments: ClientPayment[];
}

function PaymentTimelineItem({ payment }: { payment: ClientPayment }) {
  return (
    <li className="afc-surface rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-afc-white">
            {formatClientCurrency(payment.amount, payment.currency)}
          </p>
          <p className="mt-1 text-xs text-afc-soft-grey">
            Due {formatClientDate(payment.dueDate)}
            {payment.paymentDate
              ? ` · Paid ${formatClientDate(payment.paymentDate)}`
              : ""}
          </p>
        </div>
        <Badge variant={paymentStatusVariant(payment.status)}>
          {payment.status}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-afc-soft-grey">{payment.paymentMethod}</p>
    </li>
  );
}

export function PaymentSummaryCard({
  latestPayment,
  recentPayments,
}: PaymentSummaryCardProps) {
  const paymentStatus = latestPayment?.status ?? null;
  const needsAttention = isPaymentAttention(paymentStatus);

  return (
    <Card
      accent={needsAttention ? "red" : "neutral"}
      title="Payment record"
      subtitle="Latest status and recent history"
      headerAction={
        paymentStatus ? (
          <Badge variant={paymentStatusVariant(paymentStatus)}>
            {paymentStatus}
          </Badge>
        ) : undefined
      }
    >
      {latestPayment ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataRow
              label="Latest amount"
              value={formatClientCurrency(
                latestPayment.amount,
                latestPayment.currency,
              )}
            />
            <DataRow label="Due date" value={formatClientDate(latestPayment.dueDate)} />
            <DataRow
              label="Paid on"
              value={formatClientDate(latestPayment.paymentDate)}
            />
            <DataRow label="Method" value={latestPayment.paymentMethod} />
          </div>

          {recentPayments.length > 1 ? (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-afc-soft-grey">
                Recent payments
              </p>
              <ul className="space-y-3">
                {recentPayments.slice(0, 5).map((payment) => (
                  <PaymentTimelineItem key={payment.id} payment={payment} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState message="No payment records yet." />
      )}
    </Card>
  );
}
