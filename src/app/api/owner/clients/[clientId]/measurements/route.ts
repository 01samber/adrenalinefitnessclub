import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { createOwnerClientMeasurement } from "@/server/services/measurement.service";
import { validate, idSchema } from "@/server/validations/common.validation";
import { createOwnerClientMeasurementSchema } from "@/server/validations/measurement.validation";

interface RouteContext {
  params: Promise<{ clientId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { clientId } = await context.params;
    validate(idSchema, clientId);
    const body = validate(
      createOwnerClientMeasurementSchema,
      await request.json(),
    );
    const measurement = await createOwnerClientMeasurement(
      clientId,
      body,
      owner.id,
    );
    return successResponse({ measurement }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
