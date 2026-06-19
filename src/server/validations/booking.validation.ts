import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  isoDateTimeSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

export const createBookingRequestSchema = z
  .object({
    ownerId: idSchema,
    startTime: isoDateTimeSchema,
    endTime: isoDateTimeSchema,
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => new Date(data.startTime).getTime() < new Date(data.endTime).getTime(),
    { message: "End time must be after start time", path: ["endTime"] },
  );

export const ownerCreateBookingSchema = z
  .object({
    clientId: idSchema,
    ownerId: idSchema.optional(),
    startTime: isoDateTimeSchema,
    endTime: isoDateTimeSchema,
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => new Date(data.startTime).getTime() < new Date(data.endTime).getTime(),
    { message: "End time must be after start time", path: ["endTime"] },
  );

export const ownerBookingDecisionSchema = z.object({
  cancellationReason: z.string().trim().min(1).max(500).optional(),
});

export const bookingListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(BookingStatus).optional(),
  clientId: idSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
});

export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>;
export type OwnerCreateBookingInput = z.infer<typeof ownerCreateBookingSchema>;
export type OwnerBookingDecisionInput = z.infer<typeof ownerBookingDecisionSchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
