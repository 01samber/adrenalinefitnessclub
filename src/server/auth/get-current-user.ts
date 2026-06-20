import { getServerSession } from "next-auth";
import { UserStatus, type UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { SessionUser } from "@/types/next-auth.d";

const freshUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
} as const;

export async function getFreshUserById(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: freshUserSelect,
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: user.status as UserStatus,
    name: user.fullName,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return getFreshUserById(session.user.id);
}
