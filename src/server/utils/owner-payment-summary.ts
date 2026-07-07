import { PaymentStatus, type Prisma, type PrismaClient } from "@prisma/client";

export type OwnerPaymentsSummary = {
  scope: "filtered";
  totalPayments: number;
  paidPayments: number;
  unpaidPayments: number;
  partialPayments: number;
  overduePayments: number;
  cancelledPayments: number;
  paidAmount: string;
  unpaidAmount: string;
  partialAmount: string;
  overdueAmount: string;
  outstandingAmount: string;
  totalExpectedAmount: string;
  collectionRate: number;
  currency: string;
  currencyMixed: boolean;
};

const ZERO_CENTS = BigInt(0);
const HUNDRED_CENTS = BigInt(100);
const TEN_THOUSAND = BigInt(10000);

function parseAmountToCents(value: { toString(): string } | null | undefined): bigint {
  if (value == null) {
    return ZERO_CENTS;
  }

  const normalized = value.toString().trim();
  if (!normalized) {
    return ZERO_CENTS;
  }

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  const whole = wholePart === "" ? ZERO_CENTS : BigInt(wholePart);
  const fractionDigits = (fractionPart + "00").slice(0, 2);
  const fraction = BigInt(fractionDigits);

  const cents = whole * HUNDRED_CENTS + fraction;
  return negative ? -cents : cents;
}

function centsToMoneyString(cents: bigint): string {
  const negative = cents < ZERO_CENTS;
  const absolute = negative ? -cents : cents;
  const whole = absolute / HUNDRED_CENTS;
  const fraction = absolute % HUNDRED_CENTS;

  return `${negative ? "-" : ""}${whole}.${String(fraction).padStart(2, "0")}`;
}

function computeCollectionRate(
  paidCents: bigint,
  totalExpectedCents: bigint,
): number {
  if (totalExpectedCents <= ZERO_CENTS) {
    return 0;
  }

  const basisPoints = (paidCents * TEN_THOUSAND) / totalExpectedCents;
  return Number(basisPoints) / 100;
}

export async function computeOwnerPaymentsSummary(
  prisma: PrismaClient,
  where: Prisma.PaymentWhereInput,
): Promise<OwnerPaymentsSummary> {
  const [statusGroups, totalPayments] = await Promise.all([
    prisma.payment.groupBy({
      by: ["status", "currency"],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.count({ where }),
  ]);

  const statusCounts: Record<PaymentStatus, number> = {
    [PaymentStatus.PAID]: 0,
    [PaymentStatus.UNPAID]: 0,
    [PaymentStatus.PARTIAL]: 0,
    [PaymentStatus.OVERDUE]: 0,
    [PaymentStatus.CANCELLED]: 0,
  };

  const amountCentsByStatus: Record<PaymentStatus, bigint> = {
    [PaymentStatus.PAID]: ZERO_CENTS,
    [PaymentStatus.UNPAID]: ZERO_CENTS,
    [PaymentStatus.PARTIAL]: ZERO_CENTS,
    [PaymentStatus.OVERDUE]: ZERO_CENTS,
    [PaymentStatus.CANCELLED]: ZERO_CENTS,
  };

  const currencies = new Set<string>();

  for (const row of statusGroups) {
    statusCounts[row.status] += row._count._all;
    amountCentsByStatus[row.status] += parseAmountToCents(row._sum.amount);
    currencies.add(row.currency);
  }

  const paidCents = amountCentsByStatus[PaymentStatus.PAID];
  const unpaidCents = amountCentsByStatus[PaymentStatus.UNPAID];
  const partialCents = amountCentsByStatus[PaymentStatus.PARTIAL];
  const overdueCents = amountCentsByStatus[PaymentStatus.OVERDUE];

  const outstandingCents = unpaidCents + partialCents + overdueCents;
  const totalExpectedCents =
    paidCents + unpaidCents + partialCents + overdueCents;

  const currencyList = [...currencies];

  return {
    scope: "filtered",
    totalPayments,
    paidPayments: statusCounts[PaymentStatus.PAID],
    unpaidPayments: statusCounts[PaymentStatus.UNPAID],
    partialPayments: statusCounts[PaymentStatus.PARTIAL],
    overduePayments: statusCounts[PaymentStatus.OVERDUE],
    cancelledPayments: statusCounts[PaymentStatus.CANCELLED],
    paidAmount: centsToMoneyString(paidCents),
    unpaidAmount: centsToMoneyString(unpaidCents),
    partialAmount: centsToMoneyString(partialCents),
    overdueAmount: centsToMoneyString(overdueCents),
    outstandingAmount: centsToMoneyString(outstandingCents),
    totalExpectedAmount: centsToMoneyString(totalExpectedCents),
    collectionRate: computeCollectionRate(paidCents, totalExpectedCents),
    currency: currencyList[0] ?? "USD",
    currencyMixed: currencyList.length > 1,
  };
}
