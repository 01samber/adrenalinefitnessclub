import {
  PaymentMethod,
  PaymentStatus,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { NotFoundError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import type {
  CreatePaymentInput,
  PaymentListQuery,
  UpdatePaymentStatusInput,
} from "@/server/validations/payment.validation";
import { computeOwnerPaymentsSummary } from "@/server/utils/owner-payment-summary";
import type { OwnerPaymentsSummary } from "@/server/utils/owner-payment-summary";
import { monthBoundsFromYYYYMM, toDateOnly } from "@/server/utils/dates";
import { parsePagination, paginate } from "@/server/utils/pagination";

export type { OwnerPaymentsSummary };

/**
 * Payment list filters use dueDate for fromDate/toDate and billingMonth bounds.
 */
function buildPaymentWhere(
  query: PaymentListQuery,
  clientId?: string,
): Prisma.PaymentWhereInput {
  const conditions: Prisma.PaymentWhereInput[] = [];

  if (clientId) {
    conditions.push({ clientId });
  } else if (query.clientId) {
    conditions.push({ clientId: query.clientId });
  }

  if (query.status) {
    conditions.push({ status: query.status });
  }

  const dueDateFilter: Prisma.DateTimeFilter = {};

  if (query.billingMonth) {
    const { start, endExclusive } = monthBoundsFromYYYYMM(query.billingMonth);
    dueDateFilter.gte = start;
    dueDateFilter.lt = endExclusive;
  }

  if (query.fromDate) {
    const from = toDateOnly(query.fromDate);
    if (!dueDateFilter.gte || from > dueDateFilter.gte) {
      dueDateFilter.gte = from;
    }
  }

  if (query.toDate) {
    const to = toDateOnly(query.toDate);
    if (dueDateFilter.lt && to < dueDateFilter.lt) {
      dueDateFilter.lte = to;
      delete dueDateFilter.lt;
    } else if (!dueDateFilter.lt) {
      dueDateFilter.lte = to;
    }
  }

  if (Object.keys(dueDateFilter).length > 0) {
    conditions.push({ dueDate: dueDateFilter });
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

  return conditions.length > 0 ? { AND: conditions } : {};
}

export async function listOwnerPayments(query: PaymentListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildPaymentWhere(query);

  const [items, total, summary] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { dueDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
    computeOwnerPaymentsSummary(prisma, where),
  ]);

  return {
    ...paginate(items, page, limit, total),
    summary,
  };
}

export async function createPayment(
  input: CreatePaymentInput,
  actorUserId: string,
) {
  const client = await prisma.user.findFirst({
    where: { id: input.clientId, role: UserRole.CLIENT },
  });

  if (!client) {
    throw new NotFoundError("Client not found");
  }

  const payment = await prisma.payment.create({
    data: {
      clientId: input.clientId,
      subscriptionId: input.subscriptionId ?? null,
      amount: input.amount,
      currency: input.currency,
      paymentDate: input.paymentDate ? new Date(input.paymentDate) : null,
      dueDate: toDateOnly(input.dueDate),
      status: input.status,
      paymentMethod: input.paymentMethod ?? PaymentMethod.OTHER,
      notes: input.notes ?? null,
    },
  });

  await createAuditLog({
    actorUserId,
    action: "payment.created",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { clientId: input.clientId, amount: input.amount },
  });

  return payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  input: UpdatePaymentStatusInput,
  actorUserId: string,
) {
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!existing) {
    throw new NotFoundError("Payment not found");
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: input.status,
      paymentDate:
        input.paymentDate !== undefined
          ? input.paymentDate
            ? new Date(input.paymentDate)
            : null
          : input.status === PaymentStatus.PAID && !existing.paymentDate
            ? new Date()
            : existing.paymentDate,
      paymentMethod:
        input.paymentMethod !== undefined
          ? input.paymentMethod
          : existing.paymentMethod,
      notes: input.notes ?? existing.notes,
    },
  });

  await createAuditLog({
    actorUserId,
    action: "payment.status_updated",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { status: input.status },
  });

  return payment;
}

export async function getClientPayments(userId: string, query: PaymentListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildPaymentWhere(query, userId);

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { dueDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return paginate(items, page, limit, total);
}
