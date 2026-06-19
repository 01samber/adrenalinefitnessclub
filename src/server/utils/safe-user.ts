import type { User } from "@prisma/client";

type UserLike = Pick<
  User,
  | "id"
  | "fullName"
  | "email"
  | "phoneNumber"
  | "role"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "lastLoginAt"
>;

export function toSafeUser(user: UserLike) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export type SafeUser = ReturnType<typeof toSafeUser>;
