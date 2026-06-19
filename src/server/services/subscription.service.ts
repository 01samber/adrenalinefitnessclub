import { SubscriptionStatus, UserRole } from "@prisma/client";
import { NotFoundError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import type {
  CreateSubscriptionInput,
  SubscriptionListQuery,
  UpdateSubscriptionInput,
} from "@/server/validations/subscription.validation";
import { addDays, toDateOnly } from "@/server/utils/dates";
import { parsePagination, paginate } from "@/server/utils/pagination";

export async function listSubscriptions(query: SubscriptionListQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.clientId ? { clientId: query.clientId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscription.count({ where }),
  ]);

  return paginate(items, page, limit, total);
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
