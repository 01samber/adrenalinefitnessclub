import { UserRole } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import { toSafeOwnerMeasurement } from "@/server/utils/owner-client-list.mapper";
import type {
  CreateMeasurementInput,
  CreateOwnerClientMeasurementInput,
  MeasurementListQuery,
} from "@/server/validations/measurement.validation";
import { toDateOnly } from "@/server/utils/dates";
import { parsePagination, paginate } from "@/server/utils/pagination";

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calculateDerivedMetrics(input: {
  weightKg: number;
  heightCmSnapshot: number;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  waterPercentage?: number | null;
}) {
  const heightM = input.heightCmSnapshot / 100;
  const bmi = round(input.weightKg / (heightM * heightM));

  const derived: {
    bmi: number;
    bodyFatKg?: number;
    muscleKg?: number;
    waterLiters?: number;
  } = { bmi };

  if (input.bodyFatPercentage != null) {
    derived.bodyFatKg = round(
      input.weightKg * (input.bodyFatPercentage / 100),
    );
  }

  if (input.musclePercentage != null) {
    derived.muscleKg = round(
      input.weightKg * (input.musclePercentage / 100),
    );
  }

  if (input.waterPercentage != null) {
    derived.waterLiters = round(
      input.weightKg * (input.waterPercentage / 100),
    );
  }

  return derived;
}

function buildMeasurementWhere(query: MeasurementListQuery, clientId?: string) {
  const measuredAtFilter: { gte?: Date; lte?: Date } = {};

  if (query.fromDate) {
    measuredAtFilter.gte = toDateOnly(query.fromDate);
  }

  if (query.toDate) {
    const end = toDateOnly(query.toDate);
    end.setUTCHours(23, 59, 59, 999);
    measuredAtFilter.lte = end;
  }

  return {
    ...(clientId ? { clientId } : {}),
    ...(query.clientId && !clientId ? { clientId: query.clientId } : {}),
    ...(Object.keys(measuredAtFilter).length > 0
      ? { measuredAt: measuredAtFilter }
      : {}),
  };
}

export async function listOwnerMeasurements(query: MeasurementListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildMeasurementWhere(query);

  const [items, total] = await Promise.all([
    prisma.bodyMeasurement.findMany({
      where,
      orderBy: { measuredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.bodyMeasurement.count({ where }),
  ]);

  return paginate(items, page, limit, total);
}

export async function listClientMeasurements(
  userId: string,
  query: MeasurementListQuery,
) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildMeasurementWhere(query, userId);

  const [items, total] = await Promise.all([
    prisma.bodyMeasurement.findMany({
      where,
      orderBy: { measuredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.bodyMeasurement.count({ where }),
  ]);

  return paginate(items, page, limit, total);
}

export async function createMeasurement(
  input: CreateMeasurementInput,
  actorUserId: string,
) {
  const client = await prisma.user.findFirst({
    where: { id: input.clientId, role: UserRole.CLIENT },
  });

  if (!client) {
    throw new NotFoundError("Client not found");
  }

  const derived = calculateDerivedMetrics({
    weightKg: input.weightKg,
    heightCmSnapshot: input.heightCmSnapshot,
    bodyFatPercentage: input.bodyFatPercentage,
    musclePercentage: input.musclePercentage,
    waterPercentage: input.waterPercentage,
  });

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: input.clientId,
      measuredAt: new Date(input.measuredAt),
      weightKg: input.weightKg,
      heightCmSnapshot: input.heightCmSnapshot,
      bmi: derived.bmi,
      bodyFatPercentage: input.bodyFatPercentage ?? null,
      bodyFatKg: derived.bodyFatKg ?? null,
      musclePercentage: input.musclePercentage ?? null,
      muscleKg: input.muscleKg ?? derived.muscleKg ?? null,
      waterPercentage: input.waterPercentage ?? null,
      waterLiters: derived.waterLiters ?? null,
      visceralFatKg: input.visceralFatKg ?? null,
      basalMetabolicRate: input.basalMetabolicRate ?? null,
      metabolicAge: input.metabolicAge ?? null,
      chestCm: input.chestCm ?? null,
      waistCm: input.waistCm ?? null,
      hipsCm: input.hipsCm ?? null,
      armsCm: input.armsCm ?? null,
      thighsCm: input.thighsCm ?? null,
      notes: input.notes ?? null,
      coachAssessment: input.coachAssessment ?? null,
    },
  });

  await createAuditLog({
    actorUserId,
    action: "measurement.created",
    entityType: "BodyMeasurement",
    entityId: measurement.id,
    metadata: { clientId: input.clientId },
  });

  return measurement;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function createOwnerClientMeasurement(
  clientId: string,
  input: CreateOwnerClientMeasurementInput,
  actorUserId: string,
) {
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: UserRole.CLIENT },
    include: { clientProfile: true },
  });

  if (!client?.clientProfile) {
    throw new NotFoundError("Client not found");
  }

  const heightCmSnapshot =
    input.heightCmSnapshot ?? Number(client.clientProfile.heightCm);

  if (!heightCmSnapshot || heightCmSnapshot <= 0) {
    throw new ValidationError(
      "A valid height is required. Provide heightCmSnapshot or ensure the client profile has heightCm.",
    );
  }

  const measuredAtDate = input.measuredAt ?? todayIsoDate();
  const measuredAt = `${measuredAtDate}T00:00:00.000Z`;

  const measurement = await createMeasurement(
    {
      clientId,
      measuredAt,
      weightKg: input.weightKg!,
      heightCmSnapshot,
      bodyFatPercentage: input.bodyFatPercentage ?? null,
      muscleKg: input.muscleKg ?? null,
      musclePercentage: input.musclePercentage ?? null,
      waterPercentage: input.waterPercentage ?? null,
      visceralFatKg: input.visceralFatKg ?? null,
      basalMetabolicRate: input.basalMetabolicRate ?? null,
      metabolicAge: input.metabolicAge ?? null,
      chestCm: input.chestCm ?? null,
      waistCm: input.waistCm ?? null,
      hipsCm: input.hipsCm ?? null,
      armsCm: input.armsCm ?? null,
      thighsCm: input.thighsCm ?? null,
      notes: input.notes?.trim() || null,
      coachAssessment: input.coachAssessment?.trim() || null,
    },
    actorUserId,
  );

  return toSafeOwnerMeasurement(measurement);
}
