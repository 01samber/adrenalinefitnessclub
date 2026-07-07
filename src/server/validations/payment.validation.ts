import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

const billingMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "billingMonth must be YYYY-MM");

const paymentSearchSchema = z
  .string()
  .trim()
  .min(1, "search is required")
  .max(100, "search must be at most 100 characters")
  .optional()
  .or(z.literal("").transform(() => undefined));

const receivedPaymentStatuses = new Set<PaymentStatus>([
  PaymentStatus.PAID,
  PaymentStatus.PARTIAL,
]);

export const createPaymentSchema = z
  .object({
    clientId: idSchema,
    subscriptionId: idSchema.nullable().optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().length(3).default("USD"),
    paymentDate: z.string().datetime().nullable().optional(),
    dueDate: dateStringSchema,
    status: z.nativeEnum(PaymentStatus).default(PaymentStatus.UNPAID),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (receivedPaymentStatuses.has(data.status) && !data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment method is required when status is PAID or PARTIAL",
        path: ["paymentMethod"],
      });
    }
  });

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  paymentDate: z.string().datetime().nullable().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().max(1000).optional(),
});

export const paymentListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(PaymentStatus).optional(),
  clientId: idSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
  search: paymentSearchSchema,
  billingMonth: billingMonthSchema
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
