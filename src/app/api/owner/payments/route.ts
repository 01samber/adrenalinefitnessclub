import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  createPayment,
  listOwnerPayments,
} from "@/server/services/payment.service";
import { validate } from "@/server/validations/common.validation";
import {
  createPaymentSchema,
  paymentListQuerySchema,
} from "@/server/validations/payment.validation";

export async function GET(request: NextRequest) {
  try {
    await requireOwner();
    const query = validate(
      paymentListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listOwnerPayments(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = validate(createPaymentSchema, await request.json());
    const data = await createPayment(body, owner.id);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
