import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { cancelSubscription } from "@/server/services/subscription.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";

interface RouteContext {
  params: Promise<{ subscriptionId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { subscriptionId } = await context.params;
    validate(idSchema, subscriptionId);
    const data = await cancelSubscription(subscriptionId, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
