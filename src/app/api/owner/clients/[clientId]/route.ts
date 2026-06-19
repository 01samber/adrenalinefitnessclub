import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { requireOwner } from "@/server/auth/require-owner";
import {
  getClientById,
  softDeleteClient,
  updateClient,
} from "@/server/services/owner-client.service";
import { validate } from "@/server/validations/common.validation";
import { idSchema } from "@/server/validations/common.validation";
import { updateClientSchema } from "@/server/validations/client.validation";

interface RouteContext {
  params: Promise<{ clientId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireOwner();
    const { clientId } = await context.params;
    validate(idSchema, clientId);
    const data = await getClientById(clientId);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { clientId } = await context.params;
    validate(idSchema, clientId);
    const body = validate(updateClientSchema, await request.json());
    const data = await updateClient(clientId, body, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const owner = await requireOwner();
    const { clientId } = await context.params;
    validate(idSchema, clientId);
    const data = await softDeleteClient(clientId, owner.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
