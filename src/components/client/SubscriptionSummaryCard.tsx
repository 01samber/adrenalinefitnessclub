import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import {
  formatClientCurrency,
  formatClientDate,
  subscriptionStatusVariant,
} from "@/lib/client-utils";
import type { ClientSubscription } from "@/types/api";

interface SubscriptionSummaryCardProps {
  subscription: ClientSubscription | null;
  assignedPlanName?: string | null;
}

export function SubscriptionSummaryCard({
  subscription,
  assignedPlanName,
}: SubscriptionSummaryCardProps) {
  const plan = subscription?.plan;

  return (
    <Card
      accent="green"
      title="Membership status"
      subtitle="Your active training plan"
      headerAction={
        subscription ? (
          <Badge variant={subscriptionStatusVariant(subscription.status)}>
            {subscription.status}
          </Badge>
        ) : (
          <Badge variant="outline">None</Badge>
        )
      }
      hover
    >
      {subscription && plan ? (
        <>
          <div className="mb-4 rounded-xl border border-afc-green/25 bg-afc-green/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-afc-soft-grey">
              Next billing date
            </p>
            <p className="mt-1 text-lg font-bold text-afc-green">
              {formatClientDate(subscription.nextBillingDate)}
            </p>
          </div>
          <DataRow label="Plan" value={plan.name ?? assignedPlanName ?? "—"} />
          <DataRow
            label="Sessions / week"
            value={String(plan.sessionsPerWeek)}
          />
          <DataRow
            label="Monthly price"
            value={formatClientCurrency(plan.monthlyPrice, plan.currency)}
          />
          <DataRow label="Start date" value={formatClientDate(subscription.startDate)} />
          <DataRow label="End date" value={formatClientDate(subscription.endDate)} />
          <DataRow
            label="Auto-renew"
            value={subscription.autoRenew ? "Yes" : "No"}
          />
        </>
      ) : (
        <EmptyState message="No active subscription on file." />
      )}
    </Card>
  );
}
