import type { Payment, Plan, Subscription, User } from "@prisma/client";
import {
  toSafeListPayment,
  toSafeListPlan,
  type SafeListPayment,
  type SafeListPlan,
} from "@/server/utils/owner-client-list.mapper";

export type SafeSubscriptionListClient = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: string;
};

export type SafeSubscriptionListPlan = SafeListPlan & {
  status: "ACTIVE" | "INACTIVE";
  isActive: boolean;
};

export type SafeSubscriptionLatestPayment = Omit<SafeListPayment, "dueDate"> & {
  dueDate: string | null;
  paymentMethod: string | null;
};

export type OwnerSubscriptionListItem = {
  id: string;
  clientId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string;
  status: Subscription["status"];
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  client: SafeSubscriptionListClient | null;
  plan: SafeSubscriptionListPlan | null;
  latestPayment: SafeSubscriptionLatestPayment | null;
};

export function firstRowPerSubscriptionId<T extends { subscriptionId: string | null }>(
  rows: T[],
): Map<string, T> {
  const map = new Map<string, T>();

  for (const row of rows) {
    if (!row.subscriptionId) {
      continue;
    }

    if (!map.has(row.subscriptionId)) {
      map.set(row.subscriptionId, row);
    }
  }

  return map;
}

export function toSafeSubscriptionListClient(
  user: Pick<User, "id" | "fullName" | "email" | "phoneNumber" | "status">,
): SafeSubscriptionListClient {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
  };
}

export function toSafeSubscriptionListPlan(plan: Plan): SafeSubscriptionListPlan {
  return {
    ...toSafeListPlan(plan),
    status: plan.isActive ? "ACTIVE" : "INACTIVE",
    isActive: plan.isActive,
  };
}

export function toSafeSubscriptionLatestPayment(
  payment: Payment,
): SafeSubscriptionLatestPayment {
  const base = toSafeListPayment(payment);

  return {
    id: base.id,
    amount: base.amount,
    currency: base.currency,
    status: base.status,
    paidAt: base.paidAt,
    dueDate: base.dueDate,
    paymentMethod: payment.paymentMethod,
  };
}

export function toSafeSubscriptionListItem(
  subscription: Subscription & {
    plan: Plan | null;
    client: Pick<
      User,
      "id" | "fullName" | "email" | "phoneNumber" | "status"
    > | null;
  },
  latestPayment: Payment | null,
): OwnerSubscriptionListItem {
  return {
    id: subscription.id,
    clientId: subscription.clientId,
    planId: subscription.planId,
    startDate: subscription.startDate.toISOString(),
    endDate: subscription.endDate?.toISOString() ?? null,
    nextBillingDate: subscription.nextBillingDate.toISOString(),
    status: subscription.status,
    autoRenew: subscription.autoRenew,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
    client: subscription.client
      ? toSafeSubscriptionListClient(subscription.client)
      : null,
    plan: subscription.plan ? toSafeSubscriptionListPlan(subscription.plan) : null,
    latestPayment: latestPayment
      ? toSafeSubscriptionLatestPayment(latestPayment)
      : null,
  };
}
