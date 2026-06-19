import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

export const createPaymentSchema = z.object({
  clientId: idSchema,
  subscriptionId: idSchema.nullable().optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default("USD"),
  paymentDate: z.string().datetime().nullable().optional(),
  dueDate: dateStringSchema,
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.UNPAID),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(1000).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  paymentDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export const paymentListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(PaymentStatus).optional(),
  clientId: idSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
