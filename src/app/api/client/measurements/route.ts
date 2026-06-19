import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import { listClientMeasurements } from "@/server/services/measurement.service";
import { validate } from "@/server/validations/common.validation";
import { measurementListQuerySchema } from "@/server/validations/measurement.validation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireClient();
    const query = validate(
      measurementListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listClientMeasurements(user.id, query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
