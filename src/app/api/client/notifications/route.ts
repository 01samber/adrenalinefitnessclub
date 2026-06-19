import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import { listUserNotifications } from "@/server/services/notification.service";

export async function GET() {
  try {
    const user = await requireClient();
    const data = await listUserNotifications(user.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
