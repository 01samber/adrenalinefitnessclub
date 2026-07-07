import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

export const billingMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "billingMonth must be YYYY-MM");

const subscriptionSearchSchema = z
  .string()
  .trim()
  .min(1, "search is required")
  .max(100, "search must be at most 100 characters")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createSubscriptionSchema = z.object({
  clientId: idSchema,
  planId: idSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema.nullable().optional(),
  nextBillingDate: dateStringSchema.optional(),
  status: z.nativeEnum(SubscriptionStatus).default(SubscriptionStatus.ACTIVE),
  autoRenew: z.boolean().default(true),
});

export const updateSubscriptionSchema = z
  .object({
    planId: idSchema.optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.nullable().optional(),
    nextBillingDate: dateStringSchema.optional(),
    status: z.nativeEnum(SubscriptionStatus).optional(),
    autoRenew: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const subscriptionListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(SubscriptionStatus).optional(),
  clientId: idSchema.optional(),
  planId: idSchema.optional(),
  search: subscriptionSearchSchema,
  billingMonth: billingMonthSchema
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionListQuery = z.infer<typeof subscriptionListQuerySchema>;
