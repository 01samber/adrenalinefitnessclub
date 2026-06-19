import { verifyPassword } from "../src/lib/password";
import prisma from "../src/lib/prisma";

const TEST_EMAIL = "anwargreige@afc.com";
const TEST_PASSWORD = "1234";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    select: {
      email: true,
      role: true,
      status: true,
      passwordHash: true,
    },
  });

  const passwordMatches = user
    ? await verifyPassword(TEST_PASSWORD, user.passwordHash)
    : false;

  const result = {
    exists: Boolean(user),
    email: user?.email ?? TEST_EMAIL,
    role: user?.role ?? null,
    status: user?.status ?? null,
    passwordMatches,
  };

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error("check-auth-user failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
