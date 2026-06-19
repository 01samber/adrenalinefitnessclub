import { z } from "zod";
import { ValidationError } from "@/lib/api-errors";

export const idSchema = z.string().trim().min(1, "Invalid id");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const optionalSearchSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const isoDateTimeSchema = z
  .string()
  .datetime({ message: "Invalid ISO datetime" });

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }

  return result.data;
}

export function parseQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>,
): T {
  const raw = Object.fromEntries(searchParams.entries());
  return validate(schema, raw);
}
