import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { listActiveOwnerPlans } from "@/server/services/plan.service";

export async function GET() {
  try {
    await requireOwner();
    const data = await listActiveOwnerPlans();
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
