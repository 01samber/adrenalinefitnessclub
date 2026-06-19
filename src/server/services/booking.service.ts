import {
  BookingRequestedBy,
  BookingStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import type {
  BookingListQuery,
  CreateBookingRequestInput,
  OwnerBookingDecisionInput,
  OwnerCreateBookingInput,
} from "@/server/validations/booking.validation";
import { isValidDateRange, toDateOnly } from "@/server/utils/dates";
import { parsePagination, paginate } from "@/server/utils/pagination";

function buildBookingWhere(query: BookingListQuery, clientId?: string) {
  const startTimeFilter: { gte?: Date; lte?: Date } = {};

  if (query.fromDate) {
    startTimeFilter.gte = toDateOnly(query.fromDate);
  }

  if (query.toDate) {
    const end = toDateOnly(query.toDate);
    end.setUTCHours(23, 59, 59, 999);
    startTimeFilter.lte = end;
  }

  return {
    ...(clientId ? { clientId } : {}),
    ...(query.clientId && !clientId ? { clientId: query.clientId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(Object.keys(startTimeFilter).length > 0
      ? { startTime: startTimeFilter }
      : {}),
  };
}

async function validateOwner(ownerId: string) {
  const owner = await prisma.user.findFirst({
    where: { id: ownerId, role: UserRole.OWNER, status: UserStatus.ACTIVE },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  return owner;
}

async function validateClient(clientId: string) {
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: UserRole.CLIENT, status: UserStatus.ACTIVE },
  });

  if (!client) {
    throw new NotFoundError("Client not found");
  }

  return client;
}

export async function listOwnerBookings(query: BookingListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildBookingWhere(query);

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

export async function listClientBookings(userId: string, query: BookingListQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildBookingWhere(query, userId);

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

export async function createClientBookingRequest(
  userId: string,
  input: CreateBookingRequestInput,
) {
  await validateClient(userId);
  await validateOwner(input.ownerId);

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (!isValidDateRange(startTime, endTime)) {
    throw new ValidationError("End time must be after start time");
  }

  const booking = await prisma.booking.create({
    data: {
      clientId: userId,
      ownerId: input.ownerId,
      startTime,
      endTime,
      status: BookingStatus.REQUESTED,
      requestedBy: BookingRequestedBy.CLIENT,
      notes: input.notes ?? null,
    },
  });

  return booking;
}

export async function createOwnerBooking(
  input: OwnerCreateBookingInput,
  actorUserId: string,
) {
  await validateClient(input.clientId);
  const ownerId = input.ownerId ?? actorUserId;
  await validateOwner(ownerId);

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (!isValidDateRange(startTime, endTime)) {
    throw new ValidationError("End time must be after start time");
  }

  const booking = await prisma.booking.create({
    data: {
      clientId: input.clientId,
      ownerId,
      startTime,
      endTime,
      status: BookingStatus.APPROVED,
      requestedBy: BookingRequestedBy.OWNER,
      approvedAt: new Date(),
      notes: input.notes ?? null,
    },
  });

  await createAuditLog({
    actorUserId,
    action: "booking.created",
    entityType: "Booking",
    entityId: booking.id,
  });

  return booking;
}

async function getBookingOrThrow(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  return booking;
}

export async function approveBooking(bookingId: string, actorUserId: string) {
  const existing = await getBookingOrThrow(bookingId);

  if (existing.status !== BookingStatus.REQUESTED) {
    throw new ValidationError("Only requested bookings can be approved");
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.APPROVED,
      approvedAt: new Date(),
    },
  });

  await createAuditLog({
    actorUserId,
    action: "booking.approved",
    entityType: "Booking",
    entityId: booking.id,
  });

  return booking;
}

export async function rejectBooking(
  bookingId: string,
  input: OwnerBookingDecisionInput,
  actorUserId: string,
) {
  const existing = await getBookingOrThrow(bookingId);

  if (existing.status !== BookingStatus.REQUESTED) {
    throw new ValidationError("Only requested bookings can be rejected");
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.REJECTED,
      rejectedAt: new Date(),
      cancellationReason: input.cancellationReason ?? "Rejected by owner",
    },
  });

  await createAuditLog({
    actorUserId,
    action: "booking.rejected",
    entityType: "Booking",
    entityId: booking.id,
  });

  return booking;
}

export async function cancelBooking(
  bookingId: string,
  input: OwnerBookingDecisionInput,
  actorUserId: string,
) {
  const existing = await getBookingOrThrow(bookingId);

  if (
    existing.status === BookingStatus.CANCELLED ||
    existing.status === BookingStatus.COMPLETED
  ) {
    throw new ValidationError("Booking cannot be cancelled");
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: input.cancellationReason ?? "Cancelled by owner",
    },
  });

  await createAuditLog({
    actorUserId,
    action: "booking.cancelled",
    entityType: "Booking",
    entityId: booking.id,
  });

  return booking;
}
