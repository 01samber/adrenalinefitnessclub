import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  createMeasurement,
  listOwnerMeasurements,
} from "@/server/services/measurement.service";
import { validate } from "@/server/validations/common.validation";
import {
  createMeasurementSchema,
  measurementListQuerySchema,
} from "@/server/validations/measurement.validation";

export async function GET(request: NextRequest) {
  try {
    await requireOwner();
    const query = validate(
      measurementListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listOwnerMeasurements(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = validate(createMeasurementSchema, await request.json());
    const data = await createMeasurement(body, owner.id);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
