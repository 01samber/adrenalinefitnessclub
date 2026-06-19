import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import { getClientMe } from "@/server/services/client.service";

export async function GET() {
  try {
    const user = await requireClient();
    const data = await getClientMe(user.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
