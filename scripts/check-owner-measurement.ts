import { UserRole } from "@prisma/client";
import prisma from "../src/lib/prisma";
import { getClientMe } from "../src/server/services/client.service";
import { getClientById } from "../src/server/services/owner-client.service";
import { listClients } from "../src/server/services/owner-client.service";
import { createOwnerClientMeasurement } from "../src/server/services/measurement.service";

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "anwargreige@afc.com";
const CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL ?? "client@afc.com";

function hasPasswordHash(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return JSON.stringify(value).includes("passwordHash");
}

async function main() {
  const [owner, client] = await Promise.all([
    prisma.user.findUnique({
      where: { email: OWNER_EMAIL },
      select: { id: true, role: true },
    }),
    prisma.user.findUnique({
      where: { email: CLIENT_EMAIL },
      select: { id: true, email: true, role: true },
    }),
  ]);

  if (!owner || owner.role !== UserRole.OWNER) {
    throw new Error(`Owner not found: ${OWNER_EMAIL}`);
  }

  if (!client || client.role !== UserRole.CLIENT) {
    throw new Error(`Client not found: ${CLIENT_EMAIL}`);
  }

  const measuredAt = new Date().toISOString().slice(0, 10);

  const measurement = await createOwnerClientMeasurement(
    client.id,
    {
      measuredAt,
      weightKg: 82,
      bodyFatPercentage: 18,
      muscleKg: 36,
      chestCm: 102,
      waistCm: 84,
      hipsCm: 96,
      armsCm: 36,
      thighsCm: 58,
      coachAssessment: "Check script: good progress.",
      notes: "Automated owner measurement check.",
    },
    owner.id,
  );

  const [roster, detail, clientMe] = await Promise.all([
    listClients({ page: 1, limit: 20, search: CLIENT_EMAIL }),
    getClientById(client.id),
    getClientMe(client.id),
  ]);

  const rosterItem = roster.items.find((item) => item.user.id === client.id);
  const detailHasMeasurement = detail.measurements.some(
    (item) => item.id === measurement.id,
  );

  const output = {
    measurementCreated: Boolean(measurement.id),
    measurementId: measurement.id,
    clientId: measurement.clientId,
    exposesPasswordHash: hasPasswordHash(measurement),
    rosterLatestMeasurementId: rosterItem?.latestMeasurement?.id ?? null,
    rosterMatchesCreated:
      rosterItem?.latestMeasurement?.id === measurement.id,
    detailIncludesMeasurement: detailHasMeasurement,
    clientMeLatestMeasurementId: clientMe.latestBodyMeasurement?.id ?? null,
    clientMeMatchesCreated:
      clientMe.latestBodyMeasurement?.id === measurement.id,
  };

  console.log(JSON.stringify(output, null, 2));

  if (hasPasswordHash(measurement)) {
    throw new Error("Measurement response must not expose passwordHash");
  }

  if (!output.measurementCreated) {
    throw new Error("Measurement was not created");
  }

  if (!output.detailIncludesMeasurement) {
    throw new Error("Owner client detail must include the new measurement");
  }

  if (!output.clientMeMatchesCreated) {
    throw new Error("Client dashboard must show the latest measurement");
  }
}

main()
  .catch((error) => {
    console.error("check-owner-measurement failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
