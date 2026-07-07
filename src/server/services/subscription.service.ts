import {
  PaymentStatus,
  SubscriptionStatus,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { NotFoundError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import type {
  CreateSubscriptionInput,
  SubscriptionListQuery,
  UpdateSubscriptionInput,
} from "@/server/validations/subscription.validation";
import {
  addDays,
  currentMonthYYYYMM,
  monthBoundsFromYYYYMM,
  toDateOnly,
} from "@/server/utils/dates";
import {
  firstRowPerSubscriptionId,
  toSafeSubscriptionListItem,
  type OwnerSubscriptionListItem,
} from "@/server/utils/owner-subscription-list.mapper";
import { parsePagination, paginate } from "@/server/utils/pagination";

const UNPAID_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.UNPAID,
  PaymentStatus.PARTIAL,
  PaymentStatus.OVERDUE,
];

const CLIENT_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  status: true,
} as const;

export type OwnerSubscriptionsSummary = {
  scope: "filtered";
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  frozenSubscriptions: number;
  activeMonthlyValue: string;
  dueThisMonth: number;
  overdueBilling: number;
  collectedAmount: string;
  unpaidAmount: string;
  currency: string;
  currencyMixed: boolean;
};

function mergeSubscriptionWhere(
  base: Prisma.SubscriptionWhereInput,
  extra: Prisma.SubscriptionWhereInput,
): Prisma.SubscriptionWhereInput {
  return { AND: [base, extra] };
}

/**
 * billingMonth filter: subscriptions whose nextBillingDate falls inside the
 * selected YYYY-MM month using [start, endExclusive) UTC date bounds.
 */
function buildSubscriptionListWhere(
  query: SubscriptionListQuery,
): Prisma.SubscriptionWhereInput {
  const conditions: Prisma.SubscriptionWhereInput[] = [];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.clientId) {
    conditions.push({ clientId: query.clientId });
  }

  if (query.planId) {
    conditions.push({ planId: query.planId });
  }

  if (query.search) {
    conditions.push({
      client: {
        OR: [
          {
            fullName: {
              contains: query.search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query.search,
              mode: "insensitive",
            },
          },
          {
            phoneNumber: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        ],
      },
    });
  }

  if (query.billingMonth) {
    const { start, endExclusive } = monthBoundsFromYYYYMM(query.billingMonth);
    conditions.push({
      nextBillingDate: {
        gte: start,
        lt: endExclusive,
      },
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

async function loadLatestPaymentsBySubscriptionId(subscriptionIds: string[]) {
  if (subscriptionIds.length === 0) {
    return new Map<
      string,
      Awaited<ReturnType<typeof prisma.payment.findMany>>[number]
    >();
  }

  const payments = await prisma.payment.findMany({
    where: { subscriptionId: { in: subscriptionIds } },
    orderBy: [
      { paymentDate: { sort: "desc", nulls: "last" } },
      { dueDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  return firstRowPerSubscriptionId(payments);
}

async function computeSubscriptionSummary(
  where: Prisma.SubscriptionWhereInput,
  billingMonth?: string,
): Promise<OwnerSubscriptionsSummary> {
  const today = toDateOnly(new Date().toISOString().slice(0, 10));
  const dueMonth = billingMonth ?? currentMonthYYYYMM();
  const { start: monthStart, endExclusive: monthEndExclusive } =
    monthBoundsFromYYYYMM(dueMonth);

  const activeWhere = mergeSubscriptionWhere(where, {
    status: SubscriptionStatus.ACTIVE,
  });

  const [
    totalSubscriptions,
    activeSubscriptions,
    cancelledSubscriptions,
    expiredSubscriptions,
    frozenSubscriptions,
    activeSubsWithPlan,
    dueThisMonth,
    overdueBilling,
    paidPayments,
    unpaidPayments,
  ] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(where, {
        status: SubscriptionStatus.ACTIVE,
      }),
    }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(where, {
        status: SubscriptionStatus.CANCELLED,
      }),
    }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(where, {
        status: SubscriptionStatus.EXPIRED,
      }),
    }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(where, {
        status: SubscriptionStatus.FROZEN,
      }),
    }),
    prisma.subscription.findMany({
      where: activeWhere,
      select: {
        plan: {
          select: {
            monthlyPrice: true,
            currency: true,
          },
        },
      },
    }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(activeWhere, {
        nextBillingDate: {
          gte: monthStart,
          lt: monthEndExclusive,
        },
      }),
    }),
    prisma.subscription.count({
      where: mergeSubscriptionWhere(activeWhere, {
        nextBillingDate: {
          lt: today,
        },
      }),
    }),
    prisma.payment.findMany({
      where: {
        subscription: where,
        status: PaymentStatus.PAID,
      },
      select: {
        amount: true,
        currency: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        subscription: where,
        status: { in: UNPAID_PAYMENT_STATUSES },
      },
      select: {
        amount: true,
        currency: true,
      },
    }),
  ]);

  let activeMonthlyValue = 0;
  const currencies = new Set<string>();

  for (const subscription of activeSubsWithPlan) {
    activeMonthlyValue += Number(subscription.plan.monthlyPrice);
    currencies.add(subscription.plan.currency);
  }

  let collectedAmount = 0;
  for (const payment of paidPayments) {
    collectedAmount += Number(payment.amount);
    currencies.add(payment.currency);
  }

  let unpaidAmount = 0;
  for (const payment of unpaidPayments) {
    unpaidAmount += Number(payment.amount);
    currencies.add(payment.currency);
  }

  const currencyList = [...currencies];
  const currencyMixed = currencyList.length > 1;
  const currency = currencyList[0] ?? "USD";

  return {
    scope: "filtered",
    totalSubscriptions,
    activeSubscriptions,
    cancelledSubscriptions,
    expiredSubscriptions,
    frozenSubscriptions,
    activeMonthlyValue: activeMonthlyValue.toFixed(2),
    dueThisMonth,
    overdueBilling,
    collectedAmount: collectedAmount.toFixed(2),
    unpaidAmount: unpaidAmount.toFixed(2),
    currency,
    currencyMixed,
  };
}

export async function listSubscriptions(query: SubscriptionListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildSubscriptionListWhere(query);

  const [rows, total, summary] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        client: { select: CLIENT_SELECT },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscription.count({ where }),
    computeSubscriptionSummary(where, query.billingMonth),
  ]);

  const latestPaymentRows = await loadLatestPaymentsBySubscriptionId(
    rows.map((row) => row.id),
  );

  const items: OwnerSubscriptionListItem[] = rows.map((row) =>
    toSafeSubscriptionListItem(row, latestPaymentRows.get(row.id) ?? null),
  );

  return {
    ...paginate(items, page, limit, total),
    summary,
  };
}

export async function createSubscription(
  input: CreateSubscriptionInput,
  actorUserId: string,
) {
  const client = await prisma.user.findFirst({
    where: { id: input.clientId, role: UserRole.CLIENT },
  });

  if (!client) {
    throw new NotFoundError("Client not found");
  }

  const plan = await prisma.plan.findUnique({ where: { id: input.planId } });

  if (!plan) {
    throw new NotFoundError("Plan not found");
  }

  const startDate = toDateOnly(input.startDate);
  const nextBillingDate = input.nextBillingDate
    ? toDateOnly(input.nextBillingDate)
    : addDays(startDate, 30);

  const subscription = await prisma.subscription.create({
    data: {
      clientId: input.clientId,
      planId: input.planId,
      startDate,
      endDate: input.endDate ? toDateOnly(input.endDate) : null,
      nextBillingDate,
      status: input.status,
      autoRenew: input.autoRenew,
    },
    include: { plan: true },
  });

  await createAuditLog({
    actorUserId,
    action: "subscription.created",
    entityType: "Subscription",
    entityId: subscription.id,
    metadata: { clientId: input.clientId, planId: input.planId },
  });

  return subscription;
}

export async function updateSubscription(
  subscriptionId: string,
  input: UpdateSubscriptionInput,
  actorUserId: string,
) {
  const existing = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!existing) {
    throw new NotFoundError("Subscription not found");
  }

  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...(input.planId !== undefined ? { planId: input.planId } : {}),
      ...(input.startDate !== undefined
        ? { startDate: toDateOnly(input.startDate) }
        : {}),
      ...(input.endDate !== undefined
        ? { endDate: input.endDate ? toDateOnly(input.endDate) : null }
        : {}),
      ...(input.nextBillingDate !== undefined
        ? { nextBillingDate: toDateOnly(input.nextBillingDate) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.autoRenew !== undefined ? { autoRenew: input.autoRenew } : {}),
    },
    include: { plan: true },
  });

  await createAuditLog({
    actorUserId,
    action: "subscription.updated",
    entityType: "Subscription",
    entityId: subscription.id,
    metadata: input,
  });

  return subscription;
}

export async function cancelSubscription(
  subscriptionId: string,
  actorUserId: string,
) {
  const existing = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!existing) {
    throw new NotFoundError("Subscription not found");
  }

  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: SubscriptionStatus.CANCELLED, autoRenew: false },
    include: { plan: true },
  });

  await createAuditLog({
    actorUserId,
    action: "subscription.cancelled",
    entityType: "Subscription",
    entityId: subscription.id,
  });

  return subscription;
}
