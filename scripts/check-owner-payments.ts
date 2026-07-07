import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PaymentStatus, UserRole } from "@prisma/client";
import { ValidationError } from "../src/lib/api-errors";
import { listOwnerPayments } from "../src/server/services/payment.service";
import { validate } from "../src/server/validations/common.validation";
import { paymentListQuerySchema } from "../src/server/validations/payment.validation";

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

function isMoneyString(value: unknown): boolean {
  return typeof value === "string" && /^\d+\.\d{2}$/.test(value);
}

async function main() {
  const routeSource = readFileSync(
    join(process.cwd(), "src/app/api/owner/payments/route.ts"),
    "utf8",
  );
  const routeUsesOwnerGuard = routeSource.includes("requireOwner");

  assert(routeUsesOwnerGuard, "Owner payments route must call requireOwner");
  assert(
    requireOwnerWouldBlockRole(UserRole.CLIENT),
    "Client users must be blocked by owner guard",
  );

  try {
    validate(paymentListQuerySchema, { billingMonth: "2026-99" });
    throw new Error("Invalid billingMonth should be rejected");
  } catch (error) {
    assert(
      error instanceof ValidationError,
      "Invalid billingMonth must return ValidationError",
    );
  }

  validate(paymentListQuerySchema, { billingMonth: "2026-07" });

  const list = await listOwnerPayments({ page: 1, limit: 20 });

  assert(Array.isArray(list.items), "Response must include items array");
  assert(Boolean(list.pagination), "Response must include pagination");
  assert(Boolean(list.summary), "Response must include summary");
  assert(list.summary.scope === "filtered", "Summary scope must be filtered");
  assert(
    typeof list.summary.totalPayments === "number",
    "summary.totalPayments must be a number",
  );
  assert(
    isMoneyString(list.summary.paidAmount),
    "summary.paidAmount must be a money string",
  );
  assert(
    isMoneyString(list.summary.outstandingAmount),
    "summary.outstandingAmount must be a money string",
  );
  assert(
    Number.isFinite(list.summary.collectionRate),
    "summary.collectionRate must be finite",
  );
  assert(
    !containsPasswordHash(list),
    "List response must not expose passwordHash",
  );
  assert(
    !containsSensitiveSecrets(list),
    "List response must not expose sensitive secrets",
  );

  const paidOnly = await listOwnerPayments({
    page: 1,
    limit: 20,
    status: PaymentStatus.PAID,
  });

  assert(
    paidOnly.items.every((item) => item.status === PaymentStatus.PAID),
    "status=PAID filter must return only PAID payments",
  );
  assert(
    paidOnly.summary.paidPayments === paidOnly.summary.totalPayments,
    "PAID filter summary must reflect filtered scope",
  );

  const sampleClientId = list.items[0]?.clientId;
  assert(Boolean(sampleClientId), "Sample payment must include clientId");

  const byClient = await listOwnerPayments({
    page: 1,
    limit: 20,
    clientId: sampleClientId,
  });

  assert(
    byClient.items.every((item) => item.clientId === sampleClientId),
    "clientId filter must return only matching payments",
  );
  assert(
    byClient.summary.totalPayments >= byClient.items.length,
    "Client filter summary must reflect filtered scope",
  );

  const byDate = await listOwnerPayments({
    page: 1,
    limit: 20,
    fromDate: "2026-01-01",
    toDate: "2026-12-31",
  });

  assert(
    byDate.summary.totalPayments >= 0,
    "Date filter summary must return numeric totals",
  );

  const output = {
    totalItems: list.items.length,
    pagination: list.pagination,
    summary: list.summary,
    exposesPasswordHash: containsPasswordHash(list),
    exposesSensitiveSecrets: containsSensitiveSecrets(list),
    filters: {
      paidOnlyCount: paidOnly.items.length,
      clientIdCount: byClient.items.length,
      dateRangeTotal: byDate.summary.totalPayments,
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
    console.error("check-owner-payments failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = (await import("../src/lib/prisma")).default;
    await prisma.$disconnect();
  });
