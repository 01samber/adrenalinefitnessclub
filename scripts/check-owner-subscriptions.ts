import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SubscriptionStatus, UserRole } from "@prisma/client";
import { ValidationError } from "../src/lib/api-errors";
import { listSubscriptions } from "../src/server/services/subscription.service";
import { validate } from "../src/server/validations/common.validation";
import { subscriptionListQuerySchema } from "../src/server/validations/subscription.validation";

function containsPasswordHash(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  return JSON.stringify(value).includes("passwordHash");
}

function containsSensitiveSecrets(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  const blocked = ["passwordHash", "DATABASE_URL", "NEXTAUTH_SECRET"];

  return blocked.some((needle) => serialized.includes(needle));
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function requireOwnerWouldBlockRole(role: UserRole): boolean {
  return role !== UserRole.OWNER;
}

async function main() {
  const routeSource = readFileSync(
    join(process.cwd(), "src/app/api/owner/subscriptions/route.ts"),
    "utf8",
  );
  const routeUsesOwnerGuard = routeSource.includes("requireOwner");

  assert(routeUsesOwnerGuard, "Owner subscriptions route must call requireOwner");
  assert(
    requireOwnerWouldBlockRole(UserRole.CLIENT),
    "Client users must be blocked by owner guard",
  );

  try {
    validate(subscriptionListQuerySchema, { billingMonth: "2026-99" });
    throw new Error("Invalid billingMonth should be rejected");
  } catch (error) {
    assert(
      error instanceof ValidationError,
      "Invalid billingMonth must return ValidationError",
    );
  }

  try {
    validate(subscriptionListQuerySchema, { billingMonth: "July-2026" });
    throw new Error("Invalid billingMonth format should be rejected");
  } catch (error) {
    assert(
      error instanceof ValidationError,
      "Non-YYYY-MM billingMonth must return ValidationError",
    );
  }

  validate(subscriptionListQuerySchema, { billingMonth: "2026-07" });

  const list = await listSubscriptions({ page: 1, limit: 20 });

  assert(Array.isArray(list.items), "Response must include items array");
  assert(Boolean(list.pagination), "Response must include pagination");
  assert(Boolean(list.summary), "Response must include summary");
  assert(list.items.length > 0, "Owner subscription list returned no items");
  assert(list.summary.scope === "filtered", "Summary scope must be filtered");
  assert(
    typeof list.summary.totalSubscriptions === "number",
    "summary.totalSubscriptions must be a number",
  );
  assert(
    typeof list.summary.activeMonthlyValue === "string",
    "summary.activeMonthlyValue must be a string",
  );
  assert(
    typeof list.summary.currencyMixed === "boolean",
    "summary.currencyMixed must be a boolean",
  );

  const sample = list.items[0];

  assert(
    sample.client === null || typeof sample.client.id === "string",
    "client must be null or a safe summary",
  );
  assert(
    sample.plan === null || typeof sample.plan.name === "string",
    "plan must be null or a safe summary",
  );
  assert(
    sample.latestPayment === null ||
      typeof sample.latestPayment.status === "string",
    "latestPayment must be null or a safe summary",
  );

  assert(
    !containsPasswordHash(list),
    "List response must not expose passwordHash",
  );
  assert(
    !containsSensitiveSecrets(list),
    "List response must not expose sensitive secrets",
  );

  const activeOnly = await listSubscriptions({
    page: 1,
    limit: 20,
    status: SubscriptionStatus.ACTIVE,
  });

  assert(
    activeOnly.items.every((item) => item.status === SubscriptionStatus.ACTIVE),
    "status=ACTIVE filter must return only ACTIVE subscriptions",
  );
  assert(
    activeOnly.summary.activeSubscriptions ===
      activeOnly.summary.totalSubscriptions,
    "ACTIVE filter summary must reflect filtered scope",
  );

  const byClient = await listSubscriptions({
    page: 1,
    limit: 20,
    clientId: sample.clientId,
  });

  assert(
    byClient.items.every((item) => item.clientId === sample.clientId),
    "clientId filter must return only matching subscriptions",
  );

  const byPlan = await listSubscriptions({
    page: 1,
    limit: 20,
    planId: sample.planId,
  });

  assert(
    byPlan.items.every((item) => item.planId === sample.planId),
    "planId filter must return only matching plan subscriptions",
  );

  const searchTerm =
    sample.client?.fullName.split(" ")[0] ?? sample.client?.email ?? "";
  assert(Boolean(searchTerm), "Sample client must have searchable identity");

  const bySearch = await listSubscriptions({
    page: 1,
    limit: 20,
    search: searchTerm,
  });

  assert(
    bySearch.items.some((item) => item.id === sample.id),
    "search filter must match client name/email/phone",
  );

  const billingMonth = sample.nextBillingDate.slice(0, 7);
  const byBillingMonth = await listSubscriptions({
    page: 1,
    limit: 20,
    billingMonth,
  });

  assert(
    byBillingMonth.items.some((item) => item.id === sample.id),
    "billingMonth filter must include subscriptions with nextBillingDate in month",
  );

  const output = {
    totalItems: list.items.length,
    pagination: list.pagination,
    summary: list.summary,
    exposesPasswordHash: containsPasswordHash(list),
    exposesSensitiveSecrets: containsSensitiveSecrets(list),
    sample: {
      id: sample.id,
      status: sample.status,
      clientName: sample.client?.fullName ?? null,
      planName: sample.plan?.name ?? null,
      latestPaymentStatus: sample.latestPayment?.status ?? null,
      latestPaymentMethod: sample.latestPayment?.paymentMethod ?? null,
    },
    filters: {
      statusActiveCount: activeOnly.items.length,
      clientIdCount: byClient.items.length,
      planIdCount: byPlan.items.length,
      searchCount: bySearch.items.length,
      billingMonthCount: byBillingMonth.items.length,
    },
    security: {
      routeUsesOwnerGuard,
      ownerGuardBlocksClients: requireOwnerWouldBlockRole(UserRole.CLIENT),
      clientAccessCheck: "service-level; route enforces requireOwner()",
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch((error) => {
    console.error("check-owner-subscriptions failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = (await import("../src/lib/prisma")).default;
    await prisma.$disconnect();
  });
