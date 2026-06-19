import {
  ClientStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { ConflictError, NotFoundError } from "@/lib/api-errors";
import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import type {
  ClientListQuery,
  CreateClientInput,
  UpdateClientInput,
} from "@/server/validations/client.validation";
import { parsePagination, paginate } from "@/server/utils/pagination";
import { toDateOnly } from "@/server/utils/dates";
import { toSafeUser } from "@/server/utils/safe-user";

function mapUserStatusToClientStatus(status: UserStatus): ClientStatus {
  switch (status) {
    case UserStatus.FROZEN:
      return ClientStatus.FROZEN;
    case UserStatus.DELETED:
      return ClientStatus.DELETED;
    case UserStatus.SUSPENDED:
      return ClientStatus.INACTIVE;
    default:
      return ClientStatus.ACTIVE;
  }
}

async function getClientUserOrThrow(clientId: string) {
  const user = await prisma.user.findFirst({
    where: { id: clientId, role: UserRole.CLIENT },
    include: { clientProfile: true },
  });

  if (!user?.clientProfile) {
    throw new NotFoundError("Client not found");
  }

  return user;
}

export async function listClients(query: ClientListQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    role: UserRole.CLIENT,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { clientProfile: { include: { assignedPlan: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const items = users.map((user) => ({
    user: toSafeUser(user),
    profile: user.clientProfile,
    assignedPlan: user.clientProfile?.assignedPlan ?? null,
  }));

  return paginate(items, page, limit, total);
}

export async function getClientById(clientId: string) {
  const user = await getClientUserOrThrow(clientId);

  const [subscriptions, payments, measurements, bookings, progressNotes] =
    await Promise.all([
      prisma.subscription.findMany({
        where: { clientId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { clientId },
        orderBy: { dueDate: "desc" },
        take: 20,
      }),
      prisma.bodyMeasurement.findMany({
        where: { clientId },
        orderBy: { measuredAt: "desc" },
        take: 20,
      }),
      prisma.booking.findMany({
        where: { clientId },
        orderBy: { startTime: "desc" },
        take: 20,
      }),
      prisma.progressNote.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  return {
    user: toSafeUser(user),
    profile: user.clientProfile,
    subscriptions,
    payments,
    measurements,
    bookings,
    progressNotes,
  };
}

export async function createClient(input: CreateClientInput, actorUserId: string) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("Email already in use");
  }

  const passwordHash = await hashPassword(input.temporaryPassword);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        passwordHash,
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
      },
    });

    const profile = await tx.clientProfile.create({
      data: {
        userId: user.id,
        dateOfBirth: toDateOnly(input.dateOfBirth),
        gender: input.gender,
        heightCm: input.heightCm,
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        fitnessGoal: input.fitnessGoal,
        medicalNotes: input.medicalNotes || null,
        injuries: input.injuries || null,
        activityLevel: input.activityLevel,
        joinDate: toDateOnly(input.joinDate),
        coachNotes: input.coachNotes || null,
        assignedPlanId: input.assignedPlanId ?? null,
        status: ClientStatus.ACTIVE,
      },
      include: { assignedPlan: true },
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "client.created",
        entityType: "User",
        entityId: user.id,
        metadata: { email: user.email },
      },
    });

    return { user, profile };
  });

  return {
    user: toSafeUser(result.user),
    profile: result.profile,
  };
}

export async function updateClient(
  clientId: string,
  input: UpdateClientInput,
  actorUserId: string,
) {
  await getClientUserOrThrow(clientId);

  const userData: Record<string, unknown> = {};
  const profileData: Record<string, unknown> = {};

  if (input.fullName !== undefined) userData.fullName = input.fullName;
  if (input.phoneNumber !== undefined) userData.phoneNumber = input.phoneNumber;
  if (input.dateOfBirth !== undefined) {
    profileData.dateOfBirth = toDateOnly(input.dateOfBirth);
  }
  if (input.gender !== undefined) profileData.gender = input.gender;
  if (input.heightCm !== undefined) profileData.heightCm = input.heightCm;
  if (input.emergencyContactName !== undefined) {
    profileData.emergencyContactName = input.emergencyContactName;
  }
  if (input.emergencyContactPhone !== undefined) {
    profileData.emergencyContactPhone = input.emergencyContactPhone;
  }
  if (input.fitnessGoal !== undefined) profileData.fitnessGoal = input.fitnessGoal;
  if (input.activityLevel !== undefined) {
    profileData.activityLevel = input.activityLevel;
  }
  if (input.medicalNotes !== undefined) profileData.medicalNotes = input.medicalNotes;
  if (input.injuries !== undefined) profileData.injuries = input.injuries;
  if (input.assignedPlanId !== undefined) {
    profileData.assignedPlanId = input.assignedPlanId;
  }
  if (input.joinDate !== undefined) profileData.joinDate = toDateOnly(input.joinDate);
  if (input.coachNotes !== undefined) profileData.coachNotes = input.coachNotes;

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: clientId }, data: userData });
    }

    const profile = await tx.clientProfile.update({
      where: { userId: clientId },
      data: profileData,
      include: { assignedPlan: true },
    });

    const user = await tx.user.findUniqueOrThrow({ where: { id: clientId } });

    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "client.updated",
        entityType: "User",
        entityId: clientId,
        metadata: input,
      },
    });

    return { user, profile };
  });

  return {
    user: toSafeUser(updated.user),
    profile: updated.profile,
  };
}

async function setClientStatus(
  clientId: string,
  userStatus: UserStatus,
  actorUserId: string,
  action: string,
) {
  await getClientUserOrThrow(clientId);

  const clientProfileStatus = mapUserStatusToClientStatus(userStatus);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: clientId },
      data: { status: userStatus },
    });

    const profile = await tx.clientProfile.update({
      where: { userId: clientId },
      data: { status: clientProfileStatus },
      include: { assignedPlan: true },
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        action,
        entityType: "User",
        entityId: clientId,
      },
    });

    return { user, profile };
  });

  return {
    user: toSafeUser(result.user),
    profile: result.profile,
  };
}

export async function freezeClient(clientId: string, actorUserId: string) {
  return setClientStatus(clientId, UserStatus.FROZEN, actorUserId, "client.frozen");
}

export async function reactivateClient(clientId: string, actorUserId: string) {
  return setClientStatus(
    clientId,
    UserStatus.ACTIVE,
    actorUserId,
    "client.reactivated",
  );
}

export async function softDeleteClient(clientId: string, actorUserId: string) {
  return setClientStatus(
    clientId,
    UserStatus.DELETED,
    actorUserId,
    "client.deleted",
  );
}
