import { PlayerCard } from "@/components/ui/PlayerCard";
import { LiveStatusBadge } from "@/components/ui/StatCard";
import {
  formatClientDate,
  subscriptionStatusVariant,
} from "@/lib/client-utils";
import type { ClientMeData } from "@/types/api";

interface ClientHeroCardProps {
  data: ClientMeData;
}

export function ClientHeroCard({ data }: ClientHeroCardProps) {
  const subscription = data.activeSubscription;
  const planName =
    subscription?.plan.name ?? data.assignedPlan?.name ?? "No plan";

  const chips: { label: string; value: string; tone?: "green" | "default" }[] = [
    { label: "Plan", value: planName },
  ];

  if (subscription?.nextBillingDate) {
    chips.push({
      label: "Next billing",
      value: formatClientDate(subscription.nextBillingDate),
      tone: "green",
    });
  }

  if (data.profile?.activityLevel) {
    chips.push({
      label: "Activity",
      value: data.profile.activityLevel,
    });
  }

  if (latestWeight(data)) {
    chips.push({ label: "Weight", value: latestWeight(data)! });
  }

  return (
    <div className="afc-client-hero space-y-4 p-5 sm:p-6">
      <div className="relative z-[1] flex flex-wrap items-center gap-2">
        <LiveStatusBadge label="LIVE DATA" />
      </div>
      <div className="relative z-[1]">
      <PlayerCard
        name={data.user.fullName}
        subtitle={data.profile?.fitnessGoal ? `Goal · ${data.profile.fitnessGoal}` : undefined}
        role="Athlete"
        statusBadge={
          subscription
            ? {
                label: subscription.status,
                variant: subscriptionStatusVariant(subscription.status),
              }
            : { label: "No membership", variant: "outline" }
        }
        planLabel={planName}
        goal={data.profile?.fitnessGoal}
        chips={chips}
        accent="green"
        avatarStatus="active"
      />
      </div>
    </div>
  );
}

function latestWeight(data: ClientMeData) {
  const weight = data.latestBodyMeasurement?.weightKg;
  return weight ? `${weight} kg` : null;
}
