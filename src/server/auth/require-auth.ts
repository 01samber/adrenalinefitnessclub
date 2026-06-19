import { UserStatus } from "@prisma/client";
import { UnauthorizedError } from "@/lib/api-errors";
import { getCurrentUser } from "@/server/auth/get-current-user";
import type { SessionUser } from "@/types/next-auth.d";

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedError("Account is not active");
  }

  return user;
}
