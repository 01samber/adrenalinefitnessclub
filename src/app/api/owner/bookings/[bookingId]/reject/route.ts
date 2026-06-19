import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import { rejectBooking } from "@/server/services/booking.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";
import { ownerBookingDecisionSchema } from "@/server/validations/booking.validation";

interface RouteContext {
  params: Promise<{ bookingId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { bookingId } = await context.params;
    validate(idSchema, bookingId);
    const body = validate(ownerBookingDecisionSchema, await request.json().catch(() => ({})));
    const data = await rejectBooking(bookingId, body, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
