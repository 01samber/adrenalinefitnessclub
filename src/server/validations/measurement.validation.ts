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
  muscleKg: z.coerce.number().positive().max(500).nullable().optional(),
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

const optionalPositiveCircumference = z.coerce.number().positive().max(300).optional();

export const createOwnerClientMeasurementSchema = z
  .object({
    measuredAt: dateStringSchema.optional(),
    weightKg: z.coerce.number().positive().max(500).optional(),
    heightCmSnapshot: z.coerce.number().positive().max(300).optional(),
    bodyFatPercentage: z.coerce.number().min(0).max(100).optional(),
    muscleKg: z.coerce.number().positive().max(500).optional(),
    musclePercentage: z.coerce.number().min(0).max(100).optional(),
    waterPercentage: z.coerce.number().min(0).max(100).optional(),
    visceralFatKg: z.coerce.number().min(0).optional(),
    basalMetabolicRate: z.coerce.number().int().positive().optional(),
    metabolicAge: z.coerce.number().int().positive().optional(),
    chestCm: optionalPositiveCircumference,
    waistCm: optionalPositiveCircumference,
    hipsCm: optionalPositiveCircumference,
    armsCm: optionalPositiveCircumference,
    thighsCm: optionalPositiveCircumference,
    notes: z.string().max(2000).optional(),
    coachAssessment: z.string().max(2000).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.weightKg != null ||
          data.bodyFatPercentage != null ||
          data.muscleKg != null ||
          data.musclePercentage != null ||
          data.waterPercentage != null ||
          data.visceralFatKg != null ||
          data.basalMetabolicRate != null ||
          data.metabolicAge != null ||
          data.chestCm != null ||
          data.waistCm != null ||
          data.hipsCm != null ||
          data.armsCm != null ||
          data.thighsCm != null ||
          data.notes?.trim() ||
          data.coachAssessment?.trim(),
      ),
    { message: "At least one measurement value or note is required" },
  )
  .refine((data) => data.weightKg != null, {
    message: "weightKg is required to store a body measurement",
    path: ["weightKg"],
  });

export const measurementListQuerySchema = paginationQuerySchema.extend({
  clientId: idSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
});

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type CreateOwnerClientMeasurementInput = z.infer<
  typeof createOwnerClientMeasurementSchema
>;
export type MeasurementListQuery = z.infer<typeof measurementListQuerySchema>;
