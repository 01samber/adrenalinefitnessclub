import { UserRole } from "@prisma/client";
import { listClients } from "../src/server/services/owner-client.service";

function itemHasPasswordHash(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return JSON.stringify(value).includes("passwordHash");
}

async function main() {
  const result = await listClients({ page: 1, limit: 20 });

  if (!result.items.length) {
    throw new Error("Owner client list returned no items");
  }

  const withAssignedPlan = result.items.filter((item) => item.assignedPlan);
  const withActiveSubscription = result.items.filter(
    (item) => item.activeSubscription,
  );

  const sample = result.items[0];

  const output = {
    totalItems: result.items.length,
    pagination: result.pagination,
    exposesPasswordHash: result.items.some((item) =>
      itemHasPasswordHash(item),
    ),
    itemsWithAssignedPlan: withAssignedPlan.length,
    itemsWithActiveSubscription: withActiveSubscription.length,
    sampleClient: {
      id: sample.user.id,
      email: sample.user.email,
      role: sample.user.role,
      assignedPlanName: sample.assignedPlan?.name ?? null,
      activeSubscriptionStatus: sample.activeSubscription?.status ?? null,
      activeSubscriptionPlan: sample.activeSubscription?.plan.name ?? null,
      latestPaymentStatus: sample.latestPayment?.status ?? null,
      latestMeasurementAt: sample.latestMeasurement?.measuredAt ?? null,
    },
    knownClientWithPlan: withAssignedPlan[0]
      ? {
          email: withAssignedPlan[0].user.email,
          plan: withAssignedPlan[0].assignedPlan?.name,
          activeSubscription: withAssignedPlan[0].activeSubscription?.status ?? null,
        }
      : null,
  };

  console.log(JSON.stringify(output, null, 2));

  if (output.exposesPasswordHash) {
    throw new Error("List items must not expose passwordHash");
  }

  if (sample.user.role !== UserRole.CLIENT) {
    throw new Error("List items must be CLIENT users");
  }

  for (const item of result.items) {
    if (item.latestPayment && itemHasPasswordHash(item.latestPayment)) {
      throw new Error("latestPayment must not expose sensitive fields");
    }
    if (item.latestMeasurement && itemHasPasswordHash(item.latestMeasurement)) {
      throw new Error("latestMeasurement must not expose sensitive fields");
    }
    if (item.activeSubscription && itemHasPasswordHash(item.activeSubscription)) {
      throw new Error("activeSubscription must not expose sensitive fields");
    }
  }
}

main()
  .catch((error) => {
    console.error("check-owner-client-list failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = (await import("../src/lib/prisma")).default;
    await prisma.$disconnect();
  });
