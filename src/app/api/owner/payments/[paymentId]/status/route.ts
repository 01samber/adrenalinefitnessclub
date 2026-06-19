import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { updatePaymentStatus } from "@/server/services/payment.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";
import { updatePaymentStatusSchema } from "@/server/validations/payment.validation";

interface RouteContext {
  params: Promise<{ paymentId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { paymentId } = await context.params;
    validate(idSchema, paymentId);
    const body = validate(updatePaymentStatusSchema, await request.json());
    const data = await updatePaymentStatus(paymentId, body, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
