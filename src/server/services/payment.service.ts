import { PaymentStatus, UserRole } from "@prisma/client";
import { NotFoundError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import type {
  CreatePaymentInput,
  PaymentListQuery,
  UpdatePaymentStatusInput,
} from "@/server/validations/payment.validation";
import { parsePagination, paginate } from "@/server/utils/pagination";
import { toDateOnly } from "@/server/utils/dates";

function buildPaymentWhere(query: PaymentListQuery, clientId?: string) {
  const dueDateFilter: { gte?: Date; lte?: Date } = {};

  if (query.fromDate) {
    dueDateFilter.gte = toDateOnly(query.fromDate);
  }

  if (query.toDate) {
    dueDateFilter.lte = toDateOnly(query.toDate);
  }

  return {
    ...(clientId ? { clientId } : {}),
    ...(query.clientId && !clientId ? { clientId: query.clientId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(Object.keys(dueDateFilter).length > 0 ? { dueDate: dueDateFilter } : {}),
  };
}

export async function listOwnerPayments(query: PaymentListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildPaymentWhere(query);

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
      paymentMethod: input.paymentMethod,
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
