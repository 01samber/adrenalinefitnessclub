import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  createSubscription,
  listSubscriptions,
} from "@/server/services/subscription.service";
import { validate } from "@/server/validations/common.validation";
import {
  createSubscriptionSchema,
  subscriptionListQuerySchema,
} from "@/server/validations/subscription.validation";

export async function GET(request: NextRequest) {
  try {
    await requireOwner();
    const query = validate(
      subscriptionListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listSubscriptions(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = validate(createSubscriptionSchema, await request.json());
    const data = await createSubscription(body, owner.id);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
