import {
  ActivityLevel,
  ClientStatus,
  Gender,
  UserStatus,
} from "@prisma/client";
import { z } from "zod";
import {
  dateStringSchema,
  optionalSearchSchema,
  paginationQuerySchema,
} from "@/server/validations/common.validation";

export const createClientSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  phoneNumber: z.string().trim().min(5).max(30),
  temporaryPassword: z.string().min(4).max(128),
  dateOfBirth: dateStringSchema,
  gender: z.nativeEnum(Gender),
  heightCm: z.coerce.number().positive().max(300),
  emergencyContactName: z.string().trim().min(2).max(120),
  emergencyContactPhone: z.string().trim().min(5).max(30),
  fitnessGoal: z.string().trim().min(2).max(500),
  activityLevel: z.nativeEnum(ActivityLevel),
  medicalNotes: z.string().max(2000).optional().default(""),
  injuries: z.string().max(2000).optional().default(""),
  assignedPlanId: z.string().trim().min(1).nullable().optional(),
  joinDate: dateStringSchema,
  coachNotes: z.string().max(2000).optional().default(""),
});

export const updateClientSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phoneNumber: z.string().trim().min(5).max(30).optional(),
    dateOfBirth: dateStringSchema.optional(),
    gender: z.nativeEnum(Gender).optional(),
    heightCm: z.coerce.number().positive().max(300).optional(),
    emergencyContactName: z.string().trim().min(2).max(120).optional(),
    emergencyContactPhone: z.string().trim().min(5).max(30).optional(),
    fitnessGoal: z.string().trim().min(2).max(500).optional(),
    activityLevel: z.nativeEnum(ActivityLevel).optional(),
    medicalNotes: z.string().max(2000).optional(),
    injuries: z.string().max(2000).optional(),
    assignedPlanId: z.string().trim().min(1).nullable().optional(),
    joinDate: dateStringSchema.optional(),
    coachNotes: z.string().max(2000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const clientListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(UserStatus).optional(),
  search: optionalSearchSchema,
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;

export const clientStatusFilterSchema = z.nativeEnum(ClientStatus);
