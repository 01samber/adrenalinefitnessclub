import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  createOwnerBooking,
  listOwnerBookings,
} from "@/server/services/booking.service";
import { validate } from "@/server/validations/common.validation";
import {
  bookingListQuerySchema,
  ownerCreateBookingSchema,
} from "@/server/validations/booking.validation";

export async function GET(request: NextRequest) {
  try {
    await requireOwner();
    const query = validate(
      bookingListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listOwnerBookings(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = validate(ownerCreateBookingSchema, await request.json());
    const data = await createOwnerBooking(body, owner.id);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
