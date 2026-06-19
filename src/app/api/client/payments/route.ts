import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import { getClientPayments } from "@/server/services/payment.service";
import { parseQueryParams } from "@/server/validations/common.validation";
import { paymentListQuerySchema } from "@/server/validations/payment.validation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireClient();
    const query = parseQueryParams(
      request.nextUrl.searchParams,
      paymentListQuerySchema,
    );
    const data = await getClientPayments(user.id, query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
