import type {
  BodyMeasurement,
  Payment,
  Plan,
  Subscription,
} from "@prisma/client";

export type SafeListPlan = {
  id: string;
  name: string;
  sessionsPerWeek: number;
  monthlyPrice: string;
  currency: string;
};

export type SafeListActiveSubscription = {
  id: string;
  status: Subscription["status"];
  startDate: string;
  endDate: string | null;
  nextBillingDate: string;
  plan: SafeListPlan;
};

export type SafeListPayment = {
  id: string;
  amount: string;
  currency: string;
  status: Payment["status"];
  paidAt: string | null;
  dueDate: string;
};

export type SafeListMeasurement = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  muscleKg: number | null;
};

export function toSafeListPlan(plan: Plan): SafeListPlan {
  return {
    id: plan.id,
    name: plan.name,
    sessionsPerWeek: plan.sessionsPerWeek,
    monthlyPrice: plan.monthlyPrice.toString(),
    currency: plan.currency,
  };
}

export function toSafeListActiveSubscription(
  subscription: Subscription & { plan: Plan },
): SafeListActiveSubscription {
  return {
    id: subscription.id,
    status: subscription.status,
    startDate: subscription.startDate.toISOString().slice(0, 10),
    endDate: subscription.endDate
      ? subscription.endDate.toISOString().slice(0, 10)
      : null,
    nextBillingDate: subscription.nextBillingDate.toISOString().slice(0, 10),
    plan: toSafeListPlan(subscription.plan),
  };
}

export function toSafeListPayment(payment: Payment): SafeListPayment {
  return {
    id: payment.id,
    amount: payment.amount.toString(),
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paymentDate?.toISOString() ?? null,
    dueDate: payment.dueDate.toISOString().slice(0, 10),
  };
}

function decimalToNumber(value: { toString(): string } | null | undefined) {
  if (value == null) return null;
  const numeric = Number(value.toString());
  return Number.isNaN(numeric) ? null : numeric;
}

export function toSafeListMeasurement(
  measurement: BodyMeasurement,
): SafeListMeasurement {
  return {
    id: measurement.id,
    measuredAt: measurement.measuredAt.toISOString(),
    weightKg: decimalToNumber(measurement.weightKg),
    bodyFatPercentage: decimalToNumber(measurement.bodyFatPercentage),
    muscleKg: decimalToNumber(measurement.muscleKg),
  };
}

export type SafeOwnerMeasurement = {
  id: string;
  clientId: string;
  measuredAt: string;
  weightKg: number;
  heightCmSnapshot: number;
  bodyFatPercentage: number | null;
  muscleKg: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armsCm: number | null;
  thighsCm: number | null;
  coachAssessment: string | null;
  notes: string | null;
};

export function toSafeOwnerMeasurement(
  measurement: BodyMeasurement,
): SafeOwnerMeasurement {
  return {
    id: measurement.id,
    clientId: measurement.clientId,
    measuredAt: measurement.measuredAt.toISOString(),
    weightKg: decimalToNumber(measurement.weightKg) ?? 0,
    heightCmSnapshot: decimalToNumber(measurement.heightCmSnapshot) ?? 0,
    bodyFatPercentage: decimalToNumber(measurement.bodyFatPercentage),
    muscleKg: decimalToNumber(measurement.muscleKg),
    chestCm: decimalToNumber(measurement.chestCm),
    waistCm: decimalToNumber(measurement.waistCm),
    hipsCm: decimalToNumber(measurement.hipsCm),
    armsCm: decimalToNumber(measurement.armsCm),
    thighsCm: decimalToNumber(measurement.thighsCm),
    coachAssessment: measurement.coachAssessment,
    notes: measurement.notes,
  };
}

export function firstRowPerClientId<T extends { clientId: string }>(
  rows: T[],
): Map<string, T> {
  const map = new Map<string, T>();

  for (const row of rows) {
    if (!map.has(row.clientId)) {
      map.set(row.clientId, row);
    }
  }

  return map;
}
