import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  createClient,
  listClients,
} from "@/server/services/owner-client.service";
import { validate } from "@/server/validations/common.validation";
import {
  clientListQuerySchema,
  createClientSchema,
} from "@/server/validations/client.validation";

export async function GET(request: NextRequest) {
  try {
    await requireOwner();
    const query = validate(
      clientListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const data = await listClients(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = validate(createClientSchema, await request.json());
    const data = await createClient(body, owner.id);
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
