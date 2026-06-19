import {
  BookingStatus,
  PaymentStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { endOfMonth, startOfMonth } from "@/server/utils/dates";

export type ClientGrowthTrend = "INCREASING" | "STABLE" | "DECLINING";

export async function getOwnerDashboardSummary() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
  );
  const previousMonthEnd = endOfMonth(previousMonthStart);

  const [
    totalClients,
    activeClients,
    frozenClients,
    revenueAgg,
    unpaidPaymentsCount,
    overduePaymentsCount,
    upcomingBookingsCount,
    completedBookingsThisMonth,
    newClientsThisMonth,
    newClientsPreviousMonth,
  ] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.CLIENT } }),
    prisma.user.count({
      where: { role: UserRole.CLIENT, status: UserStatus.ACTIVE },
    }),
    prisma.user.count({
      where: { role: UserRole.CLIENT, status: UserStatus.FROZEN },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.PAID,
        paymentDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { status: PaymentStatus.UNPAID },
    }),
    prisma.payment.count({
      where: { status: PaymentStatus.OVERDUE },
    }),
    prisma.booking.count({
      where: {
        status: BookingStatus.APPROVED,
        startTime: { gte: now },
      },
    }),
    prisma.booking.count({
      where: {
        status: BookingStatus.COMPLETED,
        startTime: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
  ]);

  let clientGrowthTrend: ClientGrowthTrend = "STABLE";

  if (newClientsThisMonth > newClientsPreviousMonth) {
    clientGrowthTrend = "INCREASING";
  } else if (newClientsThisMonth < newClientsPreviousMonth) {
    clientGrowthTrend = "DECLINING";
  }

  return {
    totalClients,
    activeClients,
    frozenClients,
    totalRevenueThisMonth: Number(revenueAgg._sum.amount ?? 0),
    unpaidPaymentsCount,
    overduePaymentsCount,
    upcomingBookingsCount,
    completedBookingsThisMonth,
    newClientsThisMonth,
    clientGrowthTrend,
  };
}
