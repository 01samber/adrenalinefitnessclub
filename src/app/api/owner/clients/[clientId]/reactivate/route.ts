import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { reactivateClient } from "@/server/services/owner-client.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";

interface RouteContext {
  params: Promise<{ clientId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { clientId } = await context.params;
    validate(idSchema, clientId);
    const data = await reactivateClient(clientId, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
