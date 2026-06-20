import { UserStatus } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/api-errors";
import { getCurrentUser } from "@/server/auth/get-current-user";
import type { SessionUser } from "@/types/next-auth.d";

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  if (user.status === UserStatus.FROZEN) {
    throw new ForbiddenError(
      "Your account is frozen. Please contact the coach.",
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedError("Account is not available");
  }

  return user;
}

export async function requireActiveAuth(): Promise<SessionUser> {
  return requireAuth();
}
