import { Badge } from "@/components/ui/Badge";
import {
  formatSubscriptionStatus,
  subscriptionStatusBadgeVariant,
} from "@/lib/subscription-utils";

interface SubscriptionStatusBadgeProps {
  status: string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  return (
    <Badge variant={subscriptionStatusBadgeVariant(status)}>
      {formatSubscriptionStatus(status)}
    </Badge>
  );
}
