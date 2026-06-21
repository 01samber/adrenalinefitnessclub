import type { Plan, Subscription } from "@prisma/client";
import prisma from "@/lib/prisma";

export type SafeOwnerPlan = {
  id: string;
  name: string;
  sessionsPerWeek: number;
  monthlyPrice: string;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
};

export function toSafeOwnerPlan(plan: Plan): SafeOwnerPlan {
  return {
    id: plan.id,
    name: plan.name,
    sessionsPerWeek: plan.sessionsPerWeek,
    monthlyPrice: plan.monthlyPrice.toString(),
    currency: plan.currency,
    status: plan.isActive ? "ACTIVE" : "INACTIVE",
  };
}

export async function listActiveOwnerPlans() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sessionsPerWeek: "asc" },
  });

  return {
    items: plans.map(toSafeOwnerPlan),
  };
}

export type SafeSubscriptionWithPlan = {
  id: string;
  status: Subscription["status"];
  plan: {
    id: string;
    name: string;
    sessionsPerWeek: number;
    monthlyPrice: string;
    currency: string;
  };
  startDate: string;
  nextBillingDate: string;
};

export function toSafeSubscriptionWithPlan(
  subscription: Subscription & { plan: Plan },
): SafeSubscriptionWithPlan {
  return {
    id: subscription.id,
    status: subscription.status,
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      sessionsPerWeek: subscription.plan.sessionsPerWeek,
      monthlyPrice: subscription.plan.monthlyPrice.toString(),
      currency: subscription.plan.currency,
    },
    startDate: subscription.startDate.toISOString().slice(0, 10),
    nextBillingDate: subscription.nextBillingDate.toISOString().slice(0, 10),
  };
}
