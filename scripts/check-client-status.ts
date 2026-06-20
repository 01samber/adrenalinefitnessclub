import { UserStatus } from "@prisma/client";
import prisma from "../src/lib/prisma";
import { isLoginAllowed } from "../src/lib/auth";

const CLIENT_EMAIL = process.env.CHECK_CLIENT_EMAIL ?? "client@afc.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: CLIENT_EMAIL },
    select: {
      email: true,
      role: true,
      status: true,
      clientProfile: {
        select: {
          status: true,
        },
      },
    },
  });

  const userStatus = user?.status ?? null;
  const clientProfileStatus = user?.clientProfile?.status ?? null;

  const expectedProfileStatus =
    userStatus === UserStatus.FROZEN
      ? "FROZEN"
      : userStatus === UserStatus.ACTIVE
        ? "ACTIVE"
        : userStatus === UserStatus.DELETED
          ? "DELETED"
          : userStatus === UserStatus.SUSPENDED
            ? "INACTIVE"
            : null;

  const result = {
    email: CLIENT_EMAIL,
    exists: Boolean(user),
    userStatus,
    clientProfileStatus,
    statusesConsistent:
      userStatus === null
        ? null
        : clientProfileStatus === expectedProfileStatus,
    canLoginExpected: userStatus ? isLoginAllowed(userStatus) : false,
  };

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error("check-client-status failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
