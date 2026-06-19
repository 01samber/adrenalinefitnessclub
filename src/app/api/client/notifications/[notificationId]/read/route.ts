import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import { markNotificationRead } from "@/server/services/notification.service";
import { idSchema, validate } from "@/server/validations/common.validation";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await requireClient();
    const { notificationId } = await context.params;
    validate(idSchema, notificationId);
    const data = await markNotificationRead(notificationId, user.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
