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
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "anwargreige@afc.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "1234";
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@afc.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "1234";
  const clientEmail = process.env.SEED_CLIENT_EMAIL ?? "client@afc.com";
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "1234";

  const [ownerHash, adminHash, clientHash] = await Promise.all([
    hashPassword(ownerPassword),
    hashPassword(adminPassword),
    hashPassword(clientPassword),
  ]);

  console.log("Seeding Adrenaline Fitness Center database...");

  // ─── Business ──────────────────────────────────────────────────────────────

  const business = await prisma.business.upsert({
    where: { id: "seed-business-adrenaline" },
    update: {
      name: "Adrenaline Fitness Center",
    },
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
    where: { email: ownerEmail },
    update: {
      fullName: "Anwar Greige",
      phoneNumber: "+96100000001",
      passwordHash: ownerHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: "Anwar Greige",
      email: ownerEmail,
      phoneNumber: "+96100000001",
      passwordHash: ownerHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const developerAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "Admin Developer",
      phoneNumber: "+96100000002",
      passwordHash: adminHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: "Admin Developer",
      email: adminEmail,
      phoneNumber: "+96100000002",
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
        update: {
          name: `${plan.sessionsPerWeek} private sessions/week`,
          sessionsPerWeek: plan.sessionsPerWeek,
          monthlyPrice: plan.monthlyPrice,
          currency: "USD",
          isActive: true,
        },
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
        update: {
          description: `${name} exercises and programming.`,
        },
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
    where: { email: clientEmail },
    update: {
      fullName: "Test Client",
      phoneNumber: "+96100000003",
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: "Test Client",
      email: clientEmail,
      phoneNumber: "+96100000003",
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    },
  });

  const assignedPlan = plans.find((p) => p.sessionsPerWeek === 3)!;

  await prisma.clientProfile.upsert({
    where: { userId: sampleClient.id },
    update: {
      assignedPlanId: assignedPlan.id,
      status: ClientStatus.ACTIVE,
    },
    create: {
      userId: sampleClient.id,
      dateOfBirth: new Date("1992-04-15"),
      gender: Gender.FEMALE,
      heightCm: 165,
      emergencyContactName: "Emergency Contact",
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

  console.log(`  Client: ${sampleClient.fullName} (${clientEmail})`);

  // ─── Sample subscription ───────────────────────────────────────────────────

  const subscriptionStart = new Date("2025-11-01");
  const nextBilling = new Date("2025-12-01");

  const subscription = await prisma.subscription.upsert({
    where: { id: "seed-subscription-client" },
    update: {
      clientId: sampleClient.id,
      planId: assignedPlan.id,
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
    },
    create: {
      id: "seed-subscription-client",
      clientId: sampleClient.id,
      planId: assignedPlan.id,
      startDate: subscriptionStart,
      endDate: null,
      nextBillingDate: nextBilling,
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
    },
  });

  console.log(`  Subscription: ${assignedPlan.name} (${subscription.status})`);

  // ─── Sample payment ────────────────────────────────────────────────────────

  const payment = await prisma.payment.upsert({
    where: { id: "seed-payment-client-nov" },
    update: {
      clientId: sampleClient.id,
      subscriptionId: subscription.id,
      amount: assignedPlan.monthlyPrice,
      status: PaymentStatus.PAID,
    },
    create: {
      id: "seed-payment-client-nov",
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
    where: { id: "seed-measurement-client-1" },
    update: {
      clientId: sampleClient.id,
    },
    create: {
      id: "seed-measurement-client-1",
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
    where: { id: "seed-slot-owner-morning" },
    update: {
      ownerId: gymOwner.id,
      status: ScheduleSlotStatus.BOOKED,
    },
    create: {
      id: "seed-slot-owner-morning",
      ownerId: gymOwner.id,
      startTime: slotStart,
      endTime: slotEnd,
      status: ScheduleSlotStatus.BOOKED,
      maxClients: 1,
      notes: "Morning private session slot.",
    },
  });

  const booking = await prisma.booking.upsert({
    where: { id: "seed-booking-client-1" },
    update: {
      clientId: sampleClient.id,
      ownerId: gymOwner.id,
      scheduleSlotId: scheduleSlot.id,
      status: BookingStatus.APPROVED,
    },
    create: {
      id: "seed-booking-client-1",
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
  console.log("\nLocal test credentials:");
  console.log(`  Owner:  ${ownerEmail} / (password from SEED_OWNER_PASSWORD)`);
  console.log(`  Admin:  ${adminEmail} / (password from SEED_ADMIN_PASSWORD)`);
  console.log(`  Client: ${clientEmail} / (password from SEED_CLIENT_PASSWORD)`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
