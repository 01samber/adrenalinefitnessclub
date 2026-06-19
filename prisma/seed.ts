import {
  ActivityLevel,
  BookingRequestedBy,
  BookingStatus,
  ClientStatus,
  Gender,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  ScheduleSlotStatus,
  SubscriptionStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe_Owner123!";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe_Admin123!";
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "ChangeMe_Client123!";

  const [ownerHash, adminHash, clientHash] = await Promise.all([
    hashPassword(ownerPassword),
    hashPassword(adminPassword),
    hashPassword(clientPassword),
  ]);

  console.log("Seeding Adrenaline Fitness Center database...");

  // ─── Business ──────────────────────────────────────────────────────────────

  const business = await prisma.business.upsert({
    where: { id: "seed-business-adrenaline" },
    update: {},
    create: {
      id: "seed-business-adrenaline",
      name: "Adrenaline Fitness Center",
      description:
        "Private training studio focused on strength, conditioning, and personalized coaching.",
      phone: "+961 70 123 456",
      email: "info@adrenalinefitness.lb",
      address: "Beirut, Lebanon",
    },
  });

  console.log(`  Business: ${business.name}`);

  // ─── Owner users ───────────────────────────────────────────────────────────

  const gymOwner = await prisma.user.upsert({
    where: { email: "owner@adrenalinefitness.lb" },
    update: {},
    create: {
      fullName: "Karim Nassar",
      email: "owner@adrenalinefitness.lb",
      phoneNumber: "+961 70 111 222",
      passwordHash: ownerHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const developerAdmin = await prisma.user.upsert({
    where: { email: "admin@adrenalinefitness.lb" },
    update: {},
    create: {
      fullName: "Samer Developer",
      email: "admin@adrenalinefitness.lb",
      phoneNumber: "+961 70 999 888",
      passwordHash: adminHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`  Owners: ${gymOwner.fullName}, ${developerAdmin.fullName}`);

  // ─── Plans ─────────────────────────────────────────────────────────────────

  const planDefinitions = [
    { sessionsPerWeek: 2, monthlyPrice: 20 },
    { sessionsPerWeek: 3, monthlyPrice: 25 },
    { sessionsPerWeek: 4, monthlyPrice: 30 },
    { sessionsPerWeek: 5, monthlyPrice: 35 },
    { sessionsPerWeek: 6, monthlyPrice: 40 },
  ];

  const plans = await Promise.all(
    planDefinitions.map((plan) =>
      prisma.plan.upsert({
        where: { id: `seed-plan-${plan.sessionsPerWeek}x` },
        update: {},
        create: {
          id: `seed-plan-${plan.sessionsPerWeek}x`,
          name: `${plan.sessionsPerWeek} private sessions/week`,
          sessionsPerWeek: plan.sessionsPerWeek,
          monthlyPrice: plan.monthlyPrice,
          currency: "USD",
          isActive: true,
        },
      }),
    ),
  );

  console.log(`  Plans: ${plans.length} membership plans`);

  // ─── Exercise categories ───────────────────────────────────────────────────

  const categoryNames = [
    "Strength Training",
    "Cardio",
    "Mobility",
    "HIIT",
    "Weight Loss",
    "Muscle Gain",
    "Rehabilitation",
    "General Fitness",
  ];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.exerciseCategory.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name} exercises and programming.`,
        },
      }),
    ),
  );

  console.log(`  Exercise categories: ${categories.length}`);

  // ─── Sample client ─────────────────────────────────────────────────────────

  const sampleClient = await prisma.user.upsert({
    where: { email: "layla.haddad@example.com" },
    update: {},
    create: {
      fullName: "Layla Haddad",
      email: "layla.haddad@example.com",
      phoneNumber: "+961 76 555 123",
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    },
  });

  const assignedPlan = plans.find((p) => p.sessionsPerWeek === 3)!;

  await prisma.clientProfile.upsert({
    where: { userId: sampleClient.id },
    update: {},
    create: {
      userId: sampleClient.id,
      dateOfBirth: new Date("1992-04-15"),
      gender: Gender.FEMALE,
      heightCm: 165,
      emergencyContactName: "Rania Haddad",
      emergencyContactPhone: "+961 70 444 555",
      fitnessGoal: "Improve strength and body composition over 6 months.",
      medicalNotes: "No known conditions. Cleared for moderate-intensity training.",
      injuries: "Previous mild right knee discomfort (2024); avoid deep flexion under load.",
      activityLevel: ActivityLevel.MODERATE,
      joinDate: new Date("2025-11-01"),
      coachNotes: "Responds well to structured progressive overload.",
      assignedPlanId: assignedPlan.id,
      status: ClientStatus.ACTIVE,
    },
  });

  console.log(`  Client: ${sampleClient.fullName}`);

  // ─── Sample subscription ───────────────────────────────────────────────────

  const subscriptionStart = new Date("2025-11-01");
  const nextBilling = new Date("2025-12-01");

  const subscription = await prisma.subscription.upsert({
    where: { id: "seed-subscription-layla" },
    update: {},
    create: {
      id: "seed-subscription-layla",
      clientId: sampleClient.id,
      planId: assignedPlan.id,
      startDate: subscriptionStart,
      endDate: null,
      nextBillingDate: nextBilling,
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
    },
  });

  console.log(`  Subscription: ${assignedPlan.name}`);

  // ─── Sample payment ────────────────────────────────────────────────────────

  const payment = await prisma.payment.upsert({
    where: { id: "seed-payment-layla-nov" },
    update: {},
    create: {
      id: "seed-payment-layla-nov",
      clientId: sampleClient.id,
      subscriptionId: subscription.id,
      amount: assignedPlan.monthlyPrice,
      currency: "USD",
      paymentDate: new Date("2025-11-02"),
      dueDate: new Date("2025-11-01"),
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      notes: "November membership — paid in studio.",
    },
  });

  console.log(`  Payment: ${payment.amount} ${payment.currency} (${payment.status})`);

  // ─── Sample body measurement ───────────────────────────────────────────────

  const bodyMeasurement = await prisma.bodyMeasurement.upsert({
    where: { id: "seed-measurement-layla-1" },
    update: {},
    create: {
      id: "seed-measurement-layla-1",
      clientId: sampleClient.id,
      measuredAt: new Date("2025-11-05T10:30:00.000Z"),
      weightKg: 62.4,
      heightCmSnapshot: 165,
      bmi: 22.9,
      bodyFatPercentage: 28.5,
      bodyFatKg: 17.8,
      musclePercentage: 32.1,
      muscleKg: 20.0,
      waterPercentage: 52.0,
      waterLiters: 32.4,
      waistCm: 74.0,
      hipsCm: 98.0,
      notes: "Baseline assessment — first session.",
      coachAssessment: "Good baseline; focus on core stability and lower-body strength.",
    },
  });

  console.log(`  Body measurement: ${bodyMeasurement.measuredAt.toISOString()}`);

  // ─── Sample schedule slot & booking ──────────────────────────────────────────

  const slotStart = new Date("2025-11-10T08:00:00.000Z");
  const slotEnd = new Date("2025-11-10T09:00:00.000Z");

  const scheduleSlot = await prisma.scheduleSlot.upsert({
    where: { id: "seed-slot-karim-morning" },
    update: {},
    create: {
      id: "seed-slot-karim-morning",
      ownerId: gymOwner.id,
      startTime: slotStart,
      endTime: slotEnd,
      status: ScheduleSlotStatus.BOOKED,
      maxClients: 1,
      notes: "Morning private session slot.",
    },
  });

  const booking = await prisma.booking.upsert({
    where: { id: "seed-booking-layla-1" },
    update: {},
    create: {
      id: "seed-booking-layla-1",
      clientId: sampleClient.id,
      ownerId: gymOwner.id,
      scheduleSlotId: scheduleSlot.id,
      startTime: slotStart,
      endTime: slotEnd,
      status: BookingStatus.APPROVED,
      requestedBy: BookingRequestedBy.CLIENT,
      approvedAt: new Date("2025-11-06T14:00:00.000Z"),
      notes: "First approved private session.",
    },
  });

  console.log(`  Booking: ${booking.status} on ${booking.startTime.toISOString()}`);

  console.log("\nSeed completed successfully.");
  console.log("\nSample credentials (change in production):");
  console.log(`  Owner:   owner@adrenalinefitness.lb / ${ownerPassword}`);
  console.log(`  Admin:   admin@adrenalinefitness.lb / ${adminPassword}`);
  console.log(`  Client:  layla.haddad@example.com / ${clientPassword}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
