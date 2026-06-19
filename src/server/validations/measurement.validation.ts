import { z } from "zod";
import {
  dateStringSchema,
  idSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

export const createMeasurementSchema = z.object({
  clientId: idSchema,
  measuredAt: z.string().datetime(),
  weightKg: z.coerce.number().positive().max(500),
  heightCmSnapshot: z.coerce.number().positive().max(300),
  bodyFatPercentage: z.coerce.number().min(0).max(100).nullable().optional(),
  musclePercentage: z.coerce.number().min(0).max(100).nullable().optional(),
  waterPercentage: z.coerce.number().min(0).max(100).nullable().optional(),
  visceralFatKg: z.coerce.number().min(0).nullable().optional(),
  basalMetabolicRate: z.coerce.number().int().positive().nullable().optional(),
  metabolicAge: z.coerce.number().int().positive().nullable().optional(),
  chestCm: z.coerce.number().positive().nullable().optional(),
  waistCm: z.coerce.number().positive().nullable().optional(),
  hipsCm: z.coerce.number().positive().nullable().optional(),
  armsCm: z.coerce.number().positive().nullable().optional(),
  thighsCm: z.coerce.number().positive().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  coachAssessment: z.string().max(2000).nullable().optional(),
});

export const measurementListQuerySchema = paginationQuerySchema.extend({
  clientId: idSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
});

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type MeasurementListQuery = z.infer<typeof measurementListQuerySchema>;
