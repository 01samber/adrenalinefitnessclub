import { UserRole } from "@prisma/client";
import { ForbiddenError } from "@/lib/api-errors";
import { requireAuth } from "@/server/auth/require-auth";
import type { SessionUser } from "@/types/next-auth.d";

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== UserRole.OWNER) {
    throw new ForbiddenError("Owner access required");
  }

  return user;
}
