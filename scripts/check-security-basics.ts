import { SubscriptionStatus, UserRole } from "@prisma/client";
import { verifyPassword } from "../src/lib/password";
import prisma from "../src/lib/prisma";
import { toSafeUser } from "../src/server/utils/safe-user";

const KNOWN_CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL ?? "client@afc.com";
const KNOWN_CLIENT_PASSWORD = process.env.SEED_CLIENT_PASSWORD ?? "1234";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: KNOWN_CLIENT_EMAIL },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      passwordHash: true,
      clientProfile: {
        select: {
          id: true,
          status: true,
          assignedPlanId: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(`Known client not found: ${KNOWN_CLIENT_EMAIL}`);
  }

  const passwordMatches = await verifyPassword(
    KNOWN_CLIENT_PASSWORD,
    user.passwordHash,
  );

  const safeUser = toSafeUser(user);
  const safeUserHasPasswordHash = Object.prototype.hasOwnProperty.call(
    safeUser,
    "passwordHash",
  );

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      clientId: user.id,
      status: SubscriptionStatus.ACTIVE,
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const planLinked =
  Boolean(activeSubscription) &&
  Boolean(user.clientProfile?.assignedPlanId) &&
  activeSubscription!.planId === user.clientProfile!.assignedPlanId;

  const result = {
    clientExists: true,
    email: user.email,
    role: user.role,
    userStatus: user.status,
    profileStatus: user.clientProfile?.status ?? null,
    passwordHashStored: Boolean(user.passwordHash),
    passwordMatches,
    safeUserExcludesPasswordHash: !safeUserHasPasswordHash,
    activeSubscriptionExists: Boolean(activeSubscription),
    subscriptionPlanId: activeSubscription?.planId ?? null,
    assignedPlanId: user.clientProfile?.assignedPlanId ?? null,
    planLinked,
    planName: activeSubscription?.plan.name ?? null,
    sessionsPerWeek: activeSubscription?.plan.sessionsPerWeek ?? null,
  };

  console.log(JSON.stringify(result, null, 2));

  if (!passwordMatches) {
    throw new Error("Password verification failed for known client");
  }

  if (safeUserHasPasswordHash) {
    throw new Error("toSafeUser must not expose passwordHash");
  }

  if (user.role !== UserRole.CLIENT) {
    throw new Error("Known user is not a CLIENT");
  }
}

main()
  .catch((error) => {
    console.error("check-security-basics failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
