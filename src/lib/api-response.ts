import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api-errors";

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 500,
  details?: unknown,
): NextResponse {
  const body: { success: false; message: string; details?: unknown } = {
    success: false,
    message,
  };

  if (details !== undefined) {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return errorResponse("Validation failed", 400, error.flatten());
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error);
  }

  return errorResponse("Internal server error", 500);
}
