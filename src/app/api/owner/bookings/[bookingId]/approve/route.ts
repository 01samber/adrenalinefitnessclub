import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { approveBooking } from "@/server/services/booking.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";

interface RouteContext {
  params: Promise<{ bookingId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { bookingId } = await context.params;
    validate(idSchema, bookingId);
    const data = await approveBooking(bookingId, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
