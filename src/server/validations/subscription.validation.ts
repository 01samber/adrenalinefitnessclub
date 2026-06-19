import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

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
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionListQuery = z.infer<typeof subscriptionListQuerySchema>;
