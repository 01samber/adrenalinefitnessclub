import {
  BookingStatus,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import { NotFoundError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import type { PaymentListQuery } from "@/server/validations/payment.validation";
import type { BookingListQuery } from "@/server/validations/booking.validation";
import type { MeasurementListQuery } from "@/server/validations/measurement.validation";
import { parsePagination, paginate } from "@/server/utils/pagination";
import { toSafeUser } from "@/server/utils/safe-user";
import { countUnreadNotifications, listUserNotifications } from "@/server/services/notification.service";

export async function getClientMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: UserRole.CLIENT },
    include: {
      clientProfile: {
        include: { assignedPlan: true },
      },
    },
  });

  if (!user?.clientProfile) {
    throw new NotFoundError("Client profile not found");
  }

  const [
    activeSubscription,
    latestPayment,
    latestMeasurement,
    upcomingBookings,
    unreadNotifications,
    notifications,
    recentPayments,
    recentBodyMeasurements,
    recentBookings,
    progressNotes,
  ] = await Promise.all([
    prisma.subscription.findFirst({
      where: { clientId: userId, status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findFirst({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bodyMeasurement.findFirst({
      where: { clientId: userId },
      orderBy: { measuredAt: "desc" },
    }),
    prisma.booking.findMany({
      where: {
        clientId: userId,
        status: { in: [BookingStatus.APPROVED, BookingStatus.REQUESTED] },
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    countUnreadNotifications(userId),
    listUserNotifications(userId),
    prisma.payment.findMany({
      where: { clientId: userId },
      orderBy: { dueDate: "desc" },
      take: 5,
    }),
    prisma.bodyMeasurement.findMany({
      where: { clientId: userId },
      orderBy: { measuredAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { clientId: userId },
      orderBy: { startTime: "desc" },
      take: 10,
    }),
    prisma.progressNote.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    user: toSafeUser(user),
    profile: user.clientProfile,
    assignedPlan: user.clientProfile.assignedPlan,
    activeSubscription,
    latestPayment,
    latestBodyMeasurement: latestMeasurement,
    coachAssessment: latestMeasurement?.coachAssessment ?? null,
    upcomingBookings,
    recentBookings,
    recentPayments,
    recentBodyMeasurements,
    progressNotes,
    unreadNotificationsCount: unreadNotifications,
    notifications,
  };
}

export async function getClientPayments(userId: string, query: PaymentListQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    clientId: userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { dueDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return paginate(items, page, limit, total);
}

export async function getClientBookings(userId: string, query: BookingListQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    clientId: userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startTime: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return paginate(items, page, limit, total);
}

export async function getClientMeasurements(
  userId: string,
  query: MeasurementListQuery,
) {
  const { page, limit, skip } = parsePagination(query);

  const where = { clientId: userId };

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
