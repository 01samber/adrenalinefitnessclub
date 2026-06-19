import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { updateSubscription } from "@/server/services/subscription.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";
import { updateSubscriptionSchema } from "@/server/validations/subscription.validation";

interface RouteContext {
  params: Promise<{ subscriptionId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { subscriptionId } = await context.params;
    validate(idSchema, subscriptionId);
    const body = validate(updateSubscriptionSchema, await request.json());
    const data = await updateSubscription(subscriptionId, body, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
