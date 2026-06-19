import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireClient } from "@/server/auth/require-client";
import {
  createClientBookingRequest,
  listClientBookings,
} from "@/server/services/booking.service";
import { validate } from "@/server/validations/common.validation";
import {
  bookingListQuerySchema,
  createBookingRequestSchema,
} from "@/server/validations/booking.validation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireClient();
    const query = validate(
      bookingListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listClientBookings(user.id, query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireClient();
    const body = validate(createBookingRequestSchema, await request.json());
    const data = await createClientBookingRequest(user.id, body);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
