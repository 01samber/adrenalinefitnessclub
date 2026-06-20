import { UserRole } from "@prisma/client";
import { ForbiddenError } from "@/lib/api-errors";
import { requireActiveAuth } from "@/server/auth/require-auth";
import type { SessionUser } from "@/types/next-auth.d";

export async function requireActiveClient(): Promise<SessionUser> {
  const user = await requireActiveAuth();

  if (user.role !== UserRole.CLIENT) {
    throw new ForbiddenError("Client access required");
  }

  return user;
}
